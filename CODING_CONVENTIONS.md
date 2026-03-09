# Convenciones de Código - SIIL

## Fecha de Creación
3 de marzo de 2026

## Propósito

Este documento establece las convenciones de código para el Sistema Integral de Información del Litio (SIIL). El objetivo es mantener un código consistente, legible y mantenible en todo el proyecto.

## Tabla de Contenidos

1. [Convenciones de Nombres](#convenciones-de-nombres)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Estilo de Código JavaScript](#estilo-de-código-javascript)
4. [Organización de Módulos](#organización-de-módulos)
5. [Documentación (JSDoc)](#documentación-jsdoc)
6. [Convenciones de Testing](#convenciones-de-testing)
7. [Convenciones de Git](#convenciones-de-git)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Convenciones de Nombres

### Archivos y Carpetas

**Regla General:** Usar `kebab-case` para todos los nombres de archivos y carpetas.

```
✅ Correcto:
- registro-muestras.html
- barreno-service.js
- tcr-calculator.js
- state-manager.js

❌ Incorrecto:
- registroMuestras.html
- BarrenoService.js
- TCRCalculator.js
- StateManager.js
```

**Archivos de Test:** Agregar sufijo `.test.js`

```
✅ Correcto:
- barreno-service.test.js
- tcr-calculator.test.js
- validator.test.js
```

### Variables y Funciones

**Regla General:** Usar `camelCase` para variables, funciones y métodos.

```javascript
✅ Correcto:
const muestraId = 'SIIL-MUE-001';
const longitudPerforada = 100.5;
let estadoAnalisis = 'pendiente';

function calcularTCR(longitudRecuperada, longitudPerforada) {
  return (longitudRecuperada / longitudPerforada) * 100;
}

const obtenerMuestra = (id) => {
  return catalogoMuestras.find((m) => m.id === id);
};

❌ Incorrecto:
const MuestraId = 'SIIL-MUE-001';
const longitud_perforada = 100.5;
let EstadoAnalisis = 'pendiente';

function CalcularTCR(longitud_recuperada, longitud_perforada) {
  return (longitud_recuperada / longitud_perforada) * 100;
}
```

### Clases

**Regla General:** Usar `PascalCase` para nombres de clases.

```javascript
✅ Correcto:
class BarrenoService {
  constructor() {
    this.catalogo = [];
  }
}

class StateManager {
  constructor() {
    this.state = {};
  }
}

class CalculadoraLitio {
  calcular(resultados) {
    // ...
  }
}

❌ Incorrecto:
class barrenoService { }
class state_manager { }
class calculadora_litio { }
```

### Constantes

**Regla General:** Usar `SCREAMING_SNAKE_CASE` para constantes globales.

**Prefijos Especiales:**
- `STORAGE_` para constantes de localStorage
- `API_` para constantes de endpoints de API

```javascript
✅ Correcto:
// Constantes de almacenamiento
const STORAGE_KEYS = {
  BARRENOS: 'siil_catalogo_barrenos_v1',
  MUESTRAS: 'siil_catalogo_muestras_v1',
  USUARIO: 'siil_usuario_actual'
};

const STORAGE_VERSION = '1.0.0';

// Constantes de API
const API_ENDPOINTS = {
  BARRENOS: '/api/v1/barrenos',
  MUESTRAS: '/api/v1/muestras',
  ANALISIS: '/api/v1/analisis'
};

const API_TIMEOUT = 5000;

// Otras constantes
const MAX_FILE_SIZE = 10485760; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

❌ Incorrecto:
const storageKeys = { ... };
const apiEndpoints = { ... };
const maxFileSize = 10485760;
```

**Constantes Locales:** Pueden usar `camelCase` si son específicas de un módulo.

```javascript
✅ Correcto (constantes locales):
const defaultTimeout = 3000;
const maxRetries = 3;
const validationRules = {
  latitud: { min: 14.0, max: 33.0 },
  longitud: { min: -118.5, max: -86.0 }
};
```

### Variables Privadas

**Regla General:** Usar prefijo `_` para indicar variables/métodos privados (convención, no enforcement).

```javascript
✅ Correcto:
class BarrenoService {
  constructor() {
    this._cache = new Map();
    this._initialized = false;
  }

  _validateBarreno(barreno) {
    // Método privado
  }

  crear(barreno) {
    this._validateBarreno(barreno);
    // Método público
  }
}
```

---

## Estructura de Archivos

### Organización de Carpetas

```
siil-registro-muestras/
├── css/                          # Estilos CSS
│   ├── base-theme.css
│   ├── shared-*.css
│   └── *-styles.css
├── js/                           # JavaScript
│   ├── core/                     # Módulos fundamentales
│   │   ├── state-manager.js
│   │   ├── storage.js
│   │   ├── validator.js
│   │   └── utils.js
│   ├── services/                 # Servicios de negocio
│   │   ├── barreno-service.js
│   │   ├── muestra-service.js
│   │   ├── analisis-campo-service.js
│   │   ├── analisis-lab-service.js
│   │   ├── inegi-service.js
│   │   ├── auth-service.js
│   │   └── sync-service.js
│   ├── components/               # Componentes reutilizables
│   │   ├── wizard.js
│   │   ├── form-builder.js
│   │   ├── catalog-selector.js
│   │   ├── file-uploader.js
│   │   └── map-viewer.js
│   ├── calculators/              # Calculadoras y algoritmos
│   │   ├── tcr-calculator.js
│   │   └── litio-calculator.js
│   ├── pages/                    # Lógica específica de páginas
│   │   ├── registro-barreno.js
│   │   ├── registro-muestra.js
│   │   ├── analisis-campo.js
│   │   └── dashboard.js
│   └── shared/                   # Código compartido
│       ├── auth.js
│       ├── preloader.js
│       └── shared-layout.js
├── tests/                        # Tests
│   ├── core/
│   ├── services/
│   ├── calculators/
│   └── integration/
├── img/                          # Imágenes
├── tipografias/                  # Fuentes
└── *.html                        # Páginas HTML
```

### Estructura de un Archivo JavaScript

**Orden de Elementos:**

1. Imports
2. Constantes
3. Variables de módulo
4. Funciones/Clases principales
5. Funciones auxiliares privadas
6. Exports

```javascript
// 1. IMPORTS
import { StateManager } from './core/state-manager.js';
import { validarCoordenadas, validarFechas } from './core/validator.js';
import { STORAGE_KEYS } from './core/constants.js';

// 2. CONSTANTES DEL MÓDULO
const MAX_BARRENOS = 1000;
const DEFAULT_INTERVALO = { desde: 0, hasta: 0 };

// 3. VARIABLES DE MÓDULO (si son necesarias)
let catalogoCache = null;

// 4. CLASE/FUNCIÓN PRINCIPAL
class BarrenoService {
  constructor() {
    this.stateManager = new StateManager();
  }

  crear(barreno) {
    this._validar(barreno);
    return this._guardar(barreno);
  }

  // 5. MÉTODOS AUXILIARES PRIVADOS
  _validar(barreno) {
    if (!validarCoordenadas(barreno.localizacion)) {
      throw new Error('Coordenadas inválidas');
    }
  }

  _guardar(barreno) {
    // Implementación
  }
}

// 6. EXPORTS
export { BarrenoService };
export default BarrenoService;
```

---

## Estilo de Código JavaScript

### Configuración Automática

El proyecto usa **ESLint** y **Prettier** para mantener consistencia automática.

**Comandos disponibles:**
```bash
npm run lint          # Verificar errores de linting
npm run lint:fix      # Corregir errores automáticamente
npm run format        # Formatear código con Prettier
npm run format:check  # Verificar formato sin modificar
```

### Reglas de Estilo Principales

#### 1. Punto y coma (Semicolons)

**Regla:** Siempre usar punto y coma al final de las declaraciones.

```javascript
✅ Correcto:
const nombre = 'Juan';
const edad = 30;
return resultado;

❌ Incorrecto:
const nombre = 'Juan'
const edad = 30
return resultado
```

#### 2. Comillas (Quotes)

**Regla:** Usar comillas simples (`'`) para strings. Permitir template literals cuando sea necesario.

```javascript
✅ Correcto:
const mensaje = 'Hola mundo';
const nombre = 'María';
const template = `Hola ${nombre}`;

❌ Incorrecto:
const mensaje = "Hola mundo";
const nombre = "María";
```

#### 3. Declaración de Variables

**Regla:** Usar `const` por defecto, `let` solo cuando sea necesario reasignar. **Nunca usar `var`**.

```javascript
✅ Correcto:
const PI = 3.14159;
const usuario = { nombre: 'Juan' };
let contador = 0;
contador++;

❌ Incorrecto:
var PI = 3.14159;
var usuario = { nombre: 'Juan' };
var contador = 0;
```

#### 4. Funciones Flecha (Arrow Functions)

**Regla:** Preferir arrow functions para callbacks. Siempre usar paréntesis en parámetros.

```javascript
✅ Correcto:
const numeros = [1, 2, 3];
const dobles = numeros.map((n) => n * 2);
const filtrados = numeros.filter((n) => n > 1);

setTimeout(() => {
  console.log('Timeout');
}, 1000);

❌ Incorrecto:
const dobles = numeros.map(n => n * 2);  // Falta paréntesis
const filtrados = numeros.filter(function(n) {  // Usar arrow function
  return n > 1;
});
```

#### 5. Comparaciones

**Regla:** Siempre usar comparación estricta (`===` y `!==`).

```javascript
✅ Correcto:
if (valor === 0) { }
if (nombre !== '') { }
if (resultado === null) { }

❌ Incorrecto:
if (valor == 0) { }
if (nombre != '') { }
if (resultado == null) { }
```

#### 6. Llaves (Braces)

**Regla:** Siempre usar llaves, incluso para bloques de una línea. Estilo 1TBS (One True Brace Style).

```javascript
✅ Correcto:
if (condicion) {
  hacerAlgo();
}

if (condicion) {
  hacerAlgo();
} else {
  hacerOtraCosa();
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}

❌ Incorrecto:
if (condicion) hacerAlgo();

if (condicion)
{
  hacerAlgo();
}

for (let i = 0; i < 10; i++)
  console.log(i);
```

#### 7. Longitud de Línea

**Regla:** Máximo 120 caracteres por línea. Dividir líneas largas de forma legible.

```javascript
✅ Correcto:
const mensaje = 
  'Este es un mensaje muy largo que necesita ser dividido en múltiples líneas para mantener legibilidad';

const resultado = calcularValor(
  parametro1,
  parametro2,
  parametro3,
  parametro4
);

❌ Incorrecto:
const mensaje = 'Este es un mensaje muy largo que necesita ser dividido en múltiples líneas para mantener legibilidad y no exceder 120 caracteres';
```

#### 8. Espaciado y Formato

**Regla:** Usar 2 espacios para indentación (no tabs).

```javascript
✅ Correcto:
function ejemplo() {
  if (condicion) {
    return true;
  }
  return false;
}

const objeto = {
  nombre: 'Juan',
  edad: 30,
  ciudad: 'CDMX'
};

❌ Incorrecto:
function ejemplo() {
    if (condicion) {  // 4 espacios
        return true;
    }
    return false;
}
```

#### 9. Comas Finales (Trailing Commas)

**Regla:** NO usar comas finales en objetos y arrays.

```javascript
✅ Correcto:
const objeto = {
  nombre: 'Juan',
  edad: 30
};

const array = [1, 2, 3];

❌ Incorrecto:
const objeto = {
  nombre: 'Juan',
  edad: 30,  // Coma final
};

const array = [1, 2, 3,];  // Coma final
```

#### 10. Template Literals

**Regla:** Usar template literals para concatenación de strings con variables.

```javascript
✅ Correcto:
const nombre = 'Juan';
const edad = 30;
const mensaje = `Hola, soy ${nombre} y tengo ${edad} años`;

❌ Incorrecto:
const mensaje = 'Hola, soy ' + nombre + ' y tengo ' + edad + ' años';
```

#### 11. Destructuring

**Regla:** Preferir destructuring para objetos cuando sea apropiado.

```javascript
✅ Correcto:
const { nombre, edad, ciudad } = usuario;
const { latitud, longitud } = coordenadas;

function procesarMuestra({ id, tipo, fuente }) {
  // Usar id, tipo, fuente directamente
}

❌ Incorrecto:
const nombre = usuario.nombre;
const edad = usuario.edad;
const ciudad = usuario.ciudad;

function procesarMuestra(muestra) {
  const id = muestra.id;
  const tipo = muestra.tipo;
  const fuente = muestra.fuente;
}
```

#### 12. Object Shorthand

**Regla:** Usar sintaxis abreviada para propiedades de objetos.

```javascript
✅ Correcto:
const nombre = 'Juan';
const edad = 30;

const usuario = {
  nombre,
  edad,
  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
};

❌ Incorrecto:
const usuario = {
  nombre: nombre,
  edad: edad,
  saludar: function() {
    return `Hola, soy ${this.nombre}`;
  }
};
```

#### 13. Números Mágicos

**Regla:** Evitar números mágicos. Usar constantes con nombres descriptivos.

```javascript
✅ Correcto:
const MAX_INTENTOS = 3;
const TIMEOUT_MS = 5000;
const LIMITE_TCR_IGNEAS = 90;

if (intentos > MAX_INTENTOS) {
  throw new Error('Máximo de intentos alcanzado');
}

❌ Incorrecto:
if (intentos > 3) {  // ¿Qué significa 3?
  throw new Error('Máximo de intentos alcanzado');
}

setTimeout(callback, 5000);  // ¿Por qué 5000?
```

**Excepciones permitidas:** -1, 0, 1, 2 (números comunes en índices y contadores).

---

## Organización de Módulos

### ES Modules

**Regla:** Usar ES Modules (`import`/`export`) en lugar de CommonJS.

```javascript
✅ Correcto:
// Exportar
export class BarrenoService { }
export function validarBarreno(barreno) { }
export default BarrenoService;

// Importar
import { BarrenoService, validarBarreno } from './services/barreno-service.js';
import BarrenoService from './services/barreno-service.js';

❌ Incorrecto:
// CommonJS (no usar)
module.exports = { BarrenoService };
const { BarrenoService } = require('./services/barreno-service.js');
```

### Imports

**Regla:** Agrupar imports por tipo y ordenar alfabéticamente.

```javascript
✅ Correcto:
// 1. Imports de módulos core
import { StateManager } from './core/state-manager.js';
import { Storage } from './core/storage.js';
import { validarCoordenadas, validarFechas } from './core/validator.js';

// 2. Imports de servicios
import { BarrenoService } from './services/barreno-service.js';
import { InegiService } from './services/inegi-service.js';

// 3. Imports de constantes
import { API_ENDPOINTS, STORAGE_KEYS } from './core/constants.js';

❌ Incorrecto:
import { BarrenoService } from './services/barreno-service.js';
import { STORAGE_KEYS } from './core/constants.js';
import { StateManager } from './core/state-manager.js';
import { InegiService } from './services/inegi-service.js';
```

### Exports

**Regla:** Preferir named exports. Usar default export solo para la clase/función principal del módulo.

```javascript
✅ Correcto:
// barreno-service.js
export class BarrenoService { }
export function validarBarreno(barreno) { }
export const TIPOS_BARRENACION = ['CD', 'RC', 'RAB'];
export default BarrenoService;

// Uso
import BarrenoService, { validarBarreno, TIPOS_BARRENACION } from './barreno-service.js';

❌ Incorrecto:
// Solo default export para todo
export default {
  BarrenoService,
  validarBarreno,
  TIPOS_BARRENACION
};
```

---

## Documentación (JSDoc)

### Funciones y Métodos Públicos

**Regla:** Documentar todas las funciones y métodos públicos con JSDoc.

```javascript
/**
 * Calcula el Total Core Recovery (TCR) de un barreno
 * @param {number} longitudRecuperada - Longitud del núcleo recuperado en metros
 * @param {number} longitudPerforada - Longitud total perforada en metros
 * @returns {number} Porcentaje de recuperación (0-100)
 * @throws {Error} Si los parámetros son inválidos
 * @example
 * const tcr = calcularTCR(85, 100);
 * console.log(tcr); // 85
 */
function calcularTCR(longitudRecuperada, longitudPerforada) {
  if (longitudPerforada <= 0) {
    throw new Error('Longitud perforada debe ser mayor a 0');
  }
  return (longitudRecuperada / longitudPerforada) * 100;
}

/**
 * Valida que el TCR esté dentro de los límites aceptables según el tipo de roca
 * @param {number} tcr - Valor de TCR calculado
 * @param {string} tipoRoca - Tipo de roca perforada
 * @returns {Object} Resultado de validación
 * @returns {boolean} returns.valido - Si el TCR es válido
 * @returns {number} returns.limite - Límite mínimo para el tipo de roca
 * @returns {boolean} returns.requiereJustificacion - Si requiere justificación
 */
function validarTCR(tcr, tipoRoca) {
  const limites = {
    'Rocas ígneas intrusivas y extrusivas masivas': 90,
    'Depósitos de arcilla, limo y conglomerados': 85,
    'Rocas volcánicas fracturadas / Tobas': 75
  };
  
  const limite = limites[tipoRoca] || 75;
  return {
    valido: tcr >= limite,
    limite,
    requiereJustificacion: tcr < limite
  };
}
```

### Clases

**Regla:** Documentar clases, constructores y métodos públicos.

```javascript
/**
 * Servicio para gestión de barrenos
 * Proporciona operaciones CRUD y validaciones para el catálogo de barrenos
 */
class BarrenoService {
  /**
   * Crea una instancia de BarrenoService
   * @param {StateManager} stateManager - Gestor de estado de la aplicación
   */
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.catalogo = [];
  }

  /**
   * Crea un nuevo barreno en el catálogo
   * @param {Object} barreno - Datos del barreno a crear
   * @param {string} barreno.proyecto - Código del proyecto
   * @param {Object} barreno.localizacion - Coordenadas del barreno
   * @returns {Promise<Object>} Barreno creado con ID generado
   * @throws {Error} Si la validación falla
   */
  async crear(barreno) {
    this._validar(barreno);
    const id = this._generarId(barreno);
    const barreno Completo = { ...barreno, id };
    this.catalogo.push(barrenoCompleto);
    return barrenoCompleto;
  }
}
```

### Tipos de Datos Complejos

**Regla:** Documentar estructuras de datos complejas con `@typedef`.

```javascript
/**
 * @typedef {Object} Barreno
 * @property {string} id - ID único del barreno
 * @property {string} proyecto - Código del proyecto
 * @property {Localizacion} localizacion - Coordenadas del barreno
 * @property {Ejecucion} ejecucion - Datos de ejecución
 * @property {Array<Intervalo>} intervalos - Intervalos de profundidad
 */

/**
 * @typedef {Object} Localizacion
 * @property {number} latitud - Latitud en grados decimales (14.0 a 33.0)
 * @property {number} longitud - Longitud en grados decimales (-118.5 a -86.0)
 * @property {number} altitud - Altitud en metros sobre el nivel del mar
 */

/**
 * Busca barrenos en el catálogo
 * @param {Object} filtros - Criterios de búsqueda
 * @returns {Array<Barreno>} Lista de barrenos que coinciden
 */
function buscarBarrenos(filtros) {
  // Implementación
}
```

### Comentarios en Código

**Regla:** Usar comentarios para explicar "por qué", no "qué".

```javascript
✅ Correcto:
// Usamos tolerancia de 0.001 para comparación de flotantes
// debido a imprecisiones en cálculos de punto flotante
if (Math.abs(valor1 - valor2) < 0.001) {
  return true;
}

// El primer intervalo siempre debe iniciar en 0 según especificación SIIL
if (intervalos[0].desde !== 0) {
  throw new Error('Primer intervalo debe iniciar en 0');
}

❌ Incorrecto:
// Compara si valor1 es igual a valor2
if (Math.abs(valor1 - valor2) < 0.001) {
  return true;
}

// Verifica si el primer intervalo es 0
if (intervalos[0].desde !== 0) {
  throw new Error('Primer intervalo debe iniciar en 0');
}
```

---

## Convenciones de Testing

### Estructura de Tests

**Regla:** Organizar tests con `describe` y `test` de Jest. Usar nombres descriptivos.

```javascript
// tests/calculators/tcr-calculator.test.js
import { describe, test, expect } from '@jest/globals';
import { calcularTCR, validarTCR } from '../../js/calculators/tcr-calculator.js';

describe('TCR Calculator', () => {
  describe('calcularTCR', () => {
    test('calcula TCR correctamente con valores válidos', () => {
      const resultado = calcularTCR(85, 100);
      expect(resultado).toBe(85);
    });

    test('calcula TCR con recuperación completa', () => {
      const resultado = calcularTCR(100, 100);
      expect(resultado).toBe(100);
    });

    test('lanza error si longitud perforada es 0', () => {
      expect(() => calcularTCR(50, 0)).toThrow('Longitud perforada debe ser mayor a 0');
    });
  });

  describe('validarTCR', () => {
    test('valida TCR correcto para rocas ígneas', () => {
      const resultado = validarTCR(92, 'Rocas ígneas intrusivas y extrusivas masivas');
      expect(resultado.valido).toBe(true);
      expect(resultado.requiereJustificacion).toBe(false);
    });

    test('requiere justificación si TCR es bajo', () => {
      const resultado = validarTCR(70, 'Depósitos de arcilla, limo y conglomerados');
      expect(resultado.valido).toBe(false);
      expect(resultado.requiereJustificacion).toBe(true);
    });
  });
});
```

### Nombres de Tests

**Regla:** Usar nombres descriptivos que expliquen el comportamiento esperado.

```javascript
✅ Correcto:
test('calcula TCR correctamente con valores válidos', () => { });
test('lanza error si longitud perforada es 0', () => { });
test('retorna array vacío si no hay barrenos en catálogo', () => { });
test('genera ID único con formato correcto', () => { });

❌ Incorrecto:
test('test1', () => { });
test('TCR', () => { });
test('funciona', () => { });
test('error', () => { });
```

### Cobertura de Tests

**Regla:** Mantener cobertura mínima de 80% para módulos core.

```bash
# Ejecutar tests con cobertura
npm run test:coverage

# Verificar cobertura en coverage/index.html
```

**Prioridades de Testing:**
1. **Crítico (100%):** Validaciones, cálculos, lógica de negocio
2. **Alto (>80%):** Servicios, gestión de estado
3. **Medio (>60%):** Componentes, utilidades
4. **Bajo:** UI, estilos

### Mocks y Fixtures

**Regla:** Crear fixtures reutilizables para datos de prueba.

```javascript
// tests/fixtures/barreno-fixtures.js
export const barrenoValido = {
  proyecto: 'SEFMP.31',
  perforista: 'Empresa A',
  localizacion: {
    latitud: 28.5,
    longitud: -110.2,
    altitud: 1500
  },
  ejecucion: {
    tipoBarrenacion: 'Corte Diamante (CD)',
    fechaInicio: '2026-01-01',
    fechaFinalizacion: '2026-01-15',
    longitudPerforada: 100
  },
  intervalos: [
    { id: 'INT-01', desde: 0, hasta: 50 },
    { id: 'INT-02', desde: 50, hasta: 100 }
  ]
};

export const barrenoInvalido = {
  proyecto: 'SEFMP.31',
  localizacion: {
    latitud: 50,  // Fuera de rango
    longitud: -110.2,
    altitud: 1500
  }
};

// Uso en tests
import { barrenoValido, barrenoInvalido } from '../fixtures/barreno-fixtures.js';

test('acepta barreno válido', () => {
  expect(() => validarBarreno(barrenoValido)).not.toThrow();
});

test('rechaza barreno con coordenadas inválidas', () => {
  expect(() => validarBarreno(barrenoInvalido)).toThrow('Coordenadas inválidas');
});
```

---

## Convenciones de Git

### Estructura de Commits

**Regla:** Usar Conventional Commits para mensajes claros y consistentes.

**Formato:**
```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan lógica)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**

```bash
✅ Correcto:
feat(barreno): agregar validación de intervalos continuos
fix(tcr): corregir cálculo cuando longitud es 0
docs(readme): actualizar instrucciones de instalación
test(validator): agregar tests para validación de coordenadas
refactor(storage): simplificar lógica de guardado
style(format): aplicar prettier a todos los archivos
chore(deps): actualizar dependencias de Jest

❌ Incorrecto:
agregado validacion
fix bug
cambios varios
WIP
asdf
```

### Alcance (Scope)

**Alcances comunes:**
- `barreno`: Relacionado con barrenos
- `muestra`: Relacionado con muestras
- `analisis`: Relacionado con análisis
- `auth`: Autenticación/autorización
- `ui`: Interfaz de usuario
- `core`: Módulos fundamentales
- `test`: Tests
- `docs`: Documentación
- `config`: Configuración

### Mensajes de Commit

**Reglas:**
1. Usar imperativo presente ("agregar" no "agregado" ni "agrega")
2. No capitalizar la primera letra
3. No usar punto final
4. Máximo 72 caracteres en la primera línea
5. Dejar línea en blanco antes del cuerpo (si existe)

```bash
✅ Correcto:
feat(muestra): implementar registro de muestras de salmuera

- Agregar formulario de captura de datos de salmuera
- Implementar validación de intervalo de producción
- Agregar generación de ID único
- Incluir tests unitarios

Closes #123

❌ Incorrecto:
Agregado el registro de muestras de salmuera con formulario y validaciones y tests.
```

### Branches

**Regla:** Usar nombres descriptivos con prefijos.

**Formato:** `<tipo>/<descripción-corta>`

**Tipos de branches:**
- `feature/`: Nueva funcionalidad
- `fix/`: Corrección de bug
- `refactor/`: Refactorización
- `docs/`: Documentación
- `test/`: Tests

**Ejemplos:**
```bash
✅ Correcto:
feature/registro-barreno
feature/calculadora-litio
fix/validacion-coordenadas
fix/tcr-calculo-division-cero
refactor/storage-service
docs/coding-conventions
test/barreno-service

❌ Incorrecto:
nueva-funcionalidad
arreglo
cambios
mi-branch
test
```

### Pull Requests

**Regla:** Incluir descripción clara y checklist.

**Template:**
```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (fix)
- [ ] Refactorización (refactor)
- [ ] Documentación (docs)
- [ ] Tests (test)

## Checklist
- [ ] El código sigue las convenciones del proyecto
- [ ] He ejecutado `npm run lint` sin errores
- [ ] He ejecutado `npm run format` 
- [ ] He agregado tests que prueban mi cambio
- [ ] Todos los tests pasan (`npm test`)
- [ ] He actualizado la documentación si es necesario
- [ ] He probado los cambios localmente

## Tests
Descripción de los tests agregados o modificados.

## Capturas de pantalla (si aplica)
Agregar capturas si hay cambios visuales.

## Issues relacionados
Closes #123
Refs #456
```

---

## Mejores Prácticas

### 1. Manejo de Errores

**Regla:** Siempre manejar errores de forma explícita.

```javascript
✅ Correcto:
async function obtenerMuestra(id) {
  try {
    const muestra = await muestraService.leer(id);
    if (!muestra) {
      throw new Error(`Muestra ${id} no encontrada`);
    }
    return muestra;
  } catch (error) {
    console.error('Error al obtener muestra:', error);
    throw error;  // Re-lanzar para que el llamador maneje
  }
}

// Uso
try {
  const muestra = await obtenerMuestra('SIIL-MUE-001');
  procesarMuestra(muestra);
} catch (error) {
  mostrarError('No se pudo cargar la muestra');
}

❌ Incorrecto:
async function obtenerMuestra(id) {
  const muestra = await muestraService.leer(id);  // Sin try-catch
  return muestra;
}

// Uso sin manejo de errores
const muestra = await obtenerMuestra('SIIL-MUE-001');
procesarMuestra(muestra);
```

### 2. Validación de Datos

**Regla:** Validar datos en el punto de entrada (funciones públicas, APIs).

```javascript
✅ Correcto:
class BarrenoService {
  crear(barreno) {
    // Validar en punto de entrada
    if (!barreno) {
      throw new Error('Barreno es requerido');
    }
    if (!barreno.proyecto) {
      throw new Error('Proyecto es requerido');
    }
    if (!validarCoordenadas(barreno.localizacion)) {
      throw new Error('Coordenadas inválidas');
    }
    
    return this._guardar(barreno);
  }

  _guardar(barreno) {
    // Método privado asume datos válidos
    this.catalogo.push(barreno);
    return barreno;
  }
}

❌ Incorrecto:
class BarrenoService {
  crear(barreno) {
    // Sin validación
    return this._guardar(barreno);
  }

  _guardar(barreno) {
    // Validar en método privado (tarde)
    if (!barreno || !barreno.proyecto) {
      throw new Error('Datos inválidos');
    }
    this.catalogo.push(barreno);
    return barreno;
  }
}
```

### 3. Inmutabilidad

**Regla:** Evitar mutaciones directas. Usar spread operator o métodos inmutables.

```javascript
✅ Correcto:
// Arrays
const numeros = [1, 2, 3];
const nuevosNumeros = [...numeros, 4];  // No muta original

const filtrados = numeros.filter((n) => n > 1);  // Retorna nuevo array

// Objetos
const usuario = { nombre: 'Juan', edad: 30 };
const usuarioActualizado = { ...usuario, edad: 31 };  // No muta original

// Actualizar en array
const muestras = [{ id: 1, estado: 'pendiente' }, { id: 2, estado: 'completo' }];
const muestrasActualizadas = muestras.map((m) =>
  m.id === 1 ? { ...m, estado: 'completo' } : m
);

❌ Incorrecto:
// Mutación directa
const numeros = [1, 2, 3];
numeros.push(4);  // Muta original

const usuario = { nombre: 'Juan', edad: 30 };
usuario.edad = 31;  // Muta original

const muestras = [{ id: 1, estado: 'pendiente' }];
muestras[0].estado = 'completo';  // Muta original
```

### 4. Funciones Puras

**Regla:** Preferir funciones puras (sin efectos secundarios) cuando sea posible.

```javascript
✅ Correcto:
// Función pura - mismo input, mismo output, sin efectos secundarios
function calcularTCR(longitudRecuperada, longitudPerforada) {
  return (longitudRecuperada / longitudPerforada) * 100;
}

function filtrarMuestrasPorTipo(muestras, tipo) {
  return muestras.filter((m) => m.tipo === tipo);
}

❌ Incorrecto:
// Función impura - modifica estado externo
let total = 0;
function sumarAlTotal(valor) {
  total += valor;  // Efecto secundario
  return total;
}

// Función impura - modifica parámetro
function agregarMuestra(catalogo, muestra) {
  catalogo.push(muestra);  // Muta parámetro
  return catalogo;
}
```

### 5. Separación de Responsabilidades

**Regla:** Cada función/clase debe tener una única responsabilidad.

```javascript
✅ Correcto:
// Cada función hace una cosa
function validarCoordenadas(localizacion) {
  const { latitud, longitud, altitud } = localizacion;
  return latitud >= 14.0 && latitud <= 33.0 &&
         longitud >= -118.5 && longitud <= -86.0 &&
         altitud > 0;
}

function generarIdBarreno(proyecto, estado, municipio) {
  const siglaProyecto = normalizeToken(proyecto);
  const siglaGeo = `${estado}${municipio}`;
  const consecutivo = obtenerConsecutivo();
  return `${siglaProyecto}-${siglaGeo}-BRN-${consecutivo}`;
}

function guardarBarreno(barreno) {
  const key = STORAGE_KEYS.BARRENOS;
  const catalogo = JSON.parse(localStorage.getItem(key) || '[]');
  catalogo.push(barreno);
  localStorage.setItem(key, JSON.stringify(catalogo));
}

❌ Incorrecto:
// Función hace demasiadas cosas
function crearBarreno(datos) {
  // Validar
  if (!validarCoordenadas(datos.localizacion)) {
    throw new Error('Coordenadas inválidas');
  }
  
  // Generar ID
  const id = `${datos.proyecto}-${datos.estado}-BRN-${Date.now()}`;
  
  // Guardar
  const catalogo = JSON.parse(localStorage.getItem('barrenos') || '[]');
  catalogo.push({ ...datos, id });
  localStorage.setItem('barrenos', JSON.stringify(catalogo));
  
  // Notificar
  console.log('Barreno creado');
  
  return { ...datos, id };
}
```

### 6. DRY (Don't Repeat Yourself)

**Regla:** Evitar duplicación de código. Extraer lógica común a funciones reutilizables.

```javascript
✅ Correcto:
// Función reutilizable
function obtenerDeCatalogo(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function guardarEnCatalogo(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

// Uso
const barrenos = obtenerDeCatalogo(STORAGE_KEYS.BARRENOS);
const muestras = obtenerDeCatalogo(STORAGE_KEYS.MUESTRAS);

guardarEnCatalogo(STORAGE_KEYS.BARRENOS, barrenosActualizados);
guardarEnCatalogo(STORAGE_KEYS.MUESTRAS, muestrasActualizadas);

❌ Incorrecto:
// Código duplicado
const barrenosData = localStorage.getItem(STORAGE_KEYS.BARRENOS);
const barrenos = barrenosData ? JSON.parse(barrenosData) : [];

const muestrasData = localStorage.getItem(STORAGE_KEYS.MUESTRAS);
const muestras = muestrasData ? JSON.parse(muestrasData) : [];

localStorage.setItem(STORAGE_KEYS.BARRENOS, JSON.stringify(barrenosActualizados));
localStorage.setItem(STORAGE_KEYS.MUESTRAS, JSON.stringify(muestrasActualizadas));
```

### 7. Nombres Descriptivos

**Regla:** Usar nombres que expliquen claramente el propósito.

```javascript
✅ Correcto:
const longitudPerforada = 100;
const longitudRecuperada = 85;
const porcentajeRecuperacion = calcularTCR(longitudRecuperada, longitudPerforada);

function validarIntervalosContiguos(intervalos) {
  // ...
}

function obtenerMuestrasPendientesDeAnalisis() {
  return muestras.filter((m) => !m.estadoAnalisis.completo);
}

❌ Incorrecto:
const lp = 100;
const lr = 85;
const pr = calc(lr, lp);

function validar(data) {
  // ...
}

function getMuestras() {
  return muestras.filter((m) => !m.estadoAnalisis.completo);
}
```

### 8. Async/Await sobre Promises

**Regla:** Preferir async/await para código asíncrono más legible.

```javascript
✅ Correcto:
async function cargarDatos() {
  try {
    const estados = await inegiService.getEstados();
    const municipios = await inegiService.getMunicipios(estados[0].cve);
    return { estados, municipios };
  } catch (error) {
    console.error('Error al cargar datos:', error);
    throw error;
  }
}

// Múltiples operaciones en paralelo
async function cargarTodosDatos() {
  try {
    const [barrenos, muestras, analisis] = await Promise.all([
      barrenoService.listarTodos(),
      muestraService.listarTodas(),
      analisisService.listarTodos()
    ]);
    return { barrenos, muestras, analisis };
  } catch (error) {
    console.error('Error al cargar datos:', error);
    throw error;
  }
}

❌ Incorrecto:
function cargarDatos() {
  return inegiService.getEstados()
    .then((estados) => {
      return inegiService.getMunicipios(estados[0].cve)
        .then((municipios) => {
          return { estados, municipios };
        });
    })
    .catch((error) => {
      console.error('Error al cargar datos:', error);
      throw error;
    });
}
```

### 9. Evitar Anidamiento Profundo

**Regla:** Limitar anidamiento a 3 niveles. Usar early returns y extraer funciones.

```javascript
✅ Correcto:
function procesarMuestra(muestra) {
  if (!muestra) {
    throw new Error('Muestra requerida');
  }
  
  if (!muestra.id) {
    throw new Error('ID de muestra requerido');
  }
  
  if (muestra.tipo !== 'Núcleo') {
    return procesarMuestraSuperficie(muestra);
  }
  
  return procesarMuestraNucleo(muestra);
}

function procesarMuestraNucleo(muestra) {
  if (!muestra.referenciaBarreno) {
    throw new Error('Referencia a barreno requerida');
  }
  
  const barreno = obtenerBarreno(muestra.referenciaBarreno.id);
  return validarYGuardar(muestra, barreno);
}

❌ Incorrecto:
function procesarMuestra(muestra) {
  if (muestra) {
    if (muestra.id) {
      if (muestra.tipo === 'Núcleo') {
        if (muestra.referenciaBarreno) {
          const barreno = obtenerBarreno(muestra.referenciaBarreno.id);
          if (barreno) {
            if (validar(muestra, barreno)) {
              return guardar(muestra);
            }
          }
        }
      }
    }
  }
  throw new Error('Datos inválidos');
}
```

### 10. Seguridad

**Regla:** Sanitizar inputs y evitar vulnerabilidades comunes.

```javascript
✅ Correcto:
// Sanitizar input antes de usar en DOM
function mostrarMensaje(mensaje) {
  const elemento = document.getElementById('mensaje');
  elemento.textContent = mensaje;  // textContent escapa HTML automáticamente
}

// Validar tipos
function calcularTCR(longitudRecuperada, longitudPerforada) {
  if (typeof longitudRecuperada !== 'number' || typeof longitudPerforada !== 'number') {
    throw new Error('Parámetros deben ser números');
  }
  if (longitudPerforada <= 0) {
    throw new Error('Longitud perforada debe ser mayor a 0');
  }
  return (longitudRecuperada / longitudPerforada) * 100;
}

// Validar rangos
function validarLatitud(latitud) {
  if (typeof latitud !== 'number' || isNaN(latitud)) {
    return false;
  }
  return latitud >= 14.0 && latitud <= 33.0;
}

❌ Incorrecto:
// Vulnerable a XSS
function mostrarMensaje(mensaje) {
  const elemento = document.getElementById('mensaje');
  elemento.innerHTML = mensaje;  // Peligroso si mensaje viene de usuario
}

// Sin validación de tipos
function calcularTCR(longitudRecuperada, longitudPerforada) {
  return (longitudRecuperada / longitudPerforada) * 100;  // Puede fallar con strings
}

// Sin validación de rangos
function validarLatitud(latitud) {
  return true;  // Acepta cualquier valor
}
```

---

## Herramientas de Desarrollo

### ESLint

Configuración en `.eslintrc.json`. Ejecutar antes de commit:

```bash
npm run lint          # Verificar errores
npm run lint:fix      # Corregir automáticamente
```

### Prettier

Configuración en `.prettierrc.json`. Formatear código:

```bash
npm run format        # Formatear todos los archivos
npm run format:check  # Verificar sin modificar
```

### Jest

Framework de testing. Ejecutar tests:

```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch
npm run test:coverage # Con reporte de cobertura
npm run test:verbose  # Modo verbose
```

### Git Hooks (Recomendado)

Instalar Husky para ejecutar linting automáticamente antes de commit:

```bash
npm install --save-dev husky lint-staged

# Configurar en package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## Convenciones Específicas del Proyecto SIIL

### 1. Generación de IDs

**Formato de IDs:**
- **Barreno:** `[SiglaProyecto]-[SiglaGeo]-BRN-[Consecutivo]`
  - Ejemplo: `SEFMP31-SON-BRN-001`
- **Muestra:** `SIIL-MUE-[CveEstado][CveMunicipio]-[YYYYMMDD]-[Random4]`
  - Ejemplo: `SIIL-MUE-SON001-20260303-7842`
- **Intervalo:** `INT-[Consecutivo2Dígitos]`
  - Ejemplo: `INT-01`, `INT-02`

```javascript
// Ejemplo de generación de ID de barreno
function generarIdBarreno(proyecto, estadoCve, municipioCve) {
  const siglaProyecto = normalizeToken(proyecto);
  const siglaGeo = `${estadoCve}${municipioCve}`;
  const consecutivo = obtenerConsecutivo('barrenos');
  return `${siglaProyecto}-${siglaGeo}-BRN-${consecutivo.toString().padStart(3, '0')}`;
}

// Ejemplo de generación de ID de muestra
function generarIdMuestra(estadoCve, municipioCve) {
  const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SIIL-MUE-${estadoCve}${municipioCve}-${fecha}-${random}`;
}
```

### 2. Validaciones de Coordenadas

**Rangos válidos para México:**
- Latitud: 14.0° a 33.0° N
- Longitud: -118.5° a -86.0° W
- Altitud: > 0 msnm

```javascript
function validarCoordenadas(localizacion) {
  const { latitud, longitud, altitud } = localizacion;
  
  if (latitud < 14.0 || latitud > 33.0) {
    return { valido: false, error: 'Latitud fuera de rango (14.0 a 33.0)' };
  }
  
  if (longitud < -118.5 || longitud > -86.0) {
    return { valido: false, error: 'Longitud fuera de rango (-118.5 a -86.0)' };
  }
  
  if (altitud <= 0) {
    return { valido: false, error: 'Altitud debe ser mayor a 0' };
  }
  
  return { valido: true };
}
```

### 3. Formato de Fechas

**Regla:** Usar ISO 8601 para almacenamiento, formato local para display.

```javascript
// Almacenar en ISO 8601
const fechaRegistro = new Date().toISOString();
// "2026-03-03T10:30:00.000Z"

// Mostrar en formato local
function formatearFecha(isoString) {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
// "3 de marzo de 2026"

function formatearFechaCorta(isoString) {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString('es-MX');
}
// "03/03/2026"
```

### 4. Catálogos y Listas

**Regla:** Definir catálogos como constantes para mantener consistencia.

```javascript
// js/core/constants.js
export const CATALOGOS = {
  LITOLOGIA_LOCAL: [
    'Arcilla Lacustre',
    'Riolita',
    'Conglomerado',
    'Ignimbrita',
    'Basalto',
    'Andesita',
    'Toba',
    'Brecha Volcánica'
  ],
  
  ACCESIBILIDAD: [
    'Buena',
    'Regular',
    'Mala',
    'Solo helicóptero'
  ],
  
  TIPO_TERRENO: [
    'Planicie',
    'Lomerío suave',
    'Piedemonte',
    'Cañada/Arroyo',
    'Mesa/Meseta',
    'Sierra',
    'Banco de Material'
  ],
  
  RQD: [
    '90-100% Excelente',
    '75-90% Bueno',
    '50-75% Regular',
    '25-50% Pobre',
    '0-25% Muy pobre'
  ],
  
  TIPO_ANALISIS: ['LIBS', 'XRF'],
  
  METODO_LABORATORIO: ['ICP-MS', 'ICP-OES', 'AAS']
};

// Uso
import { CATALOGOS } from './core/constants.js';

function renderizarSelectLitologia() {
  const select = document.getElementById('litologia');
  CATALOGOS.LITOLOGIA_LOCAL.forEach((litologia) => {
    const option = document.createElement('option');
    option.value = litologia;
    option.textContent = litologia;
    select.appendChild(option);
  });
}
```

### 5. Metadata en Registros

**Regla:** Incluir metadata en todos los registros para trazabilidad.

```javascript
function crearMetadata(usuarioId) {
  return {
    fechaRegistro: new Date().toISOString(),
    usuarioRegistro: usuarioId,
    version: 1
  };
}

function crearBarreno(datos, usuarioId) {
  return {
    ...datos,
    metadata: crearMetadata(usuarioId)
  };
}

function actualizarBarreno(barreno, cambios, usuarioId) {
  return {
    ...barreno,
    ...cambios,
    metadata: {
      ...barreno.metadata,
      fechaActualizacion: new Date().toISOString(),
      usuarioActualizacion: usuarioId,
      version: barreno.metadata.version + 1
    }
  };
}
```

### 6. Manejo de localStorage

**Regla:** Usar claves con prefijo y versionado.

```javascript
// js/core/constants.js
export const STORAGE_KEYS = {
  BARRENOS: 'siil_catalogo_barrenos_v1',
  MUESTRAS: 'siil_catalogo_muestras_v1',
  ANALISIS_CAMPO: 'siil_catalogo_analisis_campo_v1',
  ANALISIS_LAB: 'siil_catalogo_analisis_lab_v1',
  USUARIO: 'siil_usuario_actual',
  SYNC_QUEUE: 'siil_sync_queue_v1',
  CONFIG: 'siil_config_v1'
};

// js/core/storage.js
export class Storage {
  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error al leer ${key}:`, error);
      return null;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Cuota de localStorage excedida');
        // Implementar limpieza o migración a IndexedDB
      }
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
      return false;
    }
  }

  static clear() {
    try {
      // Solo limpiar claves del proyecto
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error al limpiar storage:', error);
      return false;
    }
  }
}
```

### 7. Roles y Permisos

**Regla:** Verificar permisos antes de operaciones sensibles.

```javascript
// js/core/constants.js
export const ROLES = {
  OPERADOR_CAMPO: 'operador_campo',
  TECNICO_LAB: 'tecnico_lab',
  GEOLOGO: 'geologo',
  COORDINADOR: 'coordinador',
  ADMIN: 'admin'
};

// js/services/auth-service.js
export class AuthService {
  static puedeCrearBarreno(usuario) {
    return [ROLES.OPERADOR_CAMPO, ROLES.COORDINADOR, ROLES.ADMIN].includes(usuario.rol);
  }

  static puedeEliminarBarreno(usuario) {
    return [ROLES.COORDINADOR, ROLES.ADMIN].includes(usuario.rol);
  }

  static puedeVerDashboard(usuario) {
    return [ROLES.GEOLOGO, ROLES.COORDINADOR, ROLES.ADMIN].includes(usuario.rol);
  }
}

// Uso en componentes
function mostrarBotonCrear() {
  const usuario = AuthService.getUsuarioActual();
  if (AuthService.puedeCrearBarreno(usuario)) {
    document.getElementById('btn-crear').style.display = 'block';
  }
}
```

---

## Checklist de Revisión de Código

Antes de hacer commit, verificar:

### Estilo y Formato
- [ ] Código formateado con Prettier (`npm run format`)
- [ ] Sin errores de ESLint (`npm run lint`)
- [ ] Nombres de archivos en kebab-case
- [ ] Variables y funciones en camelCase
- [ ] Clases en PascalCase
- [ ] Constantes en SCREAMING_SNAKE_CASE con prefijos apropiados

### Código
- [ ] Sin código comentado (eliminar o justificar)
- [ ] Sin console.log innecesarios (usar solo para debugging temporal)
- [ ] Sin variables no utilizadas
- [ ] Sin funciones no utilizadas
- [ ] Manejo apropiado de errores (try-catch)
- [ ] Validación de inputs en funciones públicas
- [ ] Sin números mágicos (usar constantes)

### Documentación
- [ ] Funciones públicas documentadas con JSDoc
- [ ] Comentarios explican "por qué", no "qué"
- [ ] README actualizado si es necesario
- [ ] CHANGELOG actualizado si es necesario

### Testing
- [ ] Tests agregados para nueva funcionalidad
- [ ] Tests existentes actualizados si es necesario
- [ ] Todos los tests pasan (`npm test`)
- [ ] Cobertura de tests adecuada (>80% para core)

### Git
- [ ] Mensaje de commit sigue Conventional Commits
- [ ] Commit es atómico (un cambio lógico)
- [ ] Branch tiene nombre descriptivo
- [ ] Sin archivos innecesarios en commit (.env, node_modules, etc.)

### Seguridad
- [ ] Inputs sanitizados
- [ ] Sin datos sensibles en código
- [ ] Sin vulnerabilidades conocidas

---

## Recursos Adicionales

### Documentación del Proyecto
- [README.md](./README.md) - Información general del proyecto
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Guía de testing
- [ESLINT_PRETTIER_SETUP.md](./ESLINT_PRETTIER_SETUP.md) - Configuración de herramientas
- [QUICK_START_LINTING.md](./QUICK_START_LINTING.md) - Inicio rápido con linting

### Documentación Externa
- [MDN JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Herramientas Recomendadas
- **VS Code Extensions:**
  - ESLint
  - Prettier - Code formatter
  - Jest Runner
  - GitLens
  - Path Intellisense

---

## Actualización de este Documento

Este documento debe actualizarse cuando:
- Se agreguen nuevas convenciones
- Se modifiquen reglas existentes
- Se identifiquen patrones comunes que deban documentarse
- Se agreguen nuevas herramientas al proyecto

**Última actualización:** 3 de marzo de 2026

**Mantenedores:**
- Equipo de Desarrollo SIIL
- Coordinador de Proyecto

---

## Contacto

Para preguntas o sugerencias sobre estas convenciones:
- Crear issue en el repositorio
- Contactar al coordinador de proyecto
- Discutir en reuniones de equipo

---

**Nota:** Estas convenciones son guías para mantener consistencia. En casos excepcionales donde una regla no aplique, documentar la razón en comentarios del código.
