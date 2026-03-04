# Sistema Integral de Información del Litio (SIIL) - Registro de Muestras Completo

## Fecha de Creación
3 de marzo de 2026

## Contexto del Proyecto

El Sistema Integral de Información del Litio (SIIL) es el repositorio único y plataforma de inteligencia estratégica para la gestión de todos los datos generados por el proyecto nacional de exploración de litio en México. Este sistema garantiza la trazabilidad absoluta y calidad de los datos desde el campo hasta el modelo predictivo.

## Objetivo

Implementar el flujo completo de registro de muestras del SIIL, integrando los 4 formularios interconectados con sus respectivos catálogos, roles de usuario, y flujos de trabajo según la arquitectura definida en el documento D05.F7_2.A3.1.

## Arquitectura del Sistema

### Flujo de Formularios Interconectados

```
1. REGISTRO DE BARRENO
   ↓ (genera catálogo de barrenos)
2. REGISTRO DE MUESTRA
   ↓ (genera catálogo de muestras con ID único)
3. ANÁLISIS DE CAMPO (LIBS & XRF)
   ↓ (usa catálogo de muestras)
4. ANÁLISIS DE LABORATORIO (ICP)
   ↓ (usa catálogo de muestras)
```

### Principio Clave de Dependencias

- **Barreno DEBE existir ANTES** de registrar una muestra de profundidad (núcleo)
- **Muestra DEBE existir ANTES** de registrar análisis de campo o laboratorio
- Cada formulario consume el catálogo generado por el anterior
- ID único de muestra es el núcleo de trazabilidad en todo el ciclo

## Roles y Perfiles de Usuario

### 1. Operador de Campo (Perforista/Muestreador)
**Responsabilidades:**
- Registrar barrenos en campo
- Registrar muestras (superficie y núcleo)
- Capturar coordenadas GPS
- Tomar fotografías de muestras
- Realizar análisis de campo (LIBS & XRF)

**Acceso:**
- Registro de Barreno (completo)
- Registro de Muestra (completo)
- Análisis de Campo (completo)
- Consulta de catálogos propios

### 2. Técnico de Laboratorio
**Responsabilidades:**
- Recibir muestras físicas
- Registrar análisis de laboratorio (ICP)
- Validar resultados
- Generar certificaciones

**Acceso:**
- Análisis de Laboratorio (completo)
- Consulta de catálogo de muestras (solo lectura)
- Consulta de análisis de campo (solo lectura)

### 3. Geólogo/Investigador
**Responsabilidades:**
- Supervisar registros
- Validar datos geológicos
- Analizar resultados
- Generar reportes

**Acceso:**
- Consulta de todos los módulos (solo lectura)
- Exportación de datos
- Generación de reportes
- Dashboard de análisis

### 4. Coordinador de Proyecto
**Responsabilidades:**
- Supervisión general
- Validación de datos críticos
- Gestión de usuarios
- Toma de decisiones estratégicas

**Acceso:**
- Acceso completo a todos los módulos
- Administración de usuarios
- Configuración del sistema
- Reportes ejecutivos

### 5. Administrador del Sistema
**Responsabilidades:**
- Gestión técnica del sistema
- Respaldos de datos
- Mantenimiento
- Soporte técnico

**Acceso:**
- Acceso total al sistema
- Gestión de base de datos
- Configuración avanzada
- Logs y auditoría

## Historias de Usuario

### HU-1: Registro de Barreno (Operador de Campo)
**Como** operador de campo  
**Quiero** registrar un nuevo barreno con sus intervalos de profundidad  
**Para** crear el catálogo base que permitirá registrar muestras de núcleo

**Criterios de Aceptación:**

**CONTEXTO DEL PUNTO DE BARRENACIÓN:**
1. Puedo capturar litología local (lista: Arcilla Lacustre, Riolita, Conglomerado, etc.)
2. Puedo capturar estructura geológica aledaña (lista: Falla La Vía, Cañada el Pozo, etc.)
3. Puedo capturar anomalía gravimétrica (número decimal en mGal)
4. Puedo capturar hasta 3 anomalías geofísicas/geoquímicas que justifican el barreno
5. Puedo seleccionar accesibilidad del sitio (lista: Buena, Regular, Mala, Solo helicóptero)
6. Puedo seleccionar tipo de terreno (lista: Planicie, Lomerío suave, Piedemonte, Cañada/Arroyo, Mesa/Meseta, Sierra, Banco de Material)

**DESCRIPCIÓN DEL BARRENO - IDENTIFICACIÓN:**
7. El sistema genera automáticamente el ID del barreno con formato: `[SiglaProyecto]-[SiglaSubregión]-BRN-[Consecutivo]`
8. Puedo seleccionar empresa perforista (lista)
9. Puedo capturar nombre del responsable de la perforación

**LOCALIZACIÓN Y GEOMETRÍA:**
10. Puedo registrar latitud (rango válido: 14.0 a 33.0 grados decimales)
11. Puedo registrar longitud (rango válido: -118.5 a -86.0 grados decimales)
12. Puedo registrar altitud (> 0 msnm, precisión 2 decimales)
13. Puedo registrar azimut (0° a 360°, donde 0°=Norte, 90°=Este, 180°=Sur, 270°=Oeste)
14. Puedo registrar inclinación (0° a -90°, donde 0°=Horizontal, -90°=Vertical hacia abajo)

**PROGRAMA Y EJECUCIÓN:**
15. Puedo seleccionar tipo de barrenación (lista: Corte Diamante CD)
16. Puedo capturar fecha de inicio (debe ser ≤ fecha del registro)
17. Puedo capturar fecha de finalización (debe ser ≥ fecha de inicio)
18. Puedo capturar longitud total perforada (> 0 metros, precisión 2 decimales)

**DESCRIPCIÓN DEL NÚCLEO:**
19. Puedo capturar longitud total recuperada (> 0 metros, precisión 2 decimales)
20. Puedo capturar diámetro del núcleo (número entero en milímetros)
21. Puedo capturar número de cajas que hospedan el núcleo (> 0)
22. Puedo capturar nombre de la primera caja
23. Puedo seleccionar RQD - calidad del núcleo (lista: 90-100% Excelente, 75-90% Bueno, 50-75% Regular, 25-50% Pobre, 0-25% Muy pobre)
24. El sistema calcula automáticamente TCR (Total Core Recovery) = (longitud recuperada / longitud perforada) * 100%
25. El sistema genera alerta si TCR < límite aceptado según tipo de roca
26. Puedo capturar responsable de la descripción geológica del núcleo (lista)
27. Puedo capturar número total de intervalos del núcleo
28. Puedo capturar intervalos de mayor interés (texto largo)
29. Puedo cargar archivo de descripción del núcleo (.xlsx, .csv) con plantilla UNISON
30. Puedo adjuntar fotografías del núcleo como evidencia

**INTERVALOS DE PROFUNDIDAD:**
31. Puedo agregar múltiples intervalos de profundidad
32. El primer intervalo DEBE iniciar en 0 m
33. Los intervalos DEBEN ser continuos (el fin de uno es el inicio del siguiente)
34. El último intervalo DEBE terminar en la longitud total perforada
35. Cada intervalo tiene ID auto-generado (INT-01, INT-02, etc.)

**NOTAS:**
36. Puedo capturar observaciones libres (texto largo) sobre condiciones de operación, incidencias, causas de baja recuperación, etc.

**VALIDACIONES:**
37. El sistema valida que no existan barrenos duplicados
38. El barreno se guarda en el catálogo local y queda disponible para registro de muestras

### HU-2: Consulta de Catálogo de Barrenos (Operador de Campo)
**Como** operador de campo  
**Quiero** consultar los barrenos registrados  
**Para** verificar qué barrenos están disponibles antes de registrar muestras

**Criterios de Aceptación:**
1. Puedo ver lista de todos los barrenos registrados
2. Cada barreno muestra: ID, ubicación (estado/municipio), número de intervalos
3. Puedo buscar barrenos por ID o ubicación
4. Puedo ver detalles completos de un barreno seleccionado

### HU-3: Registro de Muestra - Flujo Salmueras (Operador de Campo)
**Como** operador de campo  
**Quiero** registrar una muestra de salmuera de pozo petrolero  
**Para** documentar muestras líquidas con su contexto de extracción

**Criterios de Aceptación:**

**CONTEXTO DE LA MUESTRA:**
1. Capturo proyecto (lista: SEFMP.31, otros)
2. Capturo institución (lista: UNISON, SGM, LitioMx, Otra)
3. Capturo responsable de la toma de muestra (lista)
4. Capturo estado (lista: Sonora, Baja California, Tabasco, Veracruz, Tamaulipas, Nuevo León, Coahuila, Chiapas, etc.)
5. Capturo municipio (lista dinámica según estado seleccionado)
6. Capturo localidad (lista o texto libre)

**FUENTE:**
7. Selecciono fuente: "Salmueras"

**DATOS DE SALMUERA:**
8. Capturo nombre del campo petrolero
9. Capturo nombre del pozo
10. Capturo coordenadas GPS del pozo (latitud, longitud, altitud)
11. Capturo profundidad del pozo (metros)
12. Capturo intervalo de producción - inicio (metros)
13. Capturo intervalo de producción - fin (metros)
14. El sistema valida que intervalo_fin >= intervalo_inicio
15. Capturo corte de agua (porcentaje %)
16. Capturo presión (Pa)
17. Capturo temperatura (°C)
18. Capturo pH

**DESCRIPCIÓN TÉCNICA:**
19. Capturo litología (lista)
20. Capturo color (texto)
21. Capturo textura (texto)
22. Puedo adjuntar múltiples fotografías de la muestra

**GENERACIÓN DE ID:**
23. El sistema genera ID único: `SIIL-MUE-[CveEstado][CveMunicipio]-[FechaYYYYMMDD]-[Random4Dígitos]`
24. La muestra se guarda en catálogo con trazabilidad completa
25. El payload incluye metadata con fecha de captura ISO, claves geográficas

### HU-4: Registro de Muestra - Flujo Arcillas Superficie (Operador de Campo)
**Como** operador de campo  
**Quiero** registrar una muestra de arcilla tomada en superficie  
**Para** documentar muestras superficiales sin necesidad de barreno

**Criterios de Aceptación:**

**CONTEXTO DE LA MUESTRA:**
1. Capturo proyecto, institución, responsable, estado, municipio, localidad (igual que HU-3)

**FUENTE:**
2. Selecciono fuente: "Arcillas"
3. Selecciono origen: "Superficie"

**DATOS DE SUPERFICIE:**
4. Capturo notas de campo (texto largo)
5. Capturo procedencia de la muestra (texto)
6. Capturo coordenadas GPS exactas del punto de muestreo (latitud, longitud, altitud)

**DESCRIPCIÓN TÉCNICA:**
7. Capturo litología (lista)
8. Capturo color (texto)
9. Capturo textura (texto)
10. Puedo adjuntar múltiples fotografías de la muestra

**GENERACIÓN DE ID:**
11. El sistema genera ID único de muestra
12. La muestra NO requiere referencia a barreno
13. El payload incluye `referenciaBarreno: null`

### HU-5: Registro de Muestra - Flujo Arcillas Núcleo (Operador de Campo)
**Como** operador de campo  
**Quiero** registrar una muestra de arcilla extraída de un núcleo de perforación  
**Para** documentar muestras de profundidad con trazabilidad al barreno

**Criterios de Aceptación:**

**CONTEXTO DE LA MUESTRA:**
1. Capturo proyecto, institución, responsable, estado, municipio, localidad (igual que HU-3)

**FUENTE:**
2. Selecciono fuente: "Arcillas"
3. Selecciono origen: "Profundidad (Núcleo)"

**VALIDACIÓN CRÍTICA DE DEPENDENCIAS:**
4. **Si no hay barrenos en catálogo**, el sistema muestra advertencia clara
5. El sistema muestra botón "Ir a Registro de Barreno" para crear uno
6. El sistema NO permite continuar sin barreno disponible

**SELECCIÓN DE BARRENO E INTERVALO:**
7. Selecciono barreno del catálogo (dropdown con IDs disponibles)
8. El sistema muestra información del barreno seleccionado (ubicación, profundidad total, intervalos)
9. Selecciono intervalo del barreno seleccionado (dropdown con IDs de intervalos)
10. El sistema auto-completa "Desde (m)" y "Hasta (m)" según el intervalo seleccionado
11. Puedo ajustar "Desde" y "Hasta" dentro del rango del intervalo
12. El sistema valida que Hasta >= Desde
13. Capturo altitud del punto de extracción

**DESCRIPCIÓN TÉCNICA:**
14. Capturo litología (lista)
15. Capturo color (texto)
16. Capturo textura (texto)
17. Puedo adjuntar múltiples fotografías de la muestra

**GENERACIÓN DE ID Y TRAZABILIDAD:**
18. El sistema genera ID único de muestra
19. La muestra queda vinculada al barreno e intervalo en el payload
20. El payload incluye: `referenciaBarreno: { id: "BRN-ID", intervalo: { id: "INT-01", desde: 0, hasta: 2.5 } }`
21. El sistema mantiene integridad referencial (no permite eliminar barreno si tiene muestras asociadas)

### HU-6: Análisis de Campo LIBS & XRF (Operador de Campo)
**Como** operador de campo  
**Quiero** registrar resultados de análisis portátiles (LIBS y XRF)  
**Para** obtener mediciones preliminares en tiempo real

**Criterios de Aceptación:**

**SELECCIÓN DE MUESTRA:**
1. Selecciono muestra del catálogo (búsqueda por ID único)
2. Veo información de contexto de la muestra seleccionada (proyecto, ubicación, tipo, fecha de registro)
3. El sistema valida que la muestra exista en catálogo

**DATOS DEL ANÁLISIS:**
4. Capturo fecha del análisis en campo (debe ser ≥ fecha de registro de muestra)
5. Selecciono tipo de análisis: LIBS o XRF
6. Capturo responsable del análisis (lista)

**RESULTADOS DEL ANÁLISIS:**
7. Capturo concentraciones de elementos detectados (formato tabla o campos individuales)
8. Para cada elemento: nombre, concentración, unidad (ppm, %, etc.)
9. Capturo parámetros del equipo utilizado (voltaje, tiempo de exposición, número de disparos, etc.)
10. Puedo capturar condiciones ambientales (temperatura, humedad) si aplica

**CARGA DE ARCHIVO:**
11. Puedo cargar archivo del análisis (.csv, .xls) directamente del equipo
12. El sistema parsea el archivo y extrae los datos automáticamente
13. Puedo revisar y editar los datos extraídos antes de guardar

**CALCULADORA DE LITIO PROBABLE:**
14. Los resultados activan automáticamente "Calculadora de litio probable"
15. El sistema muestra estimación preliminar de concentración de litio
16. El sistema muestra nivel de confianza de la estimación
17. El sistema sugiere si la muestra requiere análisis de laboratorio

**TRAZABILIDAD:**
18. El sistema vincula el análisis al ID de muestra
19. Puedo registrar múltiples análisis para la misma muestra (diferentes puntos, repeticiones)
20. Cada análisis tiene timestamp y responsable registrado
21. El análisis se guarda en catálogo vinculado a la muestra

### HU-7: Análisis de Laboratorio ICP (Técnico de Laboratorio)
**Como** técnico de laboratorio  
**Quiero** registrar resultados certificados de análisis ICP  
**Para** cerrar el ciclo de análisis con datos precisos de laboratorio

**Criterios de Aceptación:**

**SELECCIÓN DE MUESTRA:**
1. Selecciono muestra del catálogo (búsqueda por ID único)
2. Veo información completa de la muestra (contexto, ubicación, tipo)
3. Veo análisis de campo previos si existen
4. El sistema valida que la muestra exista en catálogo

**DATOS DEL LABORATORIO:**
5. Selecciono institución del laboratorio (lista: UNISON, SGM, LitioMx, Otra)
6. Selecciono nombre del laboratorio específico (lista)
7. Capturo fecha del análisis en laboratorio
8. Capturo fecha de recepción de la muestra en laboratorio
9. Capturo método de análisis utilizado (ICP-MS, ICP-OES, etc.)

**RESULTADOS ANALÍTICOS ICP:**
10. Capturo concentraciones certificadas de todos los elementos analizados
11. Para cada elemento: nombre, concentración, unidad, límite de detección
12. Capturo precisión/incertidumbre de cada medición
13. Capturo número de certificado de laboratorio
14. Capturo número de lote o batch del análisis
15. Capturo estándares de referencia utilizados

**CARGA DE ARCHIVO:**
16. Puedo cargar archivo del análisis (.pdf, .csv, .xlsx) del laboratorio
17. El sistema parsea archivos estructurados y extrae datos automáticamente
18. Puedo adjuntar PDF del certificado oficial como evidencia
19. El sistema almacena el archivo original para trazabilidad

**VALIDACIÓN Y CIERRE:**
20. El sistema compara resultados ICP vs análisis de campo (si existe)
21. El sistema marca discrepancias significativas para revisión
22. El sistema marca la muestra como "análisis completo"
23. Los datos alimentan la calibración de algoritmos predictivos
24. El sistema genera reporte de calidad del análisis

**TRAZABILIDAD:**
25. El análisis se vincula al ID de muestra
26. Se registra timestamp, laboratorio, técnico responsable
27. El sistema mantiene historial de versiones si se actualiza el análisis

### HU-8: Dashboard de Seguimiento (Geólogo/Investigador)
**Como** geólogo investigador  
**Quiero** visualizar el estado de todas las muestras en el sistema  
**Para** monitorear el progreso del proyecto y detectar pendientes

**Criterios de Aceptación:**
1. Veo resumen de barrenos registrados por región
2. Veo resumen de muestras por tipo (salmueras, arcillas superficie, arcillas núcleo)
3. Veo estado de análisis (pendiente campo, pendiente laboratorio, completo)
4. Puedo filtrar por proyecto, región, fecha, responsable
5. Veo mapa con ubicación de barrenos y muestras
6. Puedo exportar datos en formato CSV/Excel
7. Veo gráficas de concentración de litio por región
8. Puedo generar reportes PDF

### HU-9: Gestión de Usuarios (Coordinador de Proyecto)
**Como** coordinador de proyecto  
**Quiero** gestionar usuarios y sus permisos  
**Para** controlar el acceso al sistema según roles

**Criterios de Aceptación:**
1. Puedo crear nuevos usuarios
2. Puedo asignar roles: Operador Campo, Técnico Lab, Geólogo, Coordinador, Admin
3. Puedo activar/desactivar usuarios
4. Puedo ver log de actividad por usuario
5. Puedo resetear contraseñas
6. El sistema valida que cada usuario tenga correo único
7. Puedo asignar usuarios a proyectos específicos

### HU-10: Validación de Dependencias de Flujo (Sistema)
**Como** sistema  
**Quiero** validar las dependencias entre formularios  
**Para** garantizar la integridad de los datos y trazabilidad

**Criterios de Aceptación:**
1. No permito registrar muestra de núcleo si no existe el barreno
2. No permito registrar análisis de campo si no existe la muestra
3. No permito registrar análisis de laboratorio si no existe la muestra
4. Muestro mensajes claros cuando falta una dependencia
5. Ofrezco navegación directa al formulario requerido
6. Valido que los IDs referenciados existan en catálogos
7. Mantengo integridad referencial en localStorage/base de datos

## Requisitos No Funcionales

### RNF-1: Usabilidad
- Interfaz responsive para uso en campo (tablets, móviles)
- Formularios con wizard paso a paso
- Validación en tiempo real
- Mensajes de error claros y accionables
- Indicadores visuales de progreso

### RNF-2: Rendimiento
- Carga de catálogos en < 2 segundos
- Búsqueda de muestras en < 1 segundo
- Guardado de registros en < 3 segundos
- Soporte para 10,000+ muestras sin degradación

### RNF-3: Disponibilidad
- Modo offline para captura en campo
- Sincronización automática al recuperar conexión
- Respaldo automático diario
- Recuperación ante fallos

### RNF-4: Seguridad
- Autenticación de usuarios
- Control de acceso basado en roles (RBAC)
- Encriptación de datos sensibles
- Auditoría de todas las operaciones
- Sesiones con timeout automático

### RNF-5: Integridad de Datos
- Validación de formatos (coordenadas, fechas, números)
- Validación de rangos (latitud 14-33°N, longitud -118.5 a -86°W)
- Prevención de duplicados
- Trazabilidad completa (quién, cuándo, qué)
- Versionado de registros

### RNF-6: Interoperabilidad
- Integración con API INEGI para catálogos geográficos
- Exportación en formatos estándar (CSV, JSON, GeoJSON)
- API REST para integración con otros sistemas
- Soporte para importación de datos históricos

### RNF-7: Mantenibilidad
- Código modular y documentado
- Separación de responsabilidades (MVC/MVVM)
- Configuración centralizada
- Logs estructurados
- Tests automatizados

## Restricciones Técnicas

1. **Frontend:** HTML5, CSS3 (Tailwind), JavaScript vanilla (sin frameworks pesados para mejor rendimiento en campo)
2. **Almacenamiento:** localStorage para modo offline, backend para persistencia
3. **Geolocalización:** API de Geolocalización del navegador + integración INEGI
4. **Compatibilidad:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
5. **Diseño:** Sistema de diseño gubernamental mexicano (colores, tipografía Noto Sans)

## Dependencias Externas

1. **API INEGI:** Catálogos de estados y municipios
2. **Servicio de Mapas:** Para visualización geoespacial
3. **Almacenamiento de Archivos:** Para fotografías y certificados PDF
4. **Servicio de Email:** Para notificaciones y recuperación de contraseñas

## Glosario

- **Barreno:** Perforación realizada en el terreno para extracción de núcleos
- **Núcleo:** Muestra cilíndrica extraída de un barreno
- **Intervalo:** Segmento de profundidad dentro de un barreno
- **LIBS:** Espectroscopía de Ruptura Inducida por Láser (análisis portátil)
- **XRF:** Fluorescencia de Rayos X (análisis portátil)
- **ICP:** Plasma Acoplado Inductivamente (análisis de laboratorio)
- **Salmuera:** Agua con alta concentración de sales minerales
- **Litología:** Tipo de roca o sedimento
- **Trazabilidad:** Capacidad de seguir el historial de una muestra

## Priorización

### Fase 1 (MVP - Crítico)
- HU-1: Registro de Barreno
- HU-2: Consulta de Catálogo de Barrenos
- HU-5: Registro de Muestra - Arcillas Núcleo
- HU-10: Validación de Dependencias

### Fase 2 (Importante)
- HU-3: Registro de Muestra - Salmueras
- HU-4: Registro de Muestra - Arcillas Superficie
- HU-6: Análisis de Campo
- HU-9: Gestión de Usuarios

### Fase 3 (Deseable)
- HU-7: Análisis de Laboratorio
- HU-8: Dashboard de Seguimiento

## Métricas de Éxito

1. **Adopción:** 80% de operadores de campo usando el sistema en 3 meses
2. **Calidad de Datos:** < 5% de registros con errores de validación
3. **Trazabilidad:** 100% de muestras con ID único y referencias completas
4. **Tiempo de Registro:** < 10 minutos por muestra completa
5. **Disponibilidad:** 99% uptime del sistema
6. **Satisfacción:** NPS > 70 entre usuarios
