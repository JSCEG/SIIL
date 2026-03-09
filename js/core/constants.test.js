/**
 * Tests para constants.js
 * Verifica que todas las constantes estén correctamente definidas
 */

import {
  STORAGE_KEYS,
  API_ENDPOINTS,
  VALIDATION_RANGES,
  TCR_LIMITS,
  ESTADOS_MEXICO,
  LITOLOGIA_OPTIONS,
  FILE_UPLOAD,
  USER_ROLES,
  LITIO_CALCULATOR,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS
} from './constants.js';

describe('Constants - STORAGE_KEYS', () => {
  test('todas las claves de storage están definidas', () => {
    expect(STORAGE_KEYS.BARRENOS).toBeDefined();
    expect(STORAGE_KEYS.MUESTRAS).toBeDefined();
    expect(STORAGE_KEYS.ANALISIS_CAMPO).toBeDefined();
    expect(STORAGE_KEYS.ANALISIS_LAB).toBeDefined();
    expect(STORAGE_KEYS.USUARIO).toBeDefined();
    expect(STORAGE_KEYS.SYNC_QUEUE).toBeDefined();
  });

  test('las claves tienen el prefijo correcto', () => {
    expect(STORAGE_KEYS.BARRENOS).toMatch(/^siil_/);
    expect(STORAGE_KEYS.MUESTRAS).toMatch(/^siil_/);
    expect(STORAGE_KEYS.USUARIO).toMatch(/^siil_/);
  });
});

describe('Constants - API_ENDPOINTS', () => {
  test('todos los endpoints principales están definidos', () => {
    expect(API_ENDPOINTS.BASE_URL).toBeDefined();
    expect(API_ENDPOINTS.AUTH_LOGIN).toBeDefined();
    expect(API_ENDPOINTS.BARRENOS).toBeDefined();
    expect(API_ENDPOINTS.MUESTRAS).toBeDefined();
    expect(API_ENDPOINTS.ANALISIS_CAMPO).toBeDefined();
    expect(API_ENDPOINTS.ANALISIS_LAB).toBeDefined();
  });

  test('los endpoints tienen el prefijo correcto', () => {
    expect(API_ENDPOINTS.AUTH_LOGIN).toMatch(/^\/api\/v1\//);
    expect(API_ENDPOINTS.BARRENOS).toMatch(/^\/api\/v1\//);
    expect(API_ENDPOINTS.MUESTRAS).toMatch(/^\/api\/v1\//);
  });
});

describe('Constants - VALIDATION_RANGES', () => {
  test('rangos de coordenadas están definidos correctamente', () => {
    expect(VALIDATION_RANGES.LATITUD_MIN).toBe(14.0);
    expect(VALIDATION_RANGES.LATITUD_MAX).toBe(33.0);
    expect(VALIDATION_RANGES.LONGITUD_MIN).toBe(-118.5);
    expect(VALIDATION_RANGES.LONGITUD_MAX).toBe(-86.0);
    expect(VALIDATION_RANGES.ALTITUD_MIN).toBe(0);
  });

  test('rangos de geometría están definidos correctamente', () => {
    expect(VALIDATION_RANGES.AZIMUT_MIN).toBe(0);
    expect(VALIDATION_RANGES.AZIMUT_MAX).toBe(360);
    expect(VALIDATION_RANGES.INCLINACION_MIN).toBe(-90);
    expect(VALIDATION_RANGES.INCLINACION_MAX).toBe(0);
  });

  test('umbrales de concentración de litio están definidos', () => {
    expect(VALIDATION_RANGES.CONCENTRACION_LITIO_ECONOMICO).toBe(500);
    expect(VALIDATION_RANGES.CONCENTRACION_LITIO_ALTO).toBe(1000);
  });
});

describe('Constants - TCR_LIMITS', () => {
  test('límites de TCR por tipo de roca están definidos', () => {
    expect(TCR_LIMITS['Rocas ígneas intrusivas y extrusivas masivas']).toBe(90);
    expect(TCR_LIMITS['Depósitos de arcilla, limo y conglomerados']).toBe(85);
    expect(TCR_LIMITS['Rocas volcánicas fracturadas / Tobas']).toBe(75);
    expect(TCR_LIMITS.DEFAULT).toBe(75);
  });

  test('todos los límites son números positivos', () => {
    Object.values(TCR_LIMITS).forEach(limite => {
      expect(typeof limite).toBe('number');
      expect(limite).toBeGreaterThan(0);
      expect(limite).toBeLessThanOrEqual(100);
    });
  });
});

describe('Constants - ESTADOS_MEXICO', () => {
  test('contiene 32 estados', () => {
    expect(ESTADOS_MEXICO).toHaveLength(32);
  });

  test('cada estado tiene cve y nombre', () => {
    ESTADOS_MEXICO.forEach(estado => {
      expect(estado.cve).toBeDefined();
      expect(estado.nombre).toBeDefined();
      expect(typeof estado.cve).toBe('string');
      expect(typeof estado.nombre).toBe('string');
    });
  });

  test('las claves son únicas', () => {
    const claves = ESTADOS_MEXICO.map(e => e.cve);
    const clavesUnicas = new Set(claves);
    expect(clavesUnicas.size).toBe(ESTADOS_MEXICO.length);
  });

  test('incluye estados clave para litio', () => {
    const nombres = ESTADOS_MEXICO.map(e => e.nombre);
    expect(nombres).toContain('Sonora');
    expect(nombres).toContain('Baja California');
    expect(nombres).toContain('Zacatecas');
  });
});

describe('Constants - LITOLOGIA_OPTIONS', () => {
  test('contiene opciones de litología', () => {
    expect(LITOLOGIA_OPTIONS.length).toBeGreaterThan(0);
    expect(LITOLOGIA_OPTIONS).toContain('Arcilla Lacustre');
    expect(LITOLOGIA_OPTIONS).toContain('Riolita');
    expect(LITOLOGIA_OPTIONS).toContain('Otra');
  });
});

describe('Constants - FILE_UPLOAD', () => {
  test('tipos de archivo permitidos están definidos', () => {
    expect(FILE_UPLOAD.ALLOWED_IMAGE_TYPES).toBeDefined();
    expect(FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES).toBeDefined();
    expect(Array.isArray(FILE_UPLOAD.ALLOWED_IMAGE_TYPES)).toBe(true);
    expect(Array.isArray(FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES)).toBe(true);
  });

  test('tamaños máximos están definidos', () => {
    expect(FILE_UPLOAD.MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024); // 5 MB
    expect(FILE_UPLOAD.MAX_DOCUMENT_SIZE).toBe(10 * 1024 * 1024); // 10 MB
  });

  test('límites de cantidad están definidos', () => {
    expect(FILE_UPLOAD.MAX_IMAGES_PER_UPLOAD).toBeGreaterThan(0);
    expect(FILE_UPLOAD.MAX_DOCUMENTS_PER_UPLOAD).toBeGreaterThan(0);
  });
});

describe('Constants - USER_ROLES', () => {
  test('todos los roles están definidos', () => {
    expect(USER_ROLES.OPERADOR_CAMPO).toBe('operador_campo');
    expect(USER_ROLES.TECNICO_LAB).toBe('tecnico_lab');
    expect(USER_ROLES.GEOLOGO).toBe('geologo');
    expect(USER_ROLES.COORDINADOR).toBe('coordinador');
    expect(USER_ROLES.ADMIN).toBe('admin');
  });
});

describe('Constants - LITIO_CALCULATOR', () => {
  test('coeficientes están definidos', () => {
    expect(LITIO_CALCULATOR.COEFICIENTES).toBeDefined();
    expect(LITIO_CALCULATOR.COEFICIENTES.Li).toBeUndefined(); // Li no debe tener coeficiente
    expect(LITIO_CALCULATOR.COEFICIENTES.Rb).toBeDefined();
    expect(LITIO_CALCULATOR.COEFICIENTES.Cs).toBeDefined();
  });

  test('pesos están definidos', () => {
    expect(LITIO_CALCULATOR.PESOS).toBeDefined();
    expect(LITIO_CALCULATOR.PESOS.Rb).toBeGreaterThan(0);
    expect(LITIO_CALCULATOR.PESOS.Cs).toBeGreaterThan(0);
  });

  test('elementos clave están definidos', () => {
    expect(LITIO_CALCULATOR.ELEMENTOS_CLAVE).toContain('Rb');
    expect(LITIO_CALCULATOR.ELEMENTOS_CLAVE).toContain('Cs');
    expect(LITIO_CALCULATOR.ELEMENTOS_CLAVE).toContain('B');
  });

  test('umbrales están definidos correctamente', () => {
    expect(LITIO_CALCULATOR.UMBRAL_URGENTE).toBe(1000);
    expect(LITIO_CALCULATOR.UMBRAL_PROMETEDOR).toBe(500);
    expect(LITIO_CALCULATOR.UMBRAL_MODERADO).toBe(200);
    expect(LITIO_CALCULATOR.CONFIANZA_MAX).toBe(95);
  });
});

describe('Constants - ERROR_MESSAGES', () => {
  test('mensajes de error comunes están definidos', () => {
    expect(ERROR_MESSAGES.REQUIRED_FIELD).toBeDefined();
    expect(ERROR_MESSAGES.INVALID_EMAIL).toBeDefined();
    expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined();
    expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
  });

  test('mensajes de error de dependencias están definidos', () => {
    expect(ERROR_MESSAGES.NO_BARRENOS_AVAILABLE).toBeDefined();
    expect(ERROR_MESSAGES.BARRENO_NOT_FOUND).toBeDefined();
    expect(ERROR_MESSAGES.MUESTRA_NOT_FOUND).toBeDefined();
  });
});

describe('Constants - SUCCESS_MESSAGES', () => {
  test('mensajes de éxito están definidos', () => {
    expect(SUCCESS_MESSAGES.BARRENO_CREATED).toBeDefined();
    expect(SUCCESS_MESSAGES.MUESTRA_CREATED).toBeDefined();
    expect(SUCCESS_MESSAGES.ANALISIS_CREATED).toBeDefined();
    expect(SUCCESS_MESSAGES.SYNC_SUCCESS).toBeDefined();
  });
});

describe('Constants - REGEX_PATTERNS', () => {
  test('patrones de validación están definidos', () => {
    expect(REGEX_PATTERNS.EMAIL).toBeDefined();
    expect(REGEX_PATTERNS.BARRENO_ID).toBeDefined();
    expect(REGEX_PATTERNS.MUESTRA_ID).toBeDefined();
    expect(REGEX_PATTERNS.UUID).toBeDefined();
  });

  test('patrón de email valida correctamente', () => {
    expect(REGEX_PATTERNS.EMAIL.test('usuario@ejemplo.com')).toBe(true);
    expect(REGEX_PATTERNS.EMAIL.test('invalido')).toBe(false);
    expect(REGEX_PATTERNS.EMAIL.test('invalido@')).toBe(false);
  });

  test('patrón de ID de barreno valida correctamente', () => {
    expect(REGEX_PATTERNS.BARRENO_ID.test('SEFMP31-SON-BRN-001')).toBe(true);
    expect(REGEX_PATTERNS.BARRENO_ID.test('invalido')).toBe(false);
  });

  test('patrón de ID de muestra valida correctamente', () => {
    expect(REGEX_PATTERNS.MUESTRA_ID.test('SIIL-MUE-2601-20260303-1234')).toBe(true);
    expect(REGEX_PATTERNS.MUESTRA_ID.test('invalido')).toBe(false);
  });
});

describe('Constants - Integridad General', () => {
  test('no hay valores undefined en constantes principales', () => {
    expect(STORAGE_KEYS.BARRENOS).not.toBeUndefined();
    expect(API_ENDPOINTS.BASE_URL).not.toBeUndefined();
    expect(VALIDATION_RANGES.LATITUD_MIN).not.toBeUndefined();
    expect(TCR_LIMITS.DEFAULT).not.toBeUndefined();
  });

  test('arrays de opciones no están vacíos', () => {
    expect(LITOLOGIA_OPTIONS.length).toBeGreaterThan(0);
    expect(ESTADOS_MEXICO.length).toBeGreaterThan(0);
    expect(FILE_UPLOAD.ALLOWED_IMAGE_TYPES.length).toBeGreaterThan(0);
  });
});
