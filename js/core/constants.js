/**
 * SIIL - Sistema Integral de Información del Litio
 * Archivo de Constantes Globales
 * 
 * Este archivo centraliza todas las constantes utilizadas en el sistema SIIL
 * para garantizar consistencia y facilitar el mantenimiento.
 */

// ============================================================================
// STORAGE KEYS - Claves para localStorage e IndexedDB
// ============================================================================

export const STORAGE_KEYS = {
  // Catálogos principales
  BARRENOS: 'siil_catalogo_barrenos_v1',
  MUESTRAS: 'siil_catalogo_muestras_v1',
  ANALISIS_CAMPO: 'siil_catalogo_analisis_campo_v1',
  ANALISIS_LAB: 'siil_catalogo_analisis_lab_v1',
  
  // Autenticación y sesión
  USUARIO: 'siil_usuario_actual',
  TOKEN: 'siil_auth_token',
  REFRESH_TOKEN: 'siil_refresh_token',
  
  // Sincronización
  SYNC_QUEUE: 'siil_sync_queue_v1',
  SYNC_ERRORS: 'siil_sync_errors_v1',
  LAST_SYNC: 'siil_last_sync_timestamp',
  
  // Cache
  CACHE_ESTADOS: 'siil_cache_estados',
  CACHE_MUNICIPIOS: 'siil_cache_municipios',
  CACHE_TIMESTAMP: 'siil_cache_timestamp'
};

// ============================================================================
// API ENDPOINTS - URLs de servicios backend
// ============================================================================

export const API_ENDPOINTS = {
  BASE_URL: '/api/v1',
  
  // Autenticación
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_REFRESH: '/api/v1/auth/refresh',
  AUTH_VERIFY: '/api/v1/auth/verify',
  
  // Barrenos
  BARRENOS: '/api/v1/barrenos',
  BARRENOS_BY_ID: '/api/v1/barrenos/:id',
  BARRENOS_SEARCH: '/api/v1/barrenos/search',
  
  // Muestras
  MUESTRAS: '/api/v1/muestras',
  MUESTRAS_BY_ID: '/api/v1/muestras/:id',
  MUESTRAS_SEARCH: '/api/v1/muestras/search',
  MUESTRAS_BY_BARRENO: '/api/v1/muestras/barreno/:barrenoId',
  
  // Análisis de Campo
  ANALISIS_CAMPO: '/api/v1/analisis-campo',
  ANALISIS_CAMPO_BY_ID: '/api/v1/analisis-campo/:id',
  ANALISIS_CAMPO_BY_MUESTRA: '/api/v1/analisis-campo/muestra/:muestraId',
  
  // Análisis de Laboratorio
  ANALISIS_LAB: '/api/v1/analisis-laboratorio',
  ANALISIS_LAB_BY_ID: '/api/v1/analisis-laboratorio/:id',
  ANALISIS_LAB_BY_MUESTRA: '/api/v1/analisis-laboratorio/muestra/:muestraId',
  
  // Usuarios
  USUARIOS: '/api/v1/usuarios',
  USUARIOS_BY_ID: '/api/v1/usuarios/:id',
  
  // Archivos
  UPLOAD_FILE: '/api/v1/archivos/upload',
  DOWNLOAD_FILE: '/api/v1/archivos/:id',
  
  // Servicios externos
  INEGI_ESTADOS: 'https://gaia.inegi.org.mx/wscatgeo/mgee/',
  INEGI_MUNICIPIOS: 'https://gaia.inegi.org.mx/wscatgeo/mgem/:estadoCve'
};

// ============================================================================
// VALIDATION RANGES - Rangos de validación
// ============================================================================

export const VALIDATION_RANGES = {
  // Coordenadas geográficas (México)
  LATITUD_MIN: 14.0,
  LATITUD_MAX: 33.0,
  LONGITUD_MIN: -118.5,
  LONGITUD_MAX: -86.0,
  ALTITUD_MIN: 0,
  
  // Geometría de barreno
  AZIMUT_MIN: 0,
  AZIMUT_MAX: 360,
  INCLINACION_MIN: -90,
  INCLINACION_MAX: 0,
  
  // Mediciones (longitud de perforación)
  LONGITUD_PERFORADA_MIN: 0,
  DIAMETRO_MIN: 0,
  NUMERO_CAJAS_MIN: 1,
  
  // Parámetros físico-químicos
  PH_MIN: 0,
  PH_MAX: 14,
  TEMPERATURA_MIN: -50,
  TEMPERATURA_MAX: 200,
  PRESION_MIN: 0,
  CORTE_AGUA_MIN: 0,
  CORTE_AGUA_MAX: 100,
  
  // Concentraciones
  CONCENTRACION_MIN: 0,
  CONCENTRACION_LITIO_ECONOMICO: 500, // ppm
  CONCENTRACION_LITIO_ALTO: 1000 // ppm
};

// ============================================================================
// TCR LIMITS - Límites de Total Core Recovery por tipo de roca
// ============================================================================

export const TCR_LIMITS = {
  'Rocas ígneas intrusivas y extrusivas masivas': 90,
  'Depósitos de arcilla, limo y conglomerados': 85,
  'Rocas volcánicas fracturadas / Tobas': 75,
  DEFAULT: 75
};

// ============================================================================
// GEOGRAPHIC CODES - Códigos geográficos (Estados de México)
// ============================================================================

export const ESTADOS_MEXICO = [
  { cve: '01', nombre: 'Aguascalientes' },
  { cve: '02', nombre: 'Baja California' },
  { cve: '03', nombre: 'Baja California Sur' },
  { cve: '04', nombre: 'Campeche' },
  { cve: '05', nombre: 'Coahuila' },
  { cve: '06', nombre: 'Colima' },
  { cve: '07', nombre: 'Chiapas' },
  { cve: '08', nombre: 'Chihuahua' },
  { cve: '09', nombre: 'Ciudad de México' },
  { cve: '10', nombre: 'Durango' },
  { cve: '11', nombre: 'Guanajuato' },
  { cve: '12', nombre: 'Guerrero' },
  { cve: '13', nombre: 'Hidalgo' },
  { cve: '14', nombre: 'Jalisco' },
  { cve: '15', nombre: 'México' },
  { cve: '16', nombre: 'Michoacán' },
  { cve: '17', nombre: 'Morelos' },
  { cve: '18', nombre: 'Nayarit' },
  { cve: '19', nombre: 'Nuevo León' },
  { cve: '20', nombre: 'Oaxaca' },
  { cve: '21', nombre: 'Puebla' },
  { cve: '22', nombre: 'Querétaro' },
  { cve: '23', nombre: 'Quintana Roo' },
  { cve: '24', nombre: 'San Luis Potosí' },
  { cve: '25', nombre: 'Sinaloa' },
  { cve: '26', nombre: 'Sonora' },
  { cve: '27', nombre: 'Tabasco' },
  { cve: '28', nombre: 'Tamaulipas' },
  { cve: '29', nombre: 'Tlaxcala' },
  { cve: '30', nombre: 'Veracruz' },
  { cve: '31', nombre: 'Yucatán' },
  { cve: '32', nombre: 'Zacatecas' }
];

// ============================================================================
// FORM FIELD OPTIONS - Opciones para campos de formulario
// ============================================================================

export const LITOLOGIA_OPTIONS = [
  'Arcilla Lacustre',
  'Riolita',
  'Conglomerado',
  'Toba',
  'Basalto',
  'Andesita',
  'Ignimbrita',
  'Brecha Volcánica',
  'Arenisca',
  'Lutita',
  'Caliza',
  'Granito',
  'Diorita',
  'Gabro',
  'Esquisto',
  'Gneis',
  'Cuarcita',
  'Mármol',
  'Otra'
];

export const ESTRUCTURA_GEOLOGICA_OPTIONS = [
  'Falla La Vía',
  'Cañada el Pozo',
  'Falla Normal',
  'Falla Inversa',
  'Falla de Rumbo',
  'Anticlinal',
  'Sinclinal',
  'Domo',
  'Cuenca',
  'Graben',
  'Horst',
  'Otra'
];

export const ACCESIBILIDAD_OPTIONS = [
  'Buena',
  'Regular',
  'Mala',
  'Solo helicóptero'
];

export const TIPO_TERRENO_OPTIONS = [
  'Planicie',
  'Lomerío suave',
  'Piedemonte',
  'Cañada/Arroyo',
  'Mesa/Meseta',
  'Sierra',
  'Banco de Material'
];

export const TIPO_BARRENACION_OPTIONS = [
  'Corte Diamante (CD)',
  'Rotaria',
  'Percusión',
  'Rotopercusión',
  'Wireline'
];

export const RQD_OPTIONS = [
  '90-100% Excelente',
  '75-90% Bueno',
  '50-75% Regular',
  '25-50% Pobre',
  '0-25% Muy pobre'
];

export const PROYECTO_OPTIONS = [
  'SEFMP.31',
  'LitioMx-Norte',
  'LitioMx-Centro',
  'LitioMx-Sur',
  'Exploración Regional',
  'Otro'
];

export const INSTITUCION_OPTIONS = [
  'UNISON',
  'SGM',
  'LitioMx',
  'UNAM',
  'IPN',
  'CICESE',
  'Otra'
];

export const FUENTE_MUESTRA_OPTIONS = [
  'Arcillas',
  'Salmueras'
];

export const ORIGEN_MUESTRA_OPTIONS = [
  'Superficie',
  'Profundidad (Núcleo)'
];

export const TIPO_ANALISIS_CAMPO_OPTIONS = [
  'LIBS',
  'XRF'
];

export const METODO_ANALISIS_LAB_OPTIONS = [
  'ICP-MS',
  'ICP-OES',
  'AAS',
  'XRF de Laboratorio',
  'Otro'
];

export const ELEMENTOS_QUIMICOS = [
  'Li', 'Na', 'K', 'Mg', 'Ca', 'Rb', 'Cs', 'B',
  'Al', 'Si', 'Fe', 'Mn', 'Ti', 'P', 'S', 'Cl',
  'Sr', 'Ba', 'Zn', 'Cu', 'Pb', 'Ni', 'Co', 'Cr'
];

export const UNIDADES_CONCENTRACION = [
  'ppm',
  '%',
  'mg/L',
  'g/L',
  'mg/kg',
  'ppb'
];

// ============================================================================
// FILE UPLOAD LIMITS - Límites de carga de archivos
// ============================================================================

export const FILE_UPLOAD = {
  // Tipos de archivo permitidos
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ],
  
  // Extensiones permitidas
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.xls', '.xlsx', '.csv'],
  
  // Tamaños máximos (en bytes)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10 MB
  
  // Límites de cantidad
  MAX_IMAGES_PER_UPLOAD: 10,
  MAX_DOCUMENTS_PER_UPLOAD: 5
};

// ============================================================================
// USER ROLES - Roles de usuario y permisos
// ============================================================================

export const USER_ROLES = {
  OPERADOR_CAMPO: 'operador_campo',
  TECNICO_LAB: 'tecnico_lab',
  GEOLOGO: 'geologo',
  COORDINADOR: 'coordinador',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [USER_ROLES.OPERADOR_CAMPO]: 'Operador de Campo',
  [USER_ROLES.TECNICO_LAB]: 'Técnico de Laboratorio',
  [USER_ROLES.GEOLOGO]: 'Geólogo/Investigador',
  [USER_ROLES.COORDINADOR]: 'Coordinador de Proyecto',
  [USER_ROLES.ADMIN]: 'Administrador del Sistema'
};

// ============================================================================
// CALCULADORA DE LITIO - Coeficientes y configuración
// ============================================================================

export const LITIO_CALCULATOR = {
  // Coeficientes de correlación por elemento
  COEFICIENTES: {
    Na: 0.15,   // Sodio
    K: 0.12,    // Potasio
    Mg: -0.08,  // Magnesio (correlación negativa)
    Ca: -0.05,  // Calcio (correlación negativa)
    Rb: 0.45,   // Rubidio (alta correlación)
    Cs: 0.38,   // Cesio (alta correlación)
    B: 0.22     // Boro
  },
  
  // Pesos de confianza por elemento
  PESOS: {
    Na: 0.8,
    K: 0.7,
    Mg: 0.6,
    Ca: 0.5,
    Rb: 0.95,
    Cs: 0.90,
    B: 0.85
  },
  
  // Elementos clave para alta confianza
  ELEMENTOS_CLAVE: ['Rb', 'Cs', 'B'],
  
  // Umbrales
  CONFIANZA_BASE: 40,
  CONFIANZA_POR_ELEMENTO: 8,
  CONFIANZA_BONUS_ELEMENTOS_CLAVE: 20,
  CONFIANZA_MAX: 95,
  CONFIANZA_MIN_LABORATORIO: 70,
  
  // Umbrales de concentración
  UMBRAL_URGENTE: 1000,      // ppm - requiere análisis urgente
  UMBRAL_PROMETEDOR: 500,    // ppm - requiere análisis
  UMBRAL_MODERADO: 200       // ppm - considerar análisis
};

// ============================================================================
// INDEXEDDB CONFIGURATION - Configuración de IndexedDB
// ============================================================================

export const INDEXEDDB_CONFIG = {
  DB_NAME: 'siil_db',
  DB_VERSION: 1,
  
  STORES: {
    ARCHIVOS: 'archivos',
    FOTOGRAFIAS: 'fotografias',
    SYNC_PENDING: 'sync_pending'
  }
};

// ============================================================================
// UI CONFIGURATION - Configuración de interfaz
// ============================================================================

export const UI_CONFIG = {
  // Paginación
  ITEMS_PER_PAGE: 20,
  
  // Búsqueda
  SEARCH_DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 3,
  
  // Timeouts
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutos
  NOTIFICATION_DURATION_MS: 5000,
  
  // Formatos de fecha
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',
  DISPLAY_DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  
  // Precisión numérica
  COORDINATE_DECIMALS: 6,
  MEASUREMENT_DECIMALS: 2,
  CONCENTRATION_DECIMALS: 2,
  PERCENTAGE_DECIMALS: 1
};

// ============================================================================
// ERROR MESSAGES - Mensajes de error estándar
// ============================================================================

export const ERROR_MESSAGES = {
  // Validación de campos
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Correo electrónico inválido',
  INVALID_NUMBER: 'Debe ser un número válido',
  INVALID_DATE: 'Fecha inválida',
  
  // Validación de rangos
  LATITUD_OUT_OF_RANGE: `La latitud debe estar entre ${VALIDATION_RANGES.LATITUD_MIN}° y ${VALIDATION_RANGES.LATITUD_MAX}°`,
  LONGITUD_OUT_OF_RANGE: `La longitud debe estar entre ${VALIDATION_RANGES.LONGITUD_MIN}° y ${VALIDATION_RANGES.LONGITUD_MAX}°`,
  ALTITUD_INVALID: 'La altitud debe ser mayor a 0 msnm',
  
  // Validación de archivos
  FILE_TOO_LARGE: 'El archivo excede el tamaño máximo permitido',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  TOO_MANY_FILES: 'Se excedió el número máximo de archivos',
  
  // Dependencias
  NO_BARRENOS_AVAILABLE: 'No hay barrenos registrados. Debe registrar un barreno antes de crear una muestra de núcleo.',
  BARRENO_NOT_FOUND: 'El barreno seleccionado no existe',
  MUESTRA_NOT_FOUND: 'La muestra seleccionada no existe',
  INTERVALO_NOT_FOUND: 'El intervalo seleccionado no existe',
  
  // Autenticación
  UNAUTHORIZED: 'No tiene permisos para realizar esta acción',
  SESSION_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  
  // Red y sincronización
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  SYNC_ERROR: 'Error al sincronizar datos',
  SERVER_ERROR: 'Error del servidor. Intente nuevamente más tarde',
  
  // Storage
  STORAGE_FULL: 'Almacenamiento lleno. Libere espacio o sincronice sus datos',
  STORAGE_ERROR: 'Error al guardar datos localmente'
};

// ============================================================================
// SUCCESS MESSAGES - Mensajes de éxito estándar
// ============================================================================

export const SUCCESS_MESSAGES = {
  BARRENO_CREATED: 'Barreno registrado exitosamente',
  MUESTRA_CREATED: 'Muestra registrada exitosamente',
  ANALISIS_CREATED: 'Análisis registrado exitosamente',
  DATA_UPDATED: 'Datos actualizados exitosamente',
  DATA_DELETED: 'Datos eliminados exitosamente',
  SYNC_SUCCESS: 'Datos sincronizados exitosamente',
  FILE_UPLOADED: 'Archivo cargado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso'
};

// ============================================================================
// REGEX PATTERNS - Patrones de expresiones regulares
// ============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  POSTAL_CODE: /^\d{5}$/,
  BARRENO_ID: /^[A-Z0-9]+-[A-Z0-9]+-BRN-\d{3,}$/,
  MUESTRA_ID: /^SIIL-MUE-[A-Z0-9]+-\d{8}-\d{4}$/,
  INTERVALO_ID: /^INT-\d{2,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
};

// ============================================================================
// EXPORT DEFAULT - Objeto con todas las constantes
// ============================================================================

export default {
  STORAGE_KEYS,
  API_ENDPOINTS,
  VALIDATION_RANGES,
  TCR_LIMITS,
  ESTADOS_MEXICO,
  LITOLOGIA_OPTIONS,
  ESTRUCTURA_GEOLOGICA_OPTIONS,
  ACCESIBILIDAD_OPTIONS,
  TIPO_TERRENO_OPTIONS,
  TIPO_BARRENACION_OPTIONS,
  RQD_OPTIONS,
  PROYECTO_OPTIONS,
  INSTITUCION_OPTIONS,
  FUENTE_MUESTRA_OPTIONS,
  ORIGEN_MUESTRA_OPTIONS,
  TIPO_ANALISIS_CAMPO_OPTIONS,
  METODO_ANALISIS_LAB_OPTIONS,
  ELEMENTOS_QUIMICOS,
  UNIDADES_CONCENTRACION,
  FILE_UPLOAD,
  USER_ROLES,
  ROLE_LABELS,
  LITIO_CALCULATOR,
  INDEXEDDB_CONFIG,
  UI_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS
};
