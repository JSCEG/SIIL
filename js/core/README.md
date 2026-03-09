# SIIL Core Module - Constants

Este módulo contiene todas las constantes globales utilizadas en el Sistema Integral de Información del Litio (SIIL).

## Archivo: constants.js

### Descripción

El archivo `constants.js` centraliza todas las constantes del sistema para:
- Garantizar consistencia en todo el código
- Facilitar el mantenimiento y actualizaciones
- Evitar valores "mágicos" dispersos en el código
- Proporcionar una única fuente de verdad

### Uso

```javascript
// Importar constantes específicas
import { STORAGE_KEYS, VALIDATION_RANGES, TCR_LIMITS } from './core/constants.js';

// O importar todo el objeto
import CONSTANTS from './core/constants.js';

// Usar las constantes
localStorage.setItem(STORAGE_KEYS.BARRENOS, JSON.stringify(data));

if (latitud < VALIDATION_RANGES.LATITUD_MIN || latitud > VALIDATION_RANGES.LATITUD_MAX) {
  console.error('Latitud fuera de rango');
}
```

## Categorías de Constantes

### 1. STORAGE_KEYS
Claves para localStorage e IndexedDB.

**Prefijo:** `siil_`

**Ejemplos:**
- `STORAGE_KEYS.BARRENOS` → `'siil_catalogo_barrenos_v1'`
- `STORAGE_KEYS.MUESTRAS` → `'siil_catalogo_muestras_v1'`
- `STORAGE_KEYS.USUARIO` → `'siil_usuario_actual'`

### 2. API_ENDPOINTS
URLs de servicios backend.

**Prefijo:** `/api/v1/`

**Ejemplos:**
- `API_ENDPOINTS.BARRENOS` → `'/api/v1/barrenos'`
- `API_ENDPOINTS.AUTH_LOGIN` → `'/api/v1/auth/login'`
- `API_ENDPOINTS.INEGI_ESTADOS` → `'https://gaia.inegi.org.mx/wscatgeo/mgee/'`

### 3. VALIDATION_RANGES
Rangos de validación para campos numéricos.

**Coordenadas geográficas (México):**
- Latitud: 14.0° a 33.0°
- Longitud: -118.5° a -86.0°
- Altitud: > 0 msnm

**Geometría de barreno:**
- Azimut: 0° a 360°
- Inclinación: -90° a 0°

**Umbrales de litio:**
- Económico: 500 ppm
- Alto: 1000 ppm

### 4. TCR_LIMITS
Límites de Total Core Recovery por tipo de roca.

| Tipo de Roca | TCR Mínimo |
|--------------|------------|
| Rocas ígneas intrusivas y extrusivas masivas | 90% |
| Depósitos de arcilla, limo y conglomerados | 85% |
| Rocas volcánicas fracturadas / Tobas | 75% |
| Default | 75% |

### 5. ESTADOS_MEXICO
Catálogo de los 32 estados de México con clave y nombre.

```javascript
{ cve: '26', nombre: 'Sonora' }
{ cve: '02', nombre: 'Baja California' }
// ... 30 estados más
```

### 6. Form Field Options
Opciones para campos de formulario:

- **LITOLOGIA_OPTIONS:** Tipos de roca (Arcilla Lacustre, Riolita, etc.)
- **ESTRUCTURA_GEOLOGICA_OPTIONS:** Estructuras geológicas
- **ACCESIBILIDAD_OPTIONS:** Buena, Regular, Mala, Solo helicóptero
- **TIPO_TERRENO_OPTIONS:** Planicie, Lomerío, Sierra, etc.
- **TIPO_BARRENACION_OPTIONS:** Corte Diamante, Rotaria, etc.
- **RQD_OPTIONS:** Calidad del núcleo (90-100% Excelente, etc.)
- **PROYECTO_OPTIONS:** SEFMP.31, LitioMx-Norte, etc.
- **INSTITUCION_OPTIONS:** UNISON, SGM, LitioMx, etc.
- **FUENTE_MUESTRA_OPTIONS:** Arcillas, Salmueras
- **ORIGEN_MUESTRA_OPTIONS:** Superficie, Profundidad (Núcleo)
- **TIPO_ANALISIS_CAMPO_OPTIONS:** LIBS, XRF
- **METODO_ANALISIS_LAB_OPTIONS:** ICP-MS, ICP-OES, etc.
- **ELEMENTOS_QUIMICOS:** Li, Na, K, Mg, Ca, Rb, Cs, B, etc.
- **UNIDADES_CONCENTRACION:** ppm, %, mg/L, etc.

### 7. FILE_UPLOAD
Configuración de carga de archivos.

**Tipos permitidos:**
- Imágenes: JPEG, PNG, WebP
- Documentos: PDF, Excel, CSV

**Tamaños máximos:**
- Imágenes: 5 MB
- Documentos: 10 MB

**Límites de cantidad:**
- Imágenes: 10 por carga
- Documentos: 5 por carga

### 8. USER_ROLES
Roles de usuario del sistema.

```javascript
USER_ROLES.OPERADOR_CAMPO → 'operador_campo'
USER_ROLES.TECNICO_LAB → 'tecnico_lab'
USER_ROLES.GEOLOGO → 'geologo'
USER_ROLES.COORDINADOR → 'coordinador'
USER_ROLES.ADMIN → 'admin'
```

### 9. LITIO_CALCULATOR
Configuración de la calculadora de litio probable.

**Coeficientes de correlación:**
- Rb (Rubidio): 0.45 (alta correlación)
- Cs (Cesio): 0.38 (alta correlación)
- B (Boro): 0.22
- Na (Sodio): 0.15
- K (Potasio): 0.12
- Mg (Magnesio): -0.08 (correlación negativa)
- Ca (Calcio): -0.05 (correlación negativa)

**Pesos de confianza:**
- Rb: 0.95
- Cs: 0.90
- B: 0.85
- Na: 0.8
- K: 0.7

**Umbrales:**
- Urgente: > 1000 ppm
- Prometedor: > 500 ppm
- Moderado: > 200 ppm

### 10. INDEXEDDB_CONFIG
Configuración de IndexedDB.

```javascript
DB_NAME: 'siil_db'
DB_VERSION: 1
STORES: {
  ARCHIVOS: 'archivos',
  FOTOGRAFIAS: 'fotografias',
  SYNC_PENDING: 'sync_pending'
}
```

### 11. UI_CONFIG
Configuración de interfaz de usuario.

- Paginación: 20 items por página
- Búsqueda: debounce de 300ms, mínimo 3 caracteres
- Sesión: timeout de 30 minutos
- Formatos de fecha: YYYY-MM-DD, DD/MM/YYYY
- Precisión: 6 decimales para coordenadas, 2 para mediciones

### 12. ERROR_MESSAGES
Mensajes de error estándar en español.

**Ejemplos:**
- `REQUIRED_FIELD` → "Este campo es requerido"
- `LATITUD_OUT_OF_RANGE` → "La latitud debe estar entre 14° y 33°"
- `NO_BARRENOS_AVAILABLE` → "No hay barrenos registrados..."
- `UNAUTHORIZED` → "No tiene permisos para realizar esta acción"

### 13. SUCCESS_MESSAGES
Mensajes de éxito estándar en español.

**Ejemplos:**
- `BARRENO_CREATED` → "Barreno registrado exitosamente"
- `MUESTRA_CREATED` → "Muestra registrada exitosamente"
- `SYNC_SUCCESS` → "Datos sincronizados exitosamente"

### 14. REGEX_PATTERNS
Patrones de expresiones regulares para validación.

**Ejemplos:**
- `EMAIL`: Valida formato de correo electrónico
- `BARRENO_ID`: Valida formato `[PROYECTO]-[GEO]-BRN-###`
- `MUESTRA_ID`: Valida formato `SIIL-MUE-[ESTMUN]-[FECHA]-####`
- `UUID`: Valida formato UUID v4

## Testing

El archivo incluye tests completos en `constants.test.js`:

```bash
npm test -- js/core/constants.test.js
```

**Cobertura de tests:**
- ✓ Todas las constantes están definidas
- ✓ Prefijos correctos en claves
- ✓ Rangos numéricos válidos
- ✓ Arrays no vacíos
- ✓ Patrones regex funcionan correctamente
- ✓ No hay valores undefined

## Convenciones

### Nomenclatura
- **UPPER_SNAKE_CASE** para constantes
- Prefijos descriptivos:
  - `STORAGE_` para claves de almacenamiento
  - `API_` para endpoints
  - `VALIDATION_` para rangos de validación
  - `ERROR_` para mensajes de error
  - `SUCCESS_` para mensajes de éxito

### Versionado
Las claves de storage incluyen versión (`_v1`) para facilitar migraciones:
```javascript
STORAGE_KEYS.BARRENOS = 'siil_catalogo_barrenos_v1'
```

Si se cambia la estructura de datos, incrementar la versión:
```javascript
STORAGE_KEYS.BARRENOS = 'siil_catalogo_barrenos_v2'
```

### Internacionalización
Actualmente todos los mensajes están en español. Para agregar soporte multiidioma:

1. Crear `constants.en.js` con traducciones
2. Usar sistema de i18n para seleccionar idioma
3. Mantener estructura idéntica en todos los archivos de idioma

## Mantenimiento

### Agregar nuevas constantes

1. Identificar la categoría apropiada
2. Agregar la constante con comentario descriptivo
3. Actualizar el export default al final del archivo
4. Agregar tests en `constants.test.js`
5. Documentar en este README

### Modificar constantes existentes

⚠️ **PRECAUCIÓN:** Modificar constantes puede afectar múltiples partes del sistema.

**Proceso recomendado:**
1. Buscar todos los usos de la constante en el código
2. Evaluar impacto del cambio
3. Actualizar tests
4. Probar exhaustivamente
5. Documentar el cambio

### Deprecar constantes

Si una constante ya no se usa:

1. Marcarla como `@deprecated` en comentario
2. Mantenerla por al menos una versión
3. Agregar warning en consola si se usa
4. Removerla en siguiente versión mayor

```javascript
/**
 * @deprecated Usar STORAGE_KEYS.BARRENOS_V2 en su lugar
 */
export const OLD_BARRENOS_KEY = 'siil_barrenos';
```

## Mejores Prácticas

### ✅ Hacer
- Usar constantes en lugar de valores literales
- Importar solo las constantes necesarias
- Validar rangos usando las constantes
- Usar mensajes de error/éxito predefinidos

### ❌ Evitar
- Duplicar valores en el código
- Hardcodear URLs o claves
- Crear constantes locales que deberían ser globales
- Modificar constantes en runtime

## Ejemplos de Uso

### Validación de coordenadas
```javascript
import { VALIDATION_RANGES, ERROR_MESSAGES } from './core/constants.js';

function validarCoordenadas(lat, lon) {
  if (lat < VALIDATION_RANGES.LATITUD_MIN || lat > VALIDATION_RANGES.LATITUD_MAX) {
    throw new Error(ERROR_MESSAGES.LATITUD_OUT_OF_RANGE);
  }
  if (lon < VALIDATION_RANGES.LONGITUD_MIN || lon > VALIDATION_RANGES.LONGITUD_MAX) {
    throw new Error(ERROR_MESSAGES.LONGITUD_OUT_OF_RANGE);
  }
  return true;
}
```

### Validación de TCR
```javascript
import { TCR_LIMITS } from './core/constants.js';

function validarTCR(tcr, tipoRoca) {
  const limite = TCR_LIMITS[tipoRoca] || TCR_LIMITS.DEFAULT;
  return {
    valido: tcr >= limite,
    limite,
    requiereJustificacion: tcr < limite
  };
}
```

### Almacenamiento
```javascript
import { STORAGE_KEYS } from './core/constants.js';

// Guardar
localStorage.setItem(STORAGE_KEYS.BARRENOS, JSON.stringify(barrenos));

// Leer
const barrenos = JSON.parse(localStorage.getItem(STORAGE_KEYS.BARRENOS) || '[]');
```

### API Calls
```javascript
import { API_ENDPOINTS } from './core/constants.js';

async function obtenerBarrenos() {
  const response = await fetch(API_ENDPOINTS.BARRENOS);
  return response.json();
}
```

## Soporte

Para preguntas o sugerencias sobre las constantes:
- Revisar este README
- Consultar los tests en `constants.test.js`
- Revisar el código fuente en `constants.js`
- Contactar al equipo de desarrollo

---

**Última actualización:** 2026-03-03  
**Versión:** 1.0.0  
**Mantenedor:** Equipo SIIL
