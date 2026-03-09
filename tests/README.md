# SIIL Testing Guide

## Overview

This directory contains all tests for the SIIL (Sistema Integral de Información del Litio) project. The project uses Jest as the testing framework, configured for ES modules and browser environment mocking.

## Test Structure

```
tests/
├── setup.js                    # Jest setup file with browser API mocks
├── example.test.js             # Example tests demonstrating configuration
├── core/                       # Tests for core modules
│   ├── state-manager.test.js
│   ├── storage.test.js
│   ├── validator.test.js
│   └── utils.test.js
├── services/                   # Tests for services
│   ├── barreno-service.test.js
│   ├── muestra-service.test.js
│   └── inegi-service.test.js
├── calculators/                # Tests for calculators
│   ├── tcr-calculator.test.js
│   └── litio-calculator.test.js
└── integration/                # Integration tests
    ├── registro-barreno.test.js
    └── registro-muestra.test.js
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with verbose output
```bash
npm run test:verbose
```

## Writing Tests

### Basic Test Structure

```javascript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Testing with localStorage

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';

describe('Storage Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save data to localStorage', () => {
    const data = { id: '1', name: 'Test' };
    localStorage.setItem('test', JSON.stringify(data));
    
    const retrieved = JSON.parse(localStorage.getItem('test'));
    expect(retrieved).toEqual(data);
  });
});
```

### Testing Async Functions

```javascript
test('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Testing with Mocks

```javascript
import { jest } from '@jest/globals';

test('should call callback', () => {
  const callback = jest.fn();
  someFunction(callback);
  
  expect(callback).toHaveBeenCalled();
  expect(callback).toHaveBeenCalledWith('expected-arg');
});
```

## Browser API Mocks

The following browser APIs are mocked in `setup.js`:

- **localStorage**: Full implementation with getItem, setItem, removeItem, clear
- **IndexedDB**: Basic mock for database operations
- **Geolocation API**: Mock with default coordinates (Sonora, Mexico)
- **Fetch API**: Mock for HTTP requests
- **Blob/File**: Mock for file handling
- **FileReader**: Mock for reading files

## Coverage Requirements

The project requires >80% coverage for core modules:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
   - Good: `should calculate TCR correctly when recovery is 85%`
   - Bad: `test1`

2. **Arrange-Act-Assert**: Structure tests with clear sections
   ```javascript
   // Arrange
   const input = setupTestData();
   
   // Act
   const result = functionUnderTest(input);
   
   // Assert
   expect(result).toBe(expected);
   ```

3. **One Assertion Per Test**: Focus each test on a single behavior
   - Exception: Related assertions that verify the same behavior

4. **Clean Up**: Always clean up after tests (clear localStorage, reset mocks)

5. **Avoid Test Interdependence**: Each test should run independently

6. **Mock External Dependencies**: Don't make real API calls in tests

7. **Test Edge Cases**: Include tests for:
   - Empty inputs
   - Null/undefined values
   - Boundary values
   - Error conditions

## Example Test Cases

### Unit Test Example

```javascript
// tests/calculators/tcr-calculator.test.js
import { describe, test, expect } from '@jest/globals';
import { calcularTCR, validarTCR } from '../../js/calculators/tcr-calculator.js';

describe('TCR Calculator', () => {
  describe('calcularTCR', () => {
    test('should calculate TCR correctly', () => {
      const tcr = calcularTCR(85, 100);
      expect(tcr).toBe(85);
    });

    test('should handle zero perforated length', () => {
      const tcr = calcularTCR(0, 0);
      expect(tcr).toBe(0);
    });
  });

  describe('validarTCR', () => {
    test('should validate TCR for igneous rocks', () => {
      const result = validarTCR(92, 'Rocas ígneas intrusivas y extrusivas masivas');
      expect(result.valido).toBe(true);
      expect(result.requiereJustificacion).toBe(false);
    });

    test('should require justification for low TCR', () => {
      const result = validarTCR(70, 'Depósitos de arcilla, limo y conglomerados');
      expect(result.valido).toBe(false);
      expect(result.requiereJustificacion).toBe(true);
    });
  });
});
```

### Integration Test Example

```javascript
// tests/integration/registro-muestra.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { BarrenoService } from '../../js/services/barreno-service.js';
import { MuestraService } from '../../js/services/muestra-service.js';

describe('Registro de Muestra - Integration', () => {
  let barrenoService;
  let muestraService;

  beforeEach(() => {
    localStorage.clear();
    barrenoService = new BarrenoService();
    muestraService = new MuestraService();
  });

  test('should register muestra with valid barreno', async () => {
    // Arrange: Create barreno first
    const barreno = {
      proyecto: 'SEFMP.31',
      estado: 'Sonora',
      municipio: 'Hermosillo',
      // ... other fields
    };
    const barrenoCreado = await barrenoService.crear(barreno);

    // Act: Create muestra referencing barreno
    const muestra = {
      fuente: 'Arcillas',
      tipo: 'Núcleo',
      barreno: barrenoCreado.id,
      intervalo: 'INT-01'
    };
    const muestraCreada = await muestraService.crear(muestra);

    // Assert
    expect(muestraCreada).toBeDefined();
    expect(muestraCreada.referenciaBarreno.id).toBe(barrenoCreado.id);
  });
});
```

## Troubleshooting

### ES Modules Issues

If you encounter ES module errors, ensure:
1. `"type": "module"` is in package.json
2. Using `--experimental-vm-modules` flag in test scripts
3. Importing from '@jest/globals' instead of global jest

### Coverage Not Generated

If coverage is not generated:
1. Check `collectCoverageFrom` patterns in jest.config.js
2. Ensure test files match `testMatch` patterns
3. Run with `--coverage` flag

### Browser API Not Mocked

If a browser API is not available:
1. Check if it's mocked in `tests/setup.js`
2. Add the mock if missing
3. Ensure `setupFilesAfterEnv` is configured in jest.config.js

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest ES Modules](https://jestjs.io/docs/ecmascript-modules)
- [Testing Best Practices](https://testingjavascript.com/)
