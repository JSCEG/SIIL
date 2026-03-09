# SIIL Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Configuration Overview

### Jest Configuration (`jest.config.js`)

The project is configured for:
- **ES Modules**: Full support for `import/export` syntax
- **Node Environment**: Tests run in Node.js with browser API mocks
- **Coverage Target**: >80% for branches, functions, lines, and statements
- **Browser API Mocking**: localStorage, IndexedDB, Geolocation, Fetch, File APIs

### Test Setup (`tests/setup.js`)

Provides mocks for browser APIs:
- **localStorage**: Full CRUD operations
- **IndexedDB**: Basic database operations
- **Geolocation API**: Mock coordinates (Sonora, Mexico)
- **Fetch API**: Mock HTTP requests
- **Blob/File/FileReader**: File handling mocks

## Project Structure

```
tests/
├── setup.js                    # Jest setup with browser mocks
├── example.test.js             # Example tests (can be deleted)
├── README.md                   # Detailed testing documentation
├── core/                       # Tests for js/core/
├── services/                   # Tests for js/services/
├── calculators/                # Tests for js/calculators/
├── components/                 # Tests for js/components/
└── integration/                # Integration tests
```

## Writing Tests

### Basic Test Template

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { functionToTest } from '../js/module.js';

describe('Module Name', () => {
  beforeEach(() => {
    // Setup before each test
    localStorage.clear();
  });

  test('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Testing with localStorage

```javascript
test('should save and retrieve from localStorage', () => {
  const data = { id: '1', name: 'Test' };
  localStorage.setItem('key', JSON.stringify(data));
  
  const retrieved = JSON.parse(localStorage.getItem('key'));
  expect(retrieved).toEqual(data);
});
```

### Testing Async Functions

```javascript
test('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing with Mocks

```javascript
import { jest } from '@jest/globals';

test('should call callback function', () => {
  const mockCallback = jest.fn();
  functionWithCallback(mockCallback);
  
  expect(mockCallback).toHaveBeenCalled();
  expect(mockCallback).toHaveBeenCalledWith('expected-argument');
});
```

## Coverage Requirements

The project requires **>80% coverage** for core modules:

| Metric      | Threshold |
|-------------|-----------|
| Branches    | 80%       |
| Functions   | 80%       |
| Lines       | 80%       |
| Statements  | 80%       |

### Viewing Coverage Reports

After running `npm run test:coverage`, open:
- **HTML Report**: `coverage/lcov-report/index.html`
- **Terminal**: Summary displayed after test run
- **LCOV**: `coverage/lcov.info` (for CI/CD integration)

## Test Examples by Module

### Core Modules

#### State Manager Test
```javascript
// tests/core/state-manager.test.js
import { describe, test, expect } from '@jest/globals';
import { StateManager } from '../../js/core/state-manager.js';

describe('StateManager', () => {
  test('should get and set state', () => {
    const manager = new StateManager();
    manager.set('key', 'value');
    expect(manager.get('key')).toBe('value');
  });

  test('should notify subscribers on change', () => {
    const manager = new StateManager();
    const callback = jest.fn();
    
    manager.subscribe('key', callback);
    manager.set('key', 'new-value');
    
    expect(callback).toHaveBeenCalledWith('new-value');
  });
});
```

#### Validator Test
```javascript
// tests/core/validator.test.js
import { describe, test, expect } from '@jest/globals';
import { validarCoordenadas } from '../../js/core/validator.js';

describe('Validator', () => {
  describe('validarCoordenadas', () => {
    test('should accept valid coordinates', () => {
      const result = validarCoordenadas(29.0729, -110.9559, 200);
      expect(result).toBe(true);
    });

    test('should reject latitude out of range', () => {
      const result = validarCoordenadas(40.0, -110.9559, 200);
      expect(result).toBe(false);
    });

    test('should reject negative altitude', () => {
      const result = validarCoordenadas(29.0729, -110.9559, -10);
      expect(result).toBe(false);
    });
  });
});
```

### Calculator Tests

#### TCR Calculator Test
```javascript
// tests/calculators/tcr-calculator.test.js
import { describe, test, expect } from '@jest/globals';
import { calcularTCR, validarTCR } from '../../js/calculators/tcr-calculator.js';

describe('TCR Calculator', () => {
  test('should calculate TCR correctly', () => {
    expect(calcularTCR(85, 100)).toBe(85);
    expect(calcularTCR(90, 100)).toBe(90);
  });

  test('should validate TCR for igneous rocks', () => {
    const result = validarTCR(92, 'Rocas ígneas intrusivas y extrusivas masivas');
    expect(result.valido).toBe(true);
    expect(result.limite).toBe(90);
  });

  test('should require justification for low TCR', () => {
    const result = validarTCR(70, 'Depósitos de arcilla, limo y conglomerados');
    expect(result.valido).toBe(false);
    expect(result.requiereJustificacion).toBe(true);
  });
});
```

### Service Tests

#### Barreno Service Test
```javascript
// tests/services/barreno-service.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { BarrenoService } from '../../js/services/barreno-service.js';

describe('BarrenoService', () => {
  let service;

  beforeEach(() => {
    localStorage.clear();
    service = new BarrenoService();
  });

  test('should create barreno', async () => {
    const barreno = {
      proyecto: 'SEFMP.31',
      estado: 'Sonora',
      municipio: 'Hermosillo'
    };

    const created = await service.crear(barreno);
    expect(created.id).toBeDefined();
    expect(created.proyecto).toBe('SEFMP.31');
  });

  test('should generate unique ID', async () => {
    const barreno1 = await service.crear({ proyecto: 'TEST' });
    const barreno2 = await service.crear({ proyecto: 'TEST' });
    
    expect(barreno1.id).not.toBe(barreno2.id);
  });

  test('should list all barrenos', async () => {
    await service.crear({ proyecto: 'TEST1' });
    await service.crear({ proyecto: 'TEST2' });
    
    const list = await service.listarTodos();
    expect(list).toHaveLength(2);
  });
});
```

### Integration Tests

```javascript
// tests/integration/registro-muestra-nucleo.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { BarrenoService } from '../../js/services/barreno-service.js';
import { MuestraService } from '../../js/services/muestra-service.js';

describe('Registro de Muestra - Flujo Núcleo', () => {
  let barrenoService;
  let muestraService;

  beforeEach(() => {
    localStorage.clear();
    barrenoService = new BarrenoService();
    muestraService = new MuestraService();
  });

  test('should allow muestra registration with valid barreno', async () => {
    // Create barreno first
    const barreno = await barrenoService.crear({
      proyecto: 'TEST',
      estado: 'Sonora',
      municipio: 'Hermosillo',
      intervalos: [{ id: 'INT-01', desde: 0, hasta: 10 }]
    });

    // Create muestra referencing barreno
    const muestra = await muestraService.crear({
      fuente: 'Arcillas',
      tipo: 'Núcleo',
      barreno: barreno.id,
      intervalo: 'INT-01'
    });

    expect(muestra.referenciaBarreno.id).toBe(barreno.id);
  });

  test('should block muestra registration without barreno', async () => {
    await expect(
      muestraService.crear({
        fuente: 'Arcillas',
        tipo: 'Núcleo'
      })
    ).rejects.toThrow('No hay barrenos disponibles');
  });
});
```

## Best Practices

### 1. Test Naming
Use descriptive names that explain the test:
```javascript
// Good
test('should calculate TCR correctly when recovery is 85%', () => {});

// Bad
test('test1', () => {});
```

### 2. Arrange-Act-Assert Pattern
```javascript
test('should do something', () => {
  // Arrange: Set up test data
  const input = 'test';
  
  // Act: Execute the function
  const result = functionToTest(input);
  
  // Assert: Verify the result
  expect(result).toBe('expected');
});
```

### 3. One Assertion Per Test
Focus each test on a single behavior:
```javascript
// Good
test('should return true for valid input', () => {
  expect(validate('valid')).toBe(true);
});

test('should return false for invalid input', () => {
  expect(validate('invalid')).toBe(false);
});

// Avoid (unless assertions are closely related)
test('should validate input', () => {
  expect(validate('valid')).toBe(true);
  expect(validate('invalid')).toBe(false);
  expect(validate('')).toBe(false);
});
```

### 4. Clean Up After Tests
```javascript
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases
```javascript
describe('Edge Cases', () => {
  test('should handle empty input', () => {});
  test('should handle null input', () => {});
  test('should handle undefined input', () => {});
  test('should handle boundary values', () => {});
  test('should handle error conditions', () => {});
});
```

### 6. Mock External Dependencies
```javascript
// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mock' })
  })
);
```

## Common Issues and Solutions

### Issue: ES Module Import Errors
**Solution**: Ensure `"type": "module"` is in package.json and use `--experimental-vm-modules` flag.

### Issue: localStorage Not Available
**Solution**: The mock is in `tests/setup.js`. Ensure `setupFilesAfterEnv` is configured in jest.config.js.

### Issue: Coverage Not Generated
**Solution**: Check `collectCoverageFrom` patterns in jest.config.js match your file structure.

### Issue: Tests Failing Due to Browser APIs
**Solution**: Add missing browser API mocks to `tests/setup.js`.

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest ES Modules](https://jestjs.io/docs/ecmascript-modules)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://testingjavascript.com/)

## Next Steps

1. Delete `tests/example.test.js` (it's just a demo)
2. Create test files for each module in `js/`
3. Aim for >80% coverage on core modules
4. Write integration tests for critical workflows
5. Run tests before committing code
