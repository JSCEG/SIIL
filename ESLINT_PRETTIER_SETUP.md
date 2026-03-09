# ESLint y Prettier - Configuración del Proyecto SIIL

## Descripción

Este proyecto utiliza **ESLint** para análisis estático de código y **Prettier** para formateo automático, garantizando calidad y consistencia en todo el código JavaScript vanilla.

## Herramientas Instaladas

- **ESLint** v8.57.0 - Linter para JavaScript
- **Prettier** v3.2.5 - Formateador de código
- **eslint-config-prettier** v9.1.0 - Desactiva reglas de ESLint que entran en conflicto con Prettier

## Convenciones de Código

### Nomenclatura

- **Archivos**: `kebab-case` (ejemplo: `state-manager.js`, `barreno-service.js`)
- **Variables y funciones**: `camelCase` (ejemplo: `calcularTCR`, `muestraId`)
- **Clases**: `PascalCase` (ejemplo: `BarrenoService`, `Wizard`)
- **Constantes de localStorage**: Prefijo `STORAGE_` (ejemplo: `STORAGE_KEYS`)
- **Constantes de API**: Prefijo `API_` (ejemplo: `API_ENDPOINTS`)

### Reglas de ESLint Principales

#### Errores Críticos
- `no-var`: Prohibido usar `var`, usar `const` o `let`
- `prefer-const`: Usar `const` cuando la variable no se reasigna
- `eqeqeq`: Usar siempre `===` y `!==` (no `==` o `!=`)
- `curly`: Siempre usar llaves `{}` en bloques `if`, `for`, `while`, etc.
- `semi`: Siempre usar punto y coma `;` al final de las sentencias
- `quotes`: Usar comillas simples `'` en lugar de dobles `"`

#### Advertencias
- `no-console`: Evitar `console.log` en producción (usar solo para debugging)
- `no-unused-vars`: Variables no utilizadas (excepto las que empiezan con `_`)
- `no-magic-numbers`: Evitar números mágicos, usar constantes con nombres descriptivos
- `max-len`: Líneas de máximo 120 caracteres

#### Estilo de Código
- `arrow-parens`: Siempre usar paréntesis en arrow functions: `(x) => x`
- `prefer-template`: Usar template literals en lugar de concatenación: `` `Hola ${nombre}` ``
- `object-shorthand`: Usar sintaxis corta en objetos: `{ nombre }` en lugar de `{ nombre: nombre }`
- `brace-style`: Estilo de llaves 1TBS (one true brace style)

### Configuración de Prettier

```json
{
  "semi": true,                    // Punto y coma al final
  "trailingComma": "none",         // Sin coma final en objetos/arrays
  "singleQuote": true,             // Comillas simples
  "printWidth": 120,               // Máximo 120 caracteres por línea
  "tabWidth": 2,                   // Indentación de 2 espacios
  "useTabs": false,                // Usar espacios, no tabs
  "arrowParens": "always",         // Paréntesis en arrow functions
  "bracketSpacing": true,          // Espacios en objetos: { foo: bar }
  "endOfLine": "lf"                // Line endings Unix (LF)
}
```

## Comandos Disponibles

### Análisis de Código (ESLint)

```bash
# Verificar errores de código
npm run lint

# Corregir errores automáticamente
npm run lint:fix
```

### Formateo de Código (Prettier)

```bash
# Verificar formato sin modificar archivos
npm run format:check

# Formatear todos los archivos
npm run format
```

## Flujo de Trabajo Recomendado

### 1. Antes de Commit

```bash
# Verificar y corregir errores de linting
npm run lint:fix

# Formatear código
npm run format

# Verificar que no queden errores
npm run lint
```

### 2. Durante Desarrollo

- Configura tu editor para ejecutar ESLint y Prettier automáticamente al guardar
- Revisa las advertencias de ESLint y corrígelas antes de hacer commit

### 3. Integración con VS Code

Instala las extensiones:
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier - Code formatter** (esbenp.prettier-vscode)

Agrega a tu `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript"
  ]
}
```

## Archivos Ignorados

### .eslintignore
- `node_modules/`
- `.venv/`
- `dist/`, `build/`
- `css/output.css` (generado por Tailwind)
- `tailwind.config.js`
- Archivos Python (`*.py`)
- Archivos temporales (`_tmp_*`)

### .prettierignore
- Mismos que ESLint
- Archivos Markdown (`*.md`) - para preservar formato manual

## Ejemplos de Código Correcto

### ✅ Buenas Prácticas

```javascript
// Usar const para valores que no cambian
const STORAGE_KEY = 'siil_barrenos';

// Usar camelCase para funciones
function calcularTCR(longitudRecuperada, longitudPerforada) {
  return (longitudRecuperada / longitudPerforada) * 100;
}

// Siempre usar llaves en bloques
if (tcr < 75) {
  console.warn('TCR bajo');
}

// Usar template literals
const mensaje = `El TCR es ${tcr}%`;

// Usar arrow functions con paréntesis
const filtrar = (items) => items.filter((item) => item.activo);

// Usar object shorthand
const barreno = {
  id,
  nombre,
  ubicacion
};

// Usar comillas simples
const tipo = 'Arcillas';
```

### ❌ Malas Prácticas

```javascript
// ❌ Usar var
var nombre = 'Juan';

// ❌ No usar llaves
if (error) return;

// ❌ Concatenación de strings
const mensaje = 'El TCR es ' + tcr + '%';

// ❌ Arrow function sin paréntesis
const filtrar = items => items.filter(item => item.activo);

// ❌ Usar comillas dobles
const tipo = "Arcillas";

// ❌ Comparación con ==
if (valor == null) { }

// ❌ Números mágicos
if (tcr < 75) { }  // ¿Qué significa 75?

// ✅ Mejor: usar constante
const TCR_MINIMO_ARCILLAS = 75;
if (tcr < TCR_MINIMO_ARCILLAS) { }
```

## Solución de Problemas Comunes

### Error: "Expected { after 'if' condition"

```javascript
// ❌ Incorrecto
if (condicion) return;

// ✅ Correcto
if (condicion) {
  return;
}
```

### Error: "Strings must use singlequote"

```javascript
// ❌ Incorrecto
const nombre = "Juan";

// ✅ Correcto
const nombre = 'Juan';
```

### Error: "Expected parentheses around arrow function argument"

```javascript
// ❌ Incorrecto
const doble = x => x * 2;

// ✅ Correcto
const doble = (x) => x * 2;
```

### Warning: "No magic number"

```javascript
// ❌ Incorrecto
if (edad > 18) { }

// ✅ Correcto
const EDAD_MINIMA = 18;
if (edad > EDAD_MINIMA) { }
```

### Warning: "Unexpected console statement"

```javascript
// ❌ Evitar en producción
console.log('Debug info');

// ✅ Usar solo para debugging temporal
// console.log('Debug info'); // TODO: remover antes de commit
```

## Estado Actual del Código

Al ejecutar `npm run lint` se encontraron:
- **500 errores** (la mayoría auto-corregibles con `--fix`)
- **37 advertencias**

Los errores más comunes son:
1. Uso de comillas dobles en lugar de simples (496 errores)
2. Falta de llaves en bloques `if` (múltiples casos)
3. Falta de paréntesis en arrow functions
4. Variables globales no definidas (`Preloader`, `Modal`)

## Próximos Pasos

1. ✅ Configuración de ESLint y Prettier completada
2. ⏳ Ejecutar `npm run lint:fix` para corregir errores automáticos
3. ⏳ Revisar y corregir errores manuales restantes
4. ⏳ Configurar pre-commit hooks (opcional) con Husky
5. ⏳ Documentar variables globales en `.eslintrc.json`

## Recursos Adicionales

- [ESLint Rules](https://eslint.org/docs/latest/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)

## Mantenimiento

- Revisar y actualizar reglas de ESLint según necesidades del equipo
- Mantener dependencias actualizadas: `npm update`
- Documentar nuevas convenciones en este archivo
