# Guía Rápida - ESLint y Prettier

## Instalación Inicial

```bash
# Ya está instalado, pero si necesitas reinstalar:
npm install
```

## Comandos Esenciales

### Verificar Código
```bash
npm run lint
```

### Corregir Automáticamente
```bash
npm run lint:fix
```

### Formatear Código
```bash
npm run format
```

### Verificar Formato (sin modificar)
```bash
npm run format:check
```

## Configuración de VS Code

### 1. Instalar Extensiones

Busca e instala en VS Code:
- **ESLint** (ID: `dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (ID: `esbenp.prettier-vscode`)

### 2. Configurar Settings

Copia el contenido de `vscode-settings-recommended.json` a `.vscode/settings.json`

O manualmente agrega:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Reglas Más Importantes

### ✅ Hacer
- Usar `const` o `let` (nunca `var`)
- Usar comillas simples `'texto'`
- Siempre usar llaves `{}` en `if`, `for`, etc.
- Usar `===` en lugar de `==`
- Terminar líneas con `;`
- Usar paréntesis en arrow functions: `(x) => x`

### ❌ Evitar
- `var nombre = 'Juan'`
- `"texto con comillas dobles"`
- `if (condicion) return;` (sin llaves)
- `valor == null` (usar `===`)
- Arrow functions sin paréntesis: `x => x`
- Números mágicos sin constantes

## Ejemplo Rápido

### Antes (con errores)
```javascript
var nombre = "Juan";
if (edad > 18) return true;
const doble = x => x * 2;
```

### Después (correcto)
```javascript
const nombre = 'Juan';
const EDAD_MINIMA = 18;

if (edad > EDAD_MINIMA) {
  return true;
}

const doble = (x) => x * 2;
```

## Flujo de Trabajo

1. Escribe código
2. Guarda archivo (auto-formatea si configuraste VS Code)
3. Antes de commit: `npm run lint:fix && npm run format`
4. Verifica: `npm run lint`
5. Commit si no hay errores

## Ayuda

Ver documentación completa en: `ESLINT_PRETTIER_SETUP.md`
