# Diseño Técnico - Sistema Integral de Información del Litio (SIIL)

## Fecha de Creación
3 de marzo de 2026

## Visión General

Este documento describe la arquitectura técnica, modelos de datos, flujos de trabajo y decisiones de diseño para el Sistema Integral de Información del Litio (SIIL). El sistema implementa un flujo de 4 formularios interconectados con catálogos compartidos y trazabilidad completa.

## Arquitectura del Sistema

### Patrón Arquitectónico

**Arquitectura de Capas con Patrón MVC (Model-View-Controller)**

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                      │
│  (HTML5 + Tailwind CSS + JavaScript Vanilla)                │
│  - Componentes Web Reutilizables                            │
│  - Wizard Multi-paso                                         │
│  - Validación en Tiempo Real                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA DE NEGOCIO                │
│  (JavaScript Modules)                                        │
│  - Gestión de Estado                                         │
│  - Validaciones de Negocio                                   │
│  - Cálculos (TCR, Calculadora Litio)                        │
│  - Gestión de Catálogos                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PERSISTENCIA                      │
│  - LocalStorage (Modo Offline)                              │
│  - IndexedDB (Archivos/Imágenes)                            │
│  - REST API (Sincronización Backend)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  - API INEGI (Catálogos Geográficos)                        │
│  - Servicio de Geolocalización                              │
│  - Almacenamiento de Archivos (S3/Azure Blob)               │
└─────────────────────────────────────────────────────────────┘
```

### Decisiones de Arquitectura

**DA-1: JavaScript Vanilla sin Frameworks Pesados**
- **Decisión:** Usar JavaScript vanilla en lugar de React/Vue/Angular
- **Razón:** Mejor rendimiento en dispositivos de campo con conectividad limitada
- **Consecuencia:** Mayor código boilerplate, pero mejor control y rendimiento

**DA-2: LocalStorage + IndexedDB para Modo Offline**
- **Decisión:** Usar almacenamiento local del navegador como fuente primaria
- **Razón:** Permitir captura de datos en campo sin conexión
- **Consecuencia:** Necesidad de sincronización posterior con backend

**DA-3: Wizard Multi-paso con Validación Progresiva**
- **Decisión:** Dividir formularios largos en pasos con validación por paso
- **Razón:** Mejorar UX, reducir errores, permitir guardado parcial
- **Consecuencia:** Mayor complejidad en gestión de estado

**DA-4: Catálogos como Fuente de Verdad**
- **Decisión:** Cada formulario genera un catálogo consumido por el siguiente
- **Razón:** Garantizar integridad referencial y trazabilidad
- **Consecuencia:** Dependencias estrictas entre formularios

**DA-5: Control de Acceso Basado en Roles (RBAC)**
- **Decisión:** Implementar sistema de roles con permisos granulares
- **Razón:** Diferentes usuarios necesitan diferentes niveles de acceso
- **Consecuencia:** Necesidad de gestión de usuarios y sesiones

## Modelos de Datos

### 1. Modelo de Barreno

```typescript
interface Barreno {
  // IDENTIFICACIÓN
  id: string;                    // Auto-generado: [Proyecto]-[Geo]-BRN-[###]
  proyecto: string;
  perforista: string;            // Empresa perforista
  responsable: string;           // Responsable de perforación
  
  // CONTEXTO GEOLÓGICO
  contexto: {
    litologiaLocal: string;
    estructuraAledana: string;
    anomaliaGravimetrica?: number;  // mGal
    anomalias: Array<{
      tipo: string;
      descripcion: string;
      valor?: string;
    }>;
    accesibilidad: 'Buena' | 'Regular' | 'Mala' | 'Solo helicóptero';
    tipoTerreno: string;
  };
  
  // LOCALIZACIÓN Y GEOMETRÍA
  localizacion: {
    latitud: number;             // 14.0 a 33.0
    longitud: number;            // -118.5 a -86.0
    altitud: number;             // > 0 msnm
    azimut: number;              // 0-360°
    inclinacion: number;         // 0 a -90°
  };
  
  // UBICACIÓN ADMINISTRATIVA
  ubicacion: {
    estado: string;
    estadoCve: string;
    municipio: string;
    municipioCve: string;
  };
  
  // PROGRAMA Y EJECUCIÓN
  ejecucion: {
    tipoBarrenacion: string;     // "Corte Diamante (CD)"
    fechaInicio: string;         // ISO 8601
    fechaFinalizacion: string;   // ISO 8601
    longitudPerforada: number;   // metros
  };
  
  // DESCRIPCIÓN DEL NÚCLEO
  nucleo: {
    longitudRecuperada: number;  // metros
    diametro: number;            // mm
    numeroCajas: number;
    nombrePrimeraCaja: string;
    rqd: string;                 // "90-100% Excelente", etc.
    tcr: number;                 // Calculado automáticamente
    responsableDescripcion: string;
    numeroIntervalos: number;
    intervalosInteres: string;
    archivoDescripcion?: {
      nombre: string;
      url: string;
      tipo: string;
    };
    fotografias: Array<{
      nombre: string;
      url: string;
    }>;
  };
  
  // INTERVALOS
  intervalos: Array<{
    id: string;                  // INT-01, INT-02, etc.
    desde: number;               // metros
    hasta: number;               // metros
  }>;
  
  // NOTAS
  observaciones: string;
  
  // METADATA
  metadata: {
    fechaRegistro: string;       // ISO 8601
    usuarioRegistro: string;
    version: number;
  };
}
```

### 2. Modelo de Muestra

```typescript
interface Muestra {
  // IDENTIFICACIÓN
  id: string;                    // SIIL-MUE-[EstMun]-[YYYYMMDD]-[####]
  
  // CONTEXTO
  contexto: {
    proyecto: string;
    institucion: string;
    institucionOtra?: string;
    responsable: string;
    estado: string;
    estadoCve: string;
    municipio: string;
    municipioCve: string;
    localidad?: string;
  };
  
  // FUENTE Y TIPO
  fuente: 'Arcillas' | 'Salmueras';
  tipo: 'Superficie' | 'Núcleo' | 'Salmuera';
  
  // DATOS ESPECÍFICOS POR TIPO
  datosSalmuera?: {
    campo: string;
    pozo: string;
    latitud: number;
    longitud: number;
    altitud: number;
    profundidad: number;
    intervaloInicio: number;
    intervaloFin: number;
    corteAgua: number;           // %
    presion: number;             // Pa
    temperatura: number;         // °C
    ph: number;
  };
  
  datosArcillaSuperficie?: {
    notas: string;
    procedencia: string;
    latitud: number;
    longitud: number;
    altitud: number;
  };
  
  datosArcillaNucleo?: {
    barreno: {
      id: string;
      intervalo: {
        id: string;
        desde: number;
        hasta: number;
      };
    };
    desde: number;               // Puede ser ajustado dentro del intervalo
    hasta: number;
    altitud: number;
  };
  
  // DESCRIPCIÓN TÉCNICA
  descripcion: {
    litologia: string;
    color: string;
    textura: string;
    fotografias: Array<{
      nombre: string;
      url: string;
      timestamp: string;
    }>;
  };
  
  // REFERENCIA A BARRENO (si aplica)
  referenciaBarreno: {
    id: string;
    intervalo: {
      id: string;
      desde: number;
      hasta: number;
    };
  } | null;
  
  // ESTADO DEL ANÁLISIS
  estadoAnalisis: {
    tieneCampo: boolean;
    tieneLaboratorio: boolean;
    completo: boolean;
  };
  
  // METADATA
  metadata: {
    formulario: string;
    fechaCapturaISO: string;
    usuarioRegistro: string;
    version: number;
  };
}
```

### 3. Modelo de Análisis de Campo

```typescript
interface AnalisisCampo {
  // IDENTIFICACIÓN
  id: string;                    // Auto-generado UUID
  muestraId: string;             // FK a Muestra
  
  // DATOS DEL ANÁLISIS
  fecha: string;                 // ISO 8601
  responsable: string;
  tipoAnalisis: 'LIBS' | 'XRF';
  
  // RESULTADOS
  resultados: Array<{
    elemento: string;            // Li, Na, K, Ca, Mg, etc.
    concentracion: number;
    unidad: string;              // ppm, %, mg/L
    limitDeteccion?: number;
  }>;
  
  // PARÁMETROS DEL EQUIPO
  parametrosEquipo: {
    voltaje?: number;
    tiempoExposicion?: number;
    numeroDisparos?: number;
    otros?: Record<string, any>;
  };
  
  // CONDICIONES AMBIENTALES
  condiciones?: {
    temperatura?: number;
    humedad?: number;
  };
  
  // ARCHIVO DEL EQUIPO
  archivo?: {
    nombre: string;
    url: string;
    tipo: string;
  };
  
  // CALCULADORA DE LITIO
  calculadoraLitio: {
    concentracionEstimada: number;  // ppm
    nivelConfianza: number;         // 0-100%
    requiereLaboratorio: boolean;
    notas: string;
  };
  
  // METADATA
  metadata: {
    fechaRegistro: string;
    usuarioRegistro: string;
    version: number;
  };
}
```

### 4. Modelo de Análisis de Laboratorio

```typescript
interface AnalisisLaboratorio {
  // IDENTIFICACIÓN
  id: string;                    // Auto-generado UUID
  muestraId: string;             // FK a Muestra
  
  // DATOS DEL LABORATORIO
  laboratorio: {
    institucion: string;
    nombreLaboratorio: string;
    fechaRecepcion: string;      // ISO 8601
    fechaAnalisis: string;       // ISO 8601
    metodoAnalisis: string;      // ICP-MS, ICP-OES, etc.
  };
  
  // RESULTADOS ANALÍTICOS
  resultados: Array<{
    elemento: string;
    concentracion: number;
    unidad: string;
    limitDeteccion: number;
    incertidumbre: number;
  }>;
  
  // CERTIFICACIÓN
  certificacion: {
    numeroCertificado: string;
    numeroLote: string;
    estandaresReferencia: string[];
  };
  
  // ARCHIVOS
  archivos: Array<{
    tipo: 'certificado' | 'datos' | 'otro';
    nombre: string;
    url: string;
    formato: string;             // pdf, csv, xlsx
  }>;
  
  // COMPARACIÓN CON CAMPO
  comparacionCampo?: {
    analisisCampoId: string;
    discrepancias: Array<{
      elemento: string;
      valorCampo: number;
      valorLaboratorio: number;
      diferenciaPorcentual: number;
      significativa: boolean;
    }>;
  };
  
  // CALIDAD
  reporteCalidad: {
    aprobado: boolean;
    observaciones: string;
    revisadoPor: string;
    fechaRevision: string;
  };
  
  // METADATA
  metadata: {
    fechaRegistro: string;
    usuarioRegistro: string;
    version: number;
  };
}
```

### 5. Modelo de Usuario

```typescript
interface Usuario {
  id: string;
  correo: string;
  nombre: string;
  rol: 'operador_campo' | 'tecnico_lab' | 'geologo' | 'coordinador' | 'admin';
  institucion: string;
  proyectos: string[];           // IDs de proyectos asignados
  activo: boolean;
  
  // PERMISOS
  permisos: {
    barrenos: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    muestras: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    analisisCampo: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    analisisLaboratorio: {
      crear: boolean;
      leer: boolean;
      actualizar: boolean;
      eliminar: boolean;
    };
    administracion: boolean;
  };
  
  // METADATA
  metadata: {
    fechaCreacion: string;
    ultimoAcceso: string;
    creadoPor: string;
  };
}
```

## Estructura de Módulos JavaScript

```
js/
├── core/
│   ├── state-manager.js         # Gestión centralizada de estado
│   ├── storage.js               # Abstracción de localStorage/IndexedDB
│   ├── validator.js             # Validaciones reutilizables
│   └── utils.js                 # Utilidades generales
├── services/
│   ├── barreno-service.js       # CRUD de barrenos
│   ├── muestra-service.js       # CRUD de muestras
│   ├── analisis-campo-service.js
│   ├── analisis-lab-service.js
│   ├── inegi-service.js         # Integración API INEGI
│   ├── auth-service.js          # Autenticación y autorización
│   └── sync-service.js          # Sincronización con backend
├── components/
│   ├── wizard.js                # Componente wizard multi-paso
│   ├── form-builder.js          # Constructor dinámico de formularios
│   ├── catalog-selector.js      # Selector de catálogos
│   ├── file-uploader.js         # Carga de archivos
│   └── map-viewer.js            # Visualización de mapas
├── calculators/
│   ├── tcr-calculator.js        # Cálculo de TCR
│   └── litio-calculator.js      # Calculadora de litio probable
├── pages/
│   ├── registro-barreno.js
│   ├── registro-muestra.js
│   ├── analisis-campo.js
│   ├── analisis-laboratorio.js
│   └── dashboard.js
└── shared/
    ├── auth.js                  # Ya existe
    ├── preloader.js             # Ya existe
    ├── shared-layout.js         # Ya existe
    └── shared-breadcrumbs.js    # Ya existe
```

## Flujos de Trabajo Detallados

### Flujo 1: Registro de Barreno

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INICIO                                                    │
│    - Usuario accede a "Registro de Barreno"                 │
│    - Sistema verifica permisos (rol: operador_campo)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PASO 1: Contexto Geológico                               │
│    - Captura litología, estructuras, anomalías              │
│    - Captura accesibilidad y tipo de terreno                │
│    - Validación: campos requeridos                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PASO 2: Identificación y Ubicación                       │
│    - Captura proyecto, perforista, responsable              │
│    - Selecciona estado (carga desde INEGI)                  │
│    - Selecciona municipio (carga dinámicamente)             │
│    - Sistema genera ID preview                              │
│    - Validación: ID único, coordenadas en rango             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PASO 3: Localización y Geometría                         │
│    - Captura coordenadas GPS                                │
│    - Captura azimut e inclinación                           │
│    - Validación: rangos válidos                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PASO 4: Programa y Ejecución                             │
│    - Captura fechas inicio/fin                              │
│    - Captura longitud perforada                             │
│    - Validación: fecha_fin >= fecha_inicio                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PASO 5: Descripción del Núcleo                           │
│    - Captura longitud recuperada, diámetro, cajas           │
│    - Selecciona RQD                                          │
│    - Sistema calcula TCR automáticamente                    │
│    - Sistema valida TCR vs límites aceptados                │
│    - Muestra alerta si TCR < límite                         │
│    - Captura responsable descripción                        │
│    - Carga archivo descripción (.xlsx)                      │
│    - Carga fotografías                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PASO 6: Intervalos                                        │
│    - Agrega intervalos dinámicamente                        │
│    - Primer intervalo auto-inicia en 0                      │
│    - Intervalos subsecuentes auto-inician en fin anterior   │
│    - Validación: continuidad, último = longitud total       │
│    - Sistema genera IDs: INT-01, INT-02, etc.               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. PASO 7: Notas y Revisión                                 │
│    - Captura observaciones                                   │
│    - Muestra preview completo del payload                   │
│    - Usuario revisa todos los datos                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. SUBMIT                                                    │
│    - Validación final de todos los pasos                    │
│    - Genera ID definitivo del barreno                       │
│    - Guarda en localStorage (catálogo barrenos)             │
│    - Guarda en IndexedDB (archivos/fotos)                   │
│    - Encola para sincronización con backend                 │
│    - Muestra mensaje de éxito con ID generado               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. POST-REGISTRO                                            │
│     - Barreno disponible en catálogo                        │
│     - Puede ser seleccionado en Registro de Muestra         │
│     - Aparece en lista de barrenos registrados              │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 2: Registro de Muestra - Arcillas Núcleo (Caso Crítico)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. INICIO                                                    │
│    - Usuario accede a "Registro de Muestra"                 │
│    - Sistema verifica permisos                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PASO 1: Contexto                                          │
│    - Captura proyecto, institución, responsable             │
│    - Selecciona estado y municipio (INEGI)                  │
│    - Captura localidad                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PASO 2: Fuente                                            │
│    - Usuario selecciona: "Arcillas"                         │
│    - Sistema ajusta wizard dinámicamente                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PASO 3: Origen                                            │
│    - Usuario selecciona: "Profundidad (Núcleo)"            │
│    - Sistema ajusta wizard dinámicamente                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDACIÓN CRÍTICA DE DEPENDENCIAS                       │
│    - Sistema consulta catálogo de barrenos                  │
│    - ¿Hay barrenos disponibles?                             │
└─────────────────────────────────────────────────────────────┘
         ↓ NO                                    ↓ SÍ
┌──────────────────────────┐      ┌──────────────────────────┐
│ BLOQUEO                  │      │ CONTINUAR                │
│ - Muestra advertencia    │      │ - Carga lista barrenos   │
│ - Botón "Ir a Registro   │      │ - Permite selección      │
│   de Barreno"            │      └──────────────────────────┘
│ - NO permite continuar   │                   ↓
└──────────────────────────┘      ┌──────────────────────────┐
                                   │ 6. PASO 4: Selección     │
                                   │    Barreno e Intervalo   │
                                   │ - Dropdown barrenos      │
                                   │ - Muestra info barreno   │
                                   │ - Dropdown intervalos    │
                                   │ - Auto-completa desde/   │
                                   │   hasta                  │
                                   │ - Permite ajuste manual  │
                                   │ - Validación: hasta>=    │
                                   │   desde                  │
                                   └──────────────────────────┘
                                                ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PASO 5: Descripción Técnica                              │
│    - Captura litología, color, textura                      │
│    - Carga fotografías                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. SUBMIT                                                    │
│    - Genera ID único de muestra                             │
│    - Vincula a barreno e intervalo                          │
│    - Guarda en catálogo muestras                            │
│    - Payload incluye referenciaBarreno completa             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 3: Análisis de Campo con Calculadora de Litio

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SELECCIÓN DE MUESTRA                                      │
│    - Búsqueda por ID en catálogo                            │
│    - Muestra info contexto de muestra                       │
│    - Valida que muestra exista                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CAPTURA DE DATOS                                          │
│    - Fecha análisis                                          │
│    - Responsable                                             │
│    - Tipo: LIBS o XRF                                        │
│    - Parámetros equipo                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RESULTADOS                                                │
│    - Opción A: Carga archivo del equipo (.csv, .xls)       │
│    - Sistema parsea y extrae datos                          │
│    - Opción B: Captura manual por elemento                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CALCULADORA DE LITIO PROBABLE                             │
│    - Sistema ejecuta algoritmo predictivo                   │
│    - Inputs: concentraciones de elementos correlacionados  │
│    - Output: concentración estimada Li (ppm)                │
│    - Output: nivel de confianza (%)                         │
│    - Output: recomendación análisis laboratorio             │
│    - Muestra resultados en tiempo real                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. GUARDADO                                                  │
│    - Vincula análisis a muestra                             │
│    - Actualiza estado muestra (tieneCampo: true)            │
│    - Guarda en catálogo análisis campo                      │
└─────────────────────────────────────────────────────────────┘
```

## Validaciones de Negocio

### Validaciones de Barreno

```javascript
// VN-B1: ID único
function validarIdBarrenoUnico(id, catalogoBarrenos) {
  return !catalogoBarrenos.some(b => b.id === id);
}

// VN-B2: Coordenadas en rango válido
function validarCoordenadas(lat, lon, alt) {
  return lat >= 14.0 && lat <= 33.0 &&
         lon >= -118.5 && lon <= -86.0 &&
         alt > 0;
}

// VN-B3: Fechas coherentes
function validarFechas(fechaInicio, fechaFin, fechaRegistro) {
  return new Date(fechaInicio) <= new Date(fechaFin) &&
         new Date(fechaFin) <= new Date(fechaRegistro);
}

// VN-B4: Intervalos continuos
function validarIntervalos(intervalos, longitudTotal) {
  // Primer intervalo debe iniciar en 0
  if (intervalos[0].desde !== 0) return false;
  
  // Intervalos deben ser continuos
  for (let i = 1; i < intervalos.length; i++) {
    if (Math.abs(intervalos[i].desde - intervalos[i-1].hasta) > 0.001) {
      return false;
    }
  }
  
  // Último intervalo debe terminar en longitud total
  const ultimo = intervalos[intervalos.length - 1];
  return Math.abs(ultimo.hasta - longitudTotal) < 0.001;
}

// VN-B5: Cálculo y validación de TCR
function calcularTCR(longitudRecuperada, longitudPerforada) {
  return (longitudRecuperada / longitudPerforada) * 100;
}

function validarTCR(tcr, litologia) {
  const limites = {
    'Rocas ígneas intrusivas y extrusivas masivas': 90,
    'Depósitos de arcilla, limo y conglomerados': 85,
    'Rocas volcánicas fracturadas / Tobas': 75
  };
  
  const limite = limites[litologia] || 75;
  return {
    valido: tcr >= limite,
    limite,
    requiereJustificacion: tcr < limite
  };
}
```

### Validaciones de Muestra

```javascript
// VN-M1: Dependencia de barreno para núcleo
function validarDependenciaBarreno(tipo, catalogoBarrenos) {
  if (tipo === 'Núcleo') {
    return catalogoBarrenos.length > 0;
  }
  return true;
}

// VN-M2: Barreno existe en catálogo
function validarBarrenoExiste(barreno
Id, catalogoBarrenos) {
  return catalogoBarrenos.some(b => b.id === barreno Id);
}

// VN-M3: Intervalo existe en barreno
function validarIntervaloExiste(barrenoId, intervaloId, catalogoBarrenos) {
  const barreno = catalogoBarrenos.find(b => b.id === barrenoId);
  return barreno && barreno.intervalos.some(i => i.id === intervaloId);
}

// VN-M4: Desde/Hasta dentro del rango del intervalo
function validarRangoIntervalo(desde, hasta, intervalo) {
  return desde >= intervalo.desde &&
         hasta <= intervalo.hasta &&
         hasta >= desde;
}

// VN-M5: Intervalo de salmuera coherente
function validarIntervaloSalmuera(inicio, fin) {
  return fin >= inicio;
}
```

### Validaciones de Análisis

```javascript
// VN-A1: Muestra existe en catálogo
function validarMuestraExiste(muestraId, catalogoMuestras) {
  return catalogoMuestras.some(m => m.id === muestraId);
}

// VN-A2: Fecha análisis >= fecha muestra
function validarFechaAnalisis(fechaAnalisis, fechaMuestra) {
  return new Date(fechaAnalisis) >= new Date(fechaMuestra);
}

// VN-A3: Concentraciones en rangos válidos
function validarConcentraciones(resultados) {
  return resultados.every(r => 
    r.concentracion >= 0 &&
    (r.limitDeteccion ? r.concentracion >= r.limitDeteccion : true)
  );
}

// VN-A4: Comparación campo vs laboratorio
function compararResultados(campo, laboratorio, umbral = 20) {
  const discrepancias = [];
  
  campo.resultados.forEach(rc => {
    const rl = laboratorio.resultados.find(r => r.elemento === rc.elemento);
    if (rl) {
      const diff = Math.abs((rl.concentracion - rc.concentracion) / rc.concentracion) * 100;
      discrepancias.push({
        elemento: rc.elemento,
        valorCampo: rc.concentracion,
        valorLaboratorio: rl.concentracion,
        diferenciaPorcentual: diff,
        significativa: diff > umbral
      });
    }
  });
  
  return discrepancias;
}
```

## Algoritmo: Calculadora de Litio Probable

```javascript
/**
 * Calculadora de Litio Probable
 * Estima concentración de litio basado en elementos correlacionados
 * detectados en análisis de campo (LIBS/XRF)
 */
class CalculadoraLitio {
  constructor() {
    // Coeficientes de correlación (ajustados con datos históricos)
    this.coeficientes = {
      Na: 0.15,   // Sodio
      K: 0.12,    // Potasio
      Mg: -0.08,  // Magnesio (correlación negativa)
      Ca: -0.05,  // Calcio (correlación negativa)
      Rb: 0.45,   // Rubidio (alta correlación)
      Cs: 0.38,   // Cesio (alta correlación)
      B: 0.22     // Boro
    };
    
    // Pesos de confianza por elemento
    this.pesos = {
      Na: 0.8,
      K: 0.7,
      Mg: 0.6,
      Ca: 0.5,
      Rb: 0.95,
      Cs: 0.90,
      B: 0.85
    };
  }
  
  /**
   * Calcula concentración estimada de litio
   * @param {Array} resultados - Resultados del análisis de campo
   * @returns {Object} - {concentracion, confianza, requiereLab, notas}
   */
  calcular(resultados) {
    let sumaP
onderada = 0;
    let sumaPesos = 0;
    const elementosUsados = [];
    
    // Calcular estimación ponderada
    resultados.forEach(r => {
      if (this.coeficientes[r.elemento]) {
        const contribucion = r.concentracion * this.coeficientes[r.elemento];
        const peso = this.pesos[r.elemento];
        
        sumaPonderada += contribucion * peso;
        sumaPesos += peso;
        elementosUsados.push(r.elemento);
      }
    });
    
    // Concentración estimada
    const concentracion = sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
    
    // Nivel de confianza basado en elementos disponibles
    const confianza = this.calcularConfianza(elementosUsados);
    
    // Determinar si requiere laboratorio
    const requiereLab = this.requiereLaboratorio(concentracion, confianza);
    
    // Generar notas
    const notas = this.generarNotas(concentracion, confianza, elementosUsados);
    
    return {
      concentracionEstimada: Math.round(concentracion),
      nivelConfianza: Math.round(confianza),
      requiereLaboratorio: requiereLab,
      notas
    };
  }
  
  calcularConfianza(elementosUsados) {
    // Elementos clave para alta confianza
    const elementosClave = ['Rb', 'Cs', 'B'];
    const tieneElementosClave = elementosClave.some(e => elementosUsados.includes(e));
    
    // Base de confianza
    let confianza = 40;
    
    // Bonus por elementos usados
    confianza += elementosUsados.length * 8;
    
    // Bonus por elementos clave
    if (tieneElementosClave) confianza += 20;
    
    // Cap en 95% (nunca 100% sin laboratorio)
    return Math.min(confianza, 95);
  }
  
  requiereLaboratorio(concentracion, confianza) {
    // Siempre requiere lab si concentración > 500 ppm (potencial económico)
    if (concentracion > 500) return true;
    
    // Requiere lab si confianza < 70%
    if (confianza < 70) return true;
    
    // No requiere lab urgente si concentración baja y confianza alta
    return false;
  }
  
  generarNotas(concentracion, confianza, elementosUsados) {
    let notas = [];
    
    if (concentracion > 1000) {
      notas.push('⚠️ Concentración alta detectada. Análisis de laboratorio URGENTE.');
    } else if (concentracion > 500) {
      notas.push('✓ Concentración prometedora. Recomendar análisis de laboratorio.');
    } else if (concentracion > 200) {
      notas.push('→ Concentración moderada. Considerar análisis de laboratorio.');
    } else {
      notas.push('ℹ️ Concentración baja. Análisis de laboratorio opcional.');
    }
    
    if (confianza < 60) {
      notas.push('⚠️ Confianza baja. Pocos elementos correlacionados detectados.');
    }
    
    if (!elementosUsados.includes('Rb') && !elementosUsados.includes('Cs')) {
      notas.push('ℹ️ No se detectaron Rb/Cs. Estimación basada en elementos secundarios.');
    }
    
    return notas.join(' ');
  }
}
```

## Control de Acceso Basado en Roles (RBAC)

### Matriz de Permisos

| Recurso              | Operador Campo | Técnico Lab | Geólogo | Coordinador | Admin |
|----------------------|----------------|-------------|---------|-------------|-------|
| Barrenos - Crear     | ✓              | ✗           | ✗       | ✓           | ✓     |
| Barrenos - Leer      | ✓ (propios)    | ✗           | ✓       | ✓           | ✓     |
| Barrenos - Editar    | ✓ (propios)    | ✗           | ✗       | ✓           | ✓     |
| Barrenos - Eliminar  | ✗              | ✗           | ✗       | ✓           | ✓     |
| Muestras - Crear     | ✓              | ✗           | ✗       | ✓           | ✓     |
| Muestras - Leer      | ✓ (propias)    | ✓           | ✓       | ✓           | ✓     |
| Muestras - Editar    | ✓ (propias)    | ✗           | ✗       | ✓           | ✓     |
| Muestras - Eliminar  | ✗              | ✗           | ✗       | ✓           | ✓     |
| Análisis Campo - Crear | ✓            | ✗           | ✗       | ✓           | ✓     |
| Análisis Campo - Leer  | ✓ (propios)  | ✓           | ✓       | ✓           | ✓     |
| Análisis Lab - Crear   | ✗            | ✓           | ✗       | ✓           | ✓     |
| Análisis Lab - Leer    | ✗            | ✓ (propios) | ✓       | ✓           | ✓     |
| Dashboard              | ✗            | ✗           | ✓       | ✓           | ✓     |
| Exportar Datos         | ✗            | ✗           | ✓       | ✓           | ✓     |
| Gestión Usuarios       | ✗            | ✗           | ✗       | ✓           | ✓     |
| Configuración Sistema  | ✗            | ✗           | ✗       | ✗           | ✓     |

### Implementación de Permisos

```javascript
class AuthorizationService {
  constructor() {
    this.permisos = {
      operador_campo: {
        barrenos: { crear: true, leer: 'propios', actualizar: 'propios', eliminar: false },
        muestras: { crear: true, leer: 'propios', actualizar: 'propios', eliminar: false },
        analisisCampo: { crear: true, leer: 'propios', actualizar: 'propios', eliminar: false },
        analisisLaboratorio: { crear: false, leer: false, actualizar: false, eliminar: false },
        administracion: false
      },
      tecnico_lab: {
        barrenos: { crear: false, leer: false, actualizar: false, eliminar: false },
        muestras: { crear: false, leer: true, actualizar: false, eliminar: false },
        analisisCampo: { crear: false, leer: true, actualizar: false, eliminar: false },
        analisisLaboratorio: { crear: true, leer: 'propios', actualizar: 'propios', eliminar: false },
        administracion: false
      },
      geologo: {
        barrenos: { crear: false, leer: true, actualizar: false, eliminar: false },
        muestras: { crear: false, leer: true, actualizar: false, eliminar: false },
        analisisCampo: { crear: false, leer: true, actualizar: false, eliminar: false },
        analisisLaboratorio: { crear: false, leer: true, actualizar: false, eliminar: false },
        administracion: false
      },
      coordinador: {
        barrenos: { crear: true, leer: true, actualizar: true, eliminar: true },
        muestras: { crear: true, leer: true, actualizar: true, eliminar: true },
        analisisCampo: { crear: true, leer: true, actualizar: true, eliminar: true },
        analisisLaboratorio: { crear: true, leer: true, actualizar: true, eliminar: true },
        administracion: true
      },
      admin: {
        barrenos: { crear: true, leer: true, actualizar: true, eliminar: true },
        muestras: { crear: true, leer: true, actualizar: true, eliminar: true },
        analisisCampo: { crear: true, leer: true, actualizar: true, eliminar: true },
        analisisLaboratorio: { crear: true, leer: true, actualizar: true, eliminar: true },
        administracion: true
      }
    };
  }
  
  puedeAcceder(usuario, recurso, operacion, recursoId = null) {
    const permisos = this.permisos[usuario.rol];
    if (!permisos) return false;
    
    const permisoRecurso = permisos[recurso];
    if (!permisoRecurso) return false;
    
    const permiso = permisoRecurso[operacion];
    
    // Permiso booleano simple
    if (typeof permiso === 'boolean') return permiso;
    
    // Permiso "propios" - solo recursos creados por el usuario
    if (permiso === 'propios' && recursoId) {
      return this.esRecursoProp
io(usuario, recursoId);
    }
    
    return false;
  }
  
  esRecursoPropio(usuario, recursoId) {
    // Implementar lógica para verificar ownership
    // Consultar metadata.usuarioRegistro del recurso
    return true; // Placeholder
  }
}
```

## Estrategia de Almacenamiento

### LocalStorage (Catálogos y Datos Estructurados)

```javascript
// Claves de almacenamiento
const STORAGE_KEYS = {
  BARRENOS: 'siil_catalogo_barrenos_v1',
  MUESTRAS: 'siil_catalogo_muestras_v1',
  ANALISIS_CAMPO: 'siil_catalogo_analisis_campo_v1',
  ANALISIS_LAB: 'siil_catalogo_analisis_lab_v1',
  USUARIO: 'siil_usuario_actual',
  SYNC_QUEUE: 'siil_sync_queue_v1'
};

// Límite de localStorage: ~5-10MB
// Estrategia: Datos estructurados en localStorage, archivos en IndexedDB
```

### IndexedDB (Archivos y Blobs)

```javascript
// Esquema de IndexedDB
const DB_NAME = 'siil_db';
const DB_VERSION = 1;

const STORES = {
  ARCHIVOS: 'archivos',        // PDFs, Excel, CSV
  FOTOGRAFIAS: 'fotografias',  // Imágenes de muestras/núcleos
  SYNC_PENDING: 'sync_pending' // Archivos pendientes de sincronización
};

// Estructura de objeto en store 'archivos'
{
  id: 'uuid',
  tipo: 'certificado' | 'descripcion' | 'analisis',
  relacionadoA: 'barreno-id' | 'muestra-id' | 'analisis-id',
  nombre: 'archivo.pdf',
  mimeType: 'application/pdf',
  blob: Blob,
  timestamp: '2026-03-03T10:00:00Z',
  sincronizado: false
}
```

### Sincronización con Backend

```javascript
class SyncService {
  constructor() {
    this.syncQueue = [];
    this.syncInProgress = false;
  }
  
  /**
   * Encola operación para sincronización
   */
  enqueue(operacion) {
    this.syncQueue.push({
      id: generateUUID(),
      tipo: operacion.tipo,  // 'crear', 'actualizar', 'eliminar'
      recurso: operacion.recurso,  // 'barreno', 'muestra', etc.
      datos: operacion.datos,
      timestamp: new Date().toISOString(),
      intentos: 0,
      maxIntentos: 3
    });
    
    this.guardarQueue();
    this.intentarSync();
  }
  
  /**
   * Intenta sincronizar cola con backend
   */
  async intentarSync() {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    
    while (this.syncQueue.length > 0) {
      const operacion = this.syncQueue[0];
      
      try {
        await this.sincronizarOperacion(operacion);
        this.syncQueue.shift(); // Remover si exitoso
      } catch (error) {
        operacion.intentos++;
        
        if (operacion.intentos >= operacion.maxIntentos) {
          // Mover a cola de errores
          this.moverAColaErrores(operacion);
          this.syncQueue.shift();
        } else {
          // Reintentar después
          break;
        }
      }
    }
    
    this.guardarQueue();
    this.syncInProgress = false;
  }
  
  async sincronizarOperacion(operacion) {
    const endpoint = this.getEndpoint(operacion.recurso, operacion.tipo);
    const method = this.getMethod(operacion.tipo);
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(operacion.datos)
    });
    
    if (!response.ok) throw new Error('Sync failed');
    
    return await response.json();
  }
}
```

## Integración con API INEGI

```javascript
class InegiService {
  constructor() {
    this.baseUrl = 'https://gaia.inegi.org.mx/wscatgeo';
    this.cache = {
      estados: null,
      municipios: {}
    };
  }
  
  /**
   * Obtiene catálogo de estados
   */
  async getEstados() {
    if (this.cache.estados) return this.cache.estados;
    
    try {
      const response = await fetch(`${this.baseUrl}/mgee/`);
      const data = await response.json();
      
      this.cache.estados = data.datos.map(e => ({
        cve: e.cve_agee,
        nombre: e.nom_agee
      }));
      
      return this.cache.estados;
    } catch (error) {
      // Fallback a catálogo estático
      return this.getEstadosFallback();
    }
  }
  
  /**
   * Obtiene municipios por estado
   */
  async getMunicipios(estadoCve) {
    if (this.cache.municipios[estadoCve]) {
      return this.cache.municipios[estadoCve];
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/mgem/${estadoCve}`);
      const data = await response.json();
      
      this.cache.municipios[estadoCve] = data.datos.map(m => ({
        cve: m.cve_agem,
        nombre: m.nom_agem
      }));
      
      return this.cache.municipios[estadoCve];
    } catch (error) {
      return [];
    }
  }
  
  getEstadosFallback() {
    return [
      { cve: '01', nombre: 'Aguascalientes' },
      { cve: '02', nombre: 'Baja California' },
      { cve: '03', nombre: 'Baja California Sur' },
      // ... resto de estados
    ];
  }
}
```

## Componentes Reutilizables

### Wizard Multi-paso

```javascript
class Wizard {
  constructor(container, config) {
    this.container = container;
    this.steps = config.steps;
    this.currentStep = 0;
    this.data = {};
    this.onComplete = config.onComplete;
  }
  
  render() {
    this.renderIndicators();
    this.renderStep();
    this.renderNavigation();
  }
  
  renderIndicators() {
    const indicators = this.steps.map((step, index) => {
      const active = index === this.currentStep;
      const done = index < this.currentStep;
      return `
        <span class="step-indicator ${active ? 'active' : ''} ${done ? 'done' : ''}">
          ${index + 1}. ${step.title}
        </span>
      `;
    }).join('');
    
    this.container.querySelector('.indicators').innerHTML = indicators;
  }
  
  renderStep() {
    const step = this.steps[this.currentStep];
    const fields = step.fields
      .filter(f => !f.showIf || f.showIf(this.data))
      .map(f => this.renderField(f))
      .join('');
    
    this.container.querySelector('.step-content').innerHTML = `
      <h2>${step.title}</h2>
      <p>${step.subtitle}</p>
      <div class="fields">${fields}</div>
    `;
  }
  
  renderField(field) {
    // Implementar renderizado de diferentes tipos de campos
    // text, number, select, radio, textarea, file, etc.
  }
  
  async next() {
    const errors = await this.validateStep();
    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    } else {
      this.submit();
    }
  }
  
  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }
  
  async validateStep() {
    const step = this.steps[this.currentStep];
    return step.validate ? await step.validate(this.data) : [];
  }
  
  async submit() {
    if (this.onComplete) {
      await this.onComplete(this.data);
    }
  }
}
```

## Estrategia de Testing

### Unit Tests (Jest)

```javascript
// Ejemplo: tests/calculators/tcr-calculator.test.js
describe('TCR Calculator', () => {
  test('calcula TCR correctamente', () => {
    const tcr = calcularTCR(85, 100);
    expect(tcr).toBe(85);
  });
  
  test('valida TCR para rocas ígneas', () => {
    const resultado = validarTCR(92, 'Rocas ígneas intrusivas y extrusivas masivas');
    expect(resultado.valido).toBe(true);
    expect(resultado.requiereJustificacion).toBe(false);
  });
  
  test('requiere justificación si TCR bajo', () => {
    const resultado = validarTCR(70, 'Depósitos de arcilla, limo y conglomerados');
    expect(resultado.valido).toBe(false);
    expect(resultado.requiereJustificacion).toBe(true);
  });
});
```

### Integration Tests

```javascript
// Ejemplo: tests/integration/registro-muestra-nucleo.test.js
describe('Registro de Muestra - Flujo Núcleo', () => {
  beforeEach(() => {
    // Setup: crear barreno en catálogo
    const barreno = crearBarrenoMock();
    guardarEnCatalogo(barreno);
  });
  
  test('permite registrar muestra si hay barreno', async () => {
    const muestra = {
      fuente: 'Arcillas',
      tipo: 'Núcleo',
      barreno: 'TEST-SON-BRN-001',
      intervalo: 'INT-01'
    };
    
    const resultado = await registrarMuestra(muestra);
    expect(resultado.exito).toBe(true);
    expect(resultado.muestra.referenciaBarreno).toBeDefined();
  });
  
  test('bloquea registro si no hay barreno', async () => {
    limpiarCatalogo();
    
    const muestra = {
      fuente: 'Arcillas',
      tipo: 'Núcleo'
    };
    
    const resultado = await registrarMuestra(muestra);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toContain('No hay barrenos');
  });
});
```

## Consideraciones de Rendimiento

### Optimizaciones

1. **Lazy Loading de Catálogos**
   - Cargar catálogos solo cuando se necesitan
   - Cachear en memoria durante la sesión

2. **Virtualización de Listas Largas**
   - Usar virtual scrolling para listas de 1000+ items
   - Renderizar solo items visibles

3. **Debouncing de Búsquedas**
   - Esperar 300ms después del último keystroke
   - Cancelar búsquedas anteriores

4. **Web Workers para Cálculos Pesados**
   - Calculadora de litio en worker
   - Parseo de archivos grandes en worker

5. **Service Worker para Modo Offline**
   - Cachear assets estáticos
   - Estrategia cache-first para datos

## Seguridad

### Medidas de Seguridad

1. **Autenticación**
   - JWT tokens con expiración
   - Refresh tokens
   - Logout automático por inactividad

2. **Autorización**
   - RBAC implementado en frontend y backend
   - Validación de permisos en cada operación

3. **Validación de Datos**
   - Sanitización de inputs
   - Validación de tipos y rangos
   - Prevención de XSS

4. **Encriptación**
   - HTTPS obligatorio
   - Datos sensibles encriptados en tránsito

5. **Auditoría**
   - Log de todas las operaciones
   - Timestamp y usuario en metadata
   - Historial de cambios

## Próximos Pasos

1. Crear tasks.md con tareas de implementación
2. Implementar módulos core (state-manager, storage, validator)
3. Implementar servicios (barreno, muestra, análisis)
4. Implementar componentes reutilizables (wizard, form-builder)
5. Implementar páginas específicas
6. Implementar calculadora de litio
7. Implementar sistema de autenticación/autorización
8. Implementar sincronización offline
9. Testing exhaustivo
10. Documentación de usuario
