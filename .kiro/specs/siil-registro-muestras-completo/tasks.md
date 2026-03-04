# Tasks - Sistema Integral de Información del Litio (SIIL)

## Estado General
- [ ] Fase 1: Infraestructura Core y Registro de Barreno (MVP)
- [ ] Fase 2: Registro de Muestras Completo
- [ ] Fase 3: Análisis de Campo y Laboratorio
- [ ] Fase 4: Dashboard y Reportes
- [ ] Fase 5: Optimizaciones y Producción

---

## FASE 1: Infraestructura Core y Registro de Barreno (MVP)

### 1. Setup y Configuración Inicial
- [ ] 1.1 Crear estructura de carpetas según design.md
- [ ] 1.2 Configurar ESLint y Prettier
- [ ] 1.3 Configurar Jest para testing
- [ ] 1.4 Crear archivo de constantes globales
- [ ] 1.5 Documentar convenciones de código

### 2. Módulos Core
- [ ] 2.1 Implementar state-manager.js
  - [ ] 2.1.1 Crear clase StateManager con patrón Observer
  - [ ] 2.1.2 Implementar métodos get/set/subscribe/unsubscribe
  - [ ] 2.1.3 Agregar soporte para estado persistente en localStorage
  - [ ] 2.1.4 Implementar notificaciones de cambios a suscriptores
  - [ ] 2.1.5 Escribir tests unitarios (cobertura >80%)

- [ ] 2.2 Implementar storage.js
  - [ ] 2.2.1 Crear abstracción para localStorage con manejo de errores
  - [ ] 2.2.2 Crear abstracción para IndexedDB (archivos/blobs)
  - [ ] 2.2.3 Implementar métodos CRUD genéricos (create, read, update, delete)
  - [ ] 2.2.4 Agregar manejo de cuotas excedidas (QuotaExceededError)
  - [ ] 2.2.5 Implementar fallback si storage no disponible
  - [ ] 2.2.6 Escribir tests unitarios

- [ ] 2.3 Implementar validator.js
  - [ ] 2.3.1 Crear validador de coordenadas (lat: 14-33, lon: -118.5 a -86, alt: >0)
  - [ ] 2.3.2 Crear validador de fechas (coherencia, rangos)
  - [ ] 2.3.3 Crear validador de rangos numéricos genérico
  - [ ] 2.3.4 Crear validador de ID único en catálogo
  - [ ] 2.3.5 Crear validador de intervalos continuos
  - [ ] 2.3.6 Crear validador de azimut (0-360°) e inclinación (0 a -90°)
  - [ ] 2.3.7 Crear validador de TCR según tipo de roca
  - [ ] 2.3.8 Escribir tests unitarios para cada validador

- [ ] 2.4 Implementar utils.js
  - [ ] 2.4.1 Función generateUUID() para IDs únicos
  - [ ] 2.4.2 Función formatDate() con soporte ISO 8601
  - [ ] 2.4.3 Función normalizeToken() para generación de siglas
  - [ ] 2.4.4 Función buildProjectSigla() y buildGeoSigla()
  - [ ] 2.4.5 Función debounce() para búsquedas
  - [ ] 2.4.6 Función isSameDepth() con tolerancia
  - [ ] 2.4.7 Escribir tests unitarios

### 3. Servicios Base
- [ ] 3.1 Implementar inegi-service.js
  - [ ] 3.1.1 Crear clase InegiService con cache
  - [ ] 3.1.2 Implementar getEstados() con integración API INEGI
  - [ ] 3.1.3 Implementar getMunicipios(estadoCve) con cache
  - [ ] 3.1.4 Implementar fallback a catálogo estático si API falla
  - [ ] 3.1.5 Agregar manejo de errores de red
  - [ ] 3.1.6 Escribir tests con mocks de API

- [ ] 3.2 Implementar barreno-service.js
  - [ ] 3.2.1 Crear clase BarrenoService
  - [ ] 3.2.2 Implementar crear(barreno) con validaciones
  - [ ] 3.2.3 Implementar leer(id) y listarTodos()
  - [ ] 3.2.4 Implementar actualizar(id, datos)
  - [ ] 3.2.5 Implementar eliminar(id) con validación de referencias
  - [ ] 3.2.6 Implementar buscar(filtros)
  - [ ] 3.2.7 Implementar generarId(proyecto, estado, municipio)
  - [ ] 3.2.8 Escribir tests unitarios

- [ ] 3.3 Implementar auth-service.js (básico)
  - [ ] 3.3.1 Crear clase AuthService
  - [ ] 3.3.2 Implementar login(correo, password)
  - [ ] 3.3.3 Implementar logout()
  - [ ] 3.3.4 Implementar getUsuarioActual()
  - [ ] 3.3.5 Implementar verificarPermiso(recurso, operacion)
  - [ ] 3.3.6 Guardar sesión en localStorage
  - [ ] 3.3.7 Escribir tests unitarios

### 4. Componentes Reutilizables
- [ ] 4.1 Implementar wizard.js
  - [ ] 4.1.1 Crear clase Wizard con configuración de pasos
  - [ ] 4.1.2 Implementar renderIndicators() para mostrar progreso
  - [ ] 4.1.3 Implementar renderStep() con campos dinámicos
  - [ ] 4.1.4 Implementar navegación next()/prev()
  - [ ] 4.1.5 Implementar validateStep() con mensajes de error
  - [ ] 4.1.6 Implementar submit() con callback onComplete
  - [ ] 4.1.7 Agregar soporte para pasos condicionales (showIf)
  - [ ] 4.1.8 Escribir tests unitarios

- [ ] 4.2 Implementar form-builder.js
  - [ ] 4.2.1 Crear clase FormBuilder
  - [ ] 4.2.2 Implementar renderField() para diferentes tipos
  - [ ] 4.2.3 Soporte para text, number, email, date
  - [ ] 4.2.4 Soporte para select, radio, checkbox
  - [ ] 4.2.5 Soporte para textarea
  - [ ] 4.2.6 Soporte para file (single y multiple)
  - [ ] 4.2.7 Implementar validación en tiempo real
  - [ ] 4.2.8 Escribir tests unitarios

- [ ] 4.3 Implementar file-uploader.js
  - [ ] 4.3.1 Crear clase FileUploader
  - [ ] 4.3.2 Implementar drag & drop
  - [ ] 4.3.3 Implementar preview de imágenes
  - [ ] 4.3.4 Validar tipos de archivo permitidos
  - [ ] 4.3.5 Validar tamaño máximo
  - [ ] 4.3.6 Guardar en IndexedDB
  - [ ] 4.3.7 Mostrar progreso de carga
  - [ ] 4.3.8 Escribir tests unitarios

### 5. Calculadoras
- [ ] 5.1 Implementar tcr-calculator.js
  - [ ] 5.1.1 Crear función calcularTCR(longitudRecuperada, longitudPerforada)
  - [ ] 5.1.2 Crear función validarTCR(tcr, tipoRoca)
  - [ ] 5.1.3 Definir límites por tipo de roca (ígneas: 90%, arcillas: 85%, volcánicas: 75%)
  - [ ] 5.1.4 Generar alertas si TCR < límite
  - [ ] 5.1.5 Escribir tests con diferentes escenarios

- [ ] 5.2 Escribir tests para TCR calculator
  - [ ] 5.2.1 Test: cálculo correcto de TCR
  - [ ] 5.2.2 Test: validación para rocas ígneas
  - [ ] 5.2.3 Test: validación para depósitos de arcilla
  - [ ] 5.2.4 Test: validación para rocas volcánicas
  - [ ] 5.2.5 Test: alerta cuando TCR < límite

### 6. Registro de Barreno - Página Completa
- [ ] 6.1 Refactorizar HTML existente
  - [ ] 6.1.1 Revisar registro-muestras.html actual
  - [ ] 6.1.2 Separar sección de barreno en componente independiente
  - [ ] 6.1.3 Actualizar estructura HTML según design.md
  - [ ] 6.1.4 Agregar todos los campos faltantes del cuestionario

- [ ] 6.2 Implementar todos los pasos del wizard
  - [ ] 6.2.1 Paso 1: Contexto Geológico (litología, estructuras, anomalías, accesibilidad, terreno)
  - [ ] 6.2.2 Paso 2: Identificación y Ubicación (proyecto, perforista, responsable, estado, municipio)
  - [ ] 6.2.3 Paso 3: Localización y Geometría (coordenadas GPS, azimut, inclinación)
  - [ ] 6.2.4 Paso 4: Programa y Ejecución (fechas, longitud perforada)
  - [ ] 6.2.5 Paso 5: Descripción del Núcleo (longitud recuperada, diámetro, cajas, RQD, TCR, responsable)
  - [ ] 6.2.6 Paso 6: Intervalos (agregar/editar/eliminar intervalos dinámicamente)
  - [ ] 6.2.7 Paso 7: Notas y Revisión (observaciones, preview completo)

- [ ] 6.3 Integrar validaciones completas
  - [ ] 6.3.1 Validar coordenadas en rangos válidos
  - [ ] 6.3.2 Validar fechas coherentes (inicio <= fin <= registro)
  - [ ] 6.3.3 Validar intervalos continuos (primer intervalo en 0, último en longitud total)
  - [ ] 6.3.4 Validar TCR y mostrar alertas
  - [ ] 6.3.5 Validar ID único en catálogo
  - [ ] 6.3.6 Mostrar mensajes de error claros y accionables

- [ ] 6.4 Implementar carga de archivos
  - [ ] 6.4.1 Carga de archivo de descripción del núcleo (.xlsx, .csv)
  - [ ] 6.4.2 Carga de fotografías del núcleo (múltiples)
  - [ ] 6.4.3 Preview de imágenes antes de guardar
  - [ ] 6.4.4 Guardar archivos en IndexedDB
  - [ ] 6.4.5 Validar formatos y tamaños

- [ ] 6.5 Testing de integración
  - [ ] 6.5.1 Test: flujo completo de registro exitoso
  - [ ] 6.5.2 Test: validación de campos requeridos
  - [ ] 6.5.3 Test: validación de intervalos
  - [ ] 6.5.4 Test: cálculo automático de TCR
  - [ ] 6.5.5 Test: generación de ID único
  - [ ] 6.5.6 Test: guardado en catálogo

---

## FASE 2: Registro de Muestras Completo

### 7. Servicio de Muestras
- [ ] 7.1 Implementar muestra-service.js
  - [ ] 7.1.1 Crear clase MuestraService
  - [ ] 7.1.2 Implementar crear(muestra) con validaciones
  - [ ] 7.1.3 Implementar leer(id) y listarTodas()
  - [ ] 7.1.4 Implementar actualizar(id, datos)
  - [ ] 7.1.5 Implementar eliminar(id)
  - [ ] 7.1.6 Implementar buscar(filtros)
  - [ ] 7.1.7 Implementar generarId(estado, municipio, fecha)

- [ ] 7.2 Implementar validaciones específicas
  - [ ] 7.2.1 Validar dependencia de barreno para muestras de núcleo
  - [ ] 7.2.2 Validar que barreno existe en catálogo
  - [ ] 7.2.3 Validar que intervalo existe en barreno
  - [ ] 7.2.4 Validar rango desde/hasta dentro del intervalo
  - [ ] 7.2.5 Validar intervalo de salmuera (fin >= inicio)

- [ ] 7.3 Escribir tests unitarios
  - [ ] 7.3.1 Test: crear muestra salmuera
  - [ ] 7.3.2 Test: crear muestra arcilla superficie
  - [ ] 7.3.3 Test: crear muestra arcilla núcleo con barreno válido
  - [ ] 7.3.4 Test: bloquear muestra núcleo sin barreno
  - [ ] 7.3.5 Test: validar referencia a barreno e intervalo

### 8. Registro de Muestra - Salmueras
- [ ] 8.1 Implementar flujo completo
  - [ ] 8.1.1 Paso 1: Contexto (proyecto, institución, responsable, ubicación)
  - [ ] 8.1.2 Paso 2: Fuente (selección "Salmueras")
  - [ ] 8.1.3 Paso 3: Datos de Salmuera (campo, pozo, coordenadas, profundidad, intervalo, parámetros físico-químicos)
  - [ ] 8.1.4 Paso 4: Descripción Técnica (litología, color, textura, fotografías)
  - [ ] 8.1.5 Generación de ID único
  - [ ] 8.1.6 Guardado en catálogo

- [ ] 8.2 Validaciones específicas
  - [ ] 8.2.1 Validar intervalo de producción (fin >= inicio)
  - [ ] 8.2.2 Validar rangos de parámetros (pH, presión, temperatura)
  - [ ] 8.2.3 Validar coordenadas GPS

- [ ] 8.3 Testing
  - [ ] 8.3.1 Test: flujo completo exitoso
  - [ ] 8.3.2 Test: validación de intervalo
  - [ ] 8.3.3 Test: generación de ID

### 9. Registro de Muestra - Arcillas Superficie
- [ ] 9.1 Implementar flujo completo
  - [ ] 9.1.1 Paso 1: Contexto
  - [ ] 9.1.2 Paso 2: Fuente (selección "Arcillas")
  - [ ] 9.1.3 Paso 3: Origen (selección "Superficie")
  - [ ] 9.1.4 Paso 4: Datos de Superficie (notas, procedencia, coordenadas)
  - [ ] 9.1.5 Paso 5: Descripción Técnica
  - [ ] 9.1.6 Generación de ID
  - [ ] 9.1.7 Guardado con referenciaBarreno: null

- [ ] 9.2 Testing
  - [ ] 9.2.1 Test: flujo completo exitoso
  - [ ] 9.2.2 Test: payload sin referencia a barreno

### 10. Registro de Muestra - Arcillas Núcleo
- [ ] 10.1 Implementar validación de dependencias
  - [ ] 10.1.1 Consultar catálogo de barrenos al iniciar flujo
  - [ ] 10.1.2 Si no hay barrenos: mostrar advertencia clara
  - [ ] 10.1.3 Mostrar botón "Ir a Registro de Barreno"
  - [ ] 10.1.4 Bloquear continuación del wizard
  - [ ] 10.1.5 Si hay barrenos: permitir continuar

- [ ] 10.2 Implementar selección de barreno
  - [ ] 10.2.1 Dropdown con lista de IDs de barrenos
  - [ ] 10.2.2 Mostrar información del barreno seleccionado (ubicación, profundidad, intervalos)
  - [ ] 10.2.3 Actualizar lista de intervalos al seleccionar barreno

- [ ] 10.3 Implementar selección de intervalo
  - [ ] 10.3.1 Dropdown con IDs de intervalos del barreno
  - [ ] 10.3.2 Auto-completar "Desde" y "Hasta" al seleccionar intervalo
  - [ ] 10.3.3 Permitir ajuste manual dentro del rango
  - [ ] 10.3.4 Validar que Hasta >= Desde
  - [ ] 10.3.5 Validar que están dentro del rango del intervalo

- [ ] 10.4 Testing de integración
  - [ ] 10.4.1 Test: bloqueo sin barrenos en catálogo
  - [ ] 10.4.2 Test: flujo completo con barreno válido
  - [ ] 10.4.3 Test: selección de intervalo y auto-completado
  - [ ] 10.4.4 Test: validación de rangos
  - [ ] 10.4.5 Test: payload con referenciaBarreno completa

---

## FASE 3: Análisis de Campo y Laboratorio

### 11. Calculadora de Litio Probable
- [ ] 11.1 Implementar algoritmo completo
  - [ ] 11.1.1 Crear clase CalculadoraLitio
  - [ ] 11.1.2 Definir coeficientes de correlación por elemento (Na, K, Mg, Ca, Rb, Cs, B)
  - [ ] 11.1.3 Definir pesos de confianza por elemento
  - [ ] 11.1.4 Implementar calcular(resultados) con estimación ponderada
  - [ ] 11.1.5 Implementar calcularConfianza(elementosUsados)
  - [ ] 11.1.6 Implementar requiereLaboratorio(concentracion, confianza)
  - [ ] 11.1.7 Implementar generarNotas(concentracion, confianza, elementos)

- [ ] 11.2 Calibrar coeficientes
  - [ ] 11.2.1 Recopilar datos históricos de análisis campo vs laboratorio
  - [ ] 11.2.2 Calcular correlaciones reales
  - [ ] 11.2.3 Ajustar coeficientes según datos
  - [ ] 11.2.4 Validar precisión del modelo

- [ ] 11.3 Testing exhaustivo
  - [ ] 11.3.1 Test: cálculo con todos los elementos
  - [ ] 11.3.2 Test: cálculo con elementos parciales
  - [ ] 11.3.3 Test: nivel de confianza alto (Rb, Cs presentes)
  - [ ] 11.3.4 Test: nivel de confianza bajo (pocos elementos)
  - [ ] 11.3.5 Test: recomendación de laboratorio (concentración >500 ppm)
  - [ ] 11.3.6 Test: notas generadas correctamente

### 12. Análisis de Campo
- [ ] 12.1 Implementar analisis-campo-service.js
  - [ ] 12.1.1 Crear clase AnalisisCampoService
  - [ ] 12.1.2 Implementar crear(analisis) con validaciones
  - [ ] 12.1.3 Implementar leer(id) y listarPorMuestra(muestraId)
  - [ ] 12.1.4 Implementar actualizar(id, datos)
  - [ ] 12.1.5 Implementar eliminar(id)
  - [ ] 12.1.6 Implementar parsearArchivoEquipo(archivo)

- [ ] 12.2 Implementar página de análisis
  - [ ] 12.2.1 Búsqueda de muestra por ID
  - [ ] 12.2.2 Mostrar información de contexto de muestra
  - [ ] 12.2.3 Formulario de captura (fecha, responsable, tipo LIBS/XRF)
  - [ ] 12.2.4 Captura de resultados (manual o carga de archivo)
  - [ ] 12.2.5 Captura de parámetros del equipo
  - [ ] 12.2.6 Validaciones (muestra existe, fecha >= fecha muestra)

- [ ] 12.3 Integrar calculadora de litio
  - [ ] 12.3.1 Ejecutar calculadora al capturar resultados
  - [ ] 12.3.2 Mostrar concentración estimada en tiempo real
  - [ ] 12.3.3 Mostrar nivel de confianza
  - [ ] 12.3.4 Mostrar recomendación de laboratorio
  - [ ] 12.3.5 Mostrar notas explicativas

- [ ] 12.4 Testing
  - [ ] 12.4.1 Test: flujo completo de análisis LIBS
  - [ ] 12.4.2 Test: flujo completo de análisis XRF
  - [ ] 12.4.3 Test: parseo de archivo del equipo
  - [ ] 12.4.4 Test: integración con calculadora de litio
  - [ ] 12.4.5 Test: múltiples análisis para misma muestra

### 13. Análisis de Laboratorio
- [ ] 13.1 Implementar analisis-lab-service.js
  - [ ] 13.1.1 Crear clase AnalisisLaboratorioService
  - [ ] 13.1.2 Implementar crear(analisis) con validaciones
  - [ ] 13.1.3 Implementar leer(id) y listarPorMuestra(muestraId)
  - [ ] 13.1.4 Implementar actualizar(id, datos)
  - [ ] 13.1.5 Implementar eliminar(id)
  - [ ] 13.1.6 Implementar parsearArchivoLaboratorio(archivo)

- [ ] 13.2 Implementar página de análisis
  - [ ] 13.2.1 Búsqueda de muestra por ID
  - [ ] 13.2.2 Mostrar información completa de muestra
  - [ ] 13.2.3 Mostrar análisis de campo previos (si existen)
  - [ ] 13.2.4 Formulario de captura (institución, laboratorio, fechas, método)
  - [ ] 13.2.5 Captura de resultados analíticos (elementos, concentraciones, límites detección)
  - [ ] 13.2.6 Captura de certificación (número certificado, lote, estándares)
  - [ ] 13.2.7 Carga de archivos (PDF certificado, datos CSV/Excel)

- [ ] 13.3 Implementar comparación campo vs lab
  - [ ] 13.3.1 Buscar análisis de campo para la muestra
  - [ ] 13.3.2 Comparar concentraciones elemento por elemento
  - [ ] 13.3.3 Calcular diferencia porcentual
  - [ ] 13.3.4 Marcar discrepancias significativas (>20%)
  - [ ] 13.3.5 Generar reporte de calidad
  - [ ] 13.3.6 Actualizar estado de muestra (análisis completo)

- [ ] 13.4 Testing
  - [ ] 13.4.1 Test: flujo completo de análisis ICP
  - [ ] 13.4.2 Test: parseo de archivo de laboratorio
  - [ ] 13.4.3 Test: comparación con análisis de campo
  - [ ] 13.4.4 Test: detección de discrepancias
  - [ ] 13.4.5 Test: actualización de estado de muestra

---

## FASE 4: Dashboard y Reportes

### 14. Dashboard
- [ ] 14.1 Implementar vista general
  - [ ] 14.1.1 Crear página dashboard.html
  - [ ] 14.1.2 Tarjetas de resumen (total barrenos, muestras, análisis)
  - [ ] 14.1.3 Resumen por tipo de muestra (salmueras, arcillas superficie, arcillas núcleo)
  - [ ] 14.1.4 Resumen por estado de análisis (pendiente campo, pendiente lab, completo)
  - [ ] 14.1.5 Indicadores de calidad (TCR promedio, muestras con discrepancias)

- [ ] 14.2 Implementar filtros
  - [ ] 14.2.1 Filtro por proyecto
  - [ ] 14.2.2 Filtro por región (estado/municipio)
  - [ ] 14.2.3 Filtro por rango de fechas
  - [ ] 14.2.4 Filtro por responsable
  - [ ] 14.2.5 Filtro por estado de análisis
  - [ ] 14.2.6 Aplicar filtros en tiempo real

- [ ] 14.3 Implementar gráficas
  - [ ] 14.3.1 Gráfica de barras: muestras por región
  - [ ] 14.3.2 Gráfica de línea: muestras por fecha
  - [ ] 14.3.3 Gráfica de pastel: distribución por tipo
  - [ ] 14.3.4 Histograma: concentración de litio
  - [ ] 14.3.5 Usar librería Chart.js o similar

- [ ] 14.4 Implementar mapa
  - [ ] 14.4.1 Integrar librería de mapas (Leaflet o Google Maps)
  - [ ] 14.4.2 Mostrar ubicación de barrenos
  - [ ] 14.4.3 Mostrar ubicación de muestras
  - [ ] 14.4.4 Marcadores con colores según concentración de litio
  - [ ] 14.4.5 Popup con información al hacer clic
  - [ ] 14.4.6 Clustering para muchos puntos

### 15. Exportación de Datos
- [ ] 15.1 Exportar a CSV
  - [ ] 15.1.1 Implementar exportarBarrenosCSV()
  - [ ] 15.1.2 Implementar exportarMuestrasCSV()
  - [ ] 15.1.3 Implementar exportarAnalisisCSV()
  - [ ] 15.1.4 Incluir filtros aplicados en dashboard
  - [ ] 15.1.5 Descargar archivo automáticamente

- [ ] 15.2 Exportar a Excel
  - [ ] 15.2.1 Usar librería SheetJS o similar
  - [ ] 15.2.2 Crear hojas separadas por tipo de dato
  - [ ] 15.2.3 Aplicar formato (encabezados, anchos de columna)
  - [ ] 15.2.4 Incluir metadatos (fecha exportación, filtros)

- [ ] 15.3 Exportar a PDF
  - [ ] 15.3.1 Usar librería jsPDF o similar
  - [ ] 15.3.2 Generar reporte con logo y encabezado
  - [ ] 15.3.3 Incluir tablas de datos
  - [ ] 15.3.4 Incluir gráficas
  - [ ] 15.3.5 Paginación automática

---

## FASE 5: Optimizaciones y Producción

### 16. Sistema de Autenticación Completo
- [ ] 16.1 Implementar login/logout
  - [ ] 16.1.1 Crear página login.html (ya existe, refactorizar)
  - [ ] 16.1.2 Formulario de login con validación
  - [ ] 16.1.3 Integración con backend (JWT tokens)
  - [ ] 16.1.4 Guardar token en localStorage
  - [ ] 16.1.5 Implementar logout con limpieza de sesión
  - [ ] 16.1.6 Redirect automático si no autenticado

- [ ] 16.2 Implementar RBAC completo
  - [ ] 16.2.1 Crear clase AuthorizationService
  - [ ] 16.2.2 Definir matriz de permisos por rol
  - [ ] 16.2.3 Implementar puedeAcceder(usuario, recurso, operacion)
  - [ ] 16.2.4 Implementar esRecursoPropio(usuario, recursoId)
  - [ ] 16.2.5 Aplicar permisos en todas las páginas
  - [ ] 16.2.6 Ocultar/deshabilitar acciones no permitidas
  - [ ] 16.2.7 Validar permisos en backend también

- [ ] 16.3 Implementar gestión de usuarios
  - [ ] 16.3.1 Crear página admin-usuarios.html
  - [ ] 16.3.2 Listar usuarios con filtros
  - [ ] 16.3.3 Crear nuevo usuario
  - [ ] 16.3.4 Editar usuario (rol, permisos, proyectos)
  - [ ] 16.3.5 Activar/desactivar usuario
  - [ ] 16.3.6 Resetear contraseña
  - [ ] 16.3.7 Ver log de actividad por usuario

### 17. Sincronización Offline
- [ ] 17.1 Implementar sync-service.js
  - [ ] 17.1.1 Crear clase SyncService
  - [ ] 17.1.2 Implementar enqueue(operacion)
  - [ ] 17.1.3 Implementar intentarSync()
  - [ ] 17.1.4 Implementar sincronizarOperacion(operacion)
  - [ ] 17.1.5 Manejo de errores y reintentos
  - [ ] 17.1.6 Detectar conexión online/offline

- [ ] 17.2 Implementar cola de sincronización
  - [ ] 17.2.1 Guardar cola en localStorage
  - [ ] 17.2.2 Procesar cola en orden FIFO
  - [ ] 17.2.3 Mover operaciones fallidas a cola de errores
  - [ ] 17.2.4 Permitir reintento manual de errores
  - [ ] 17.2.5 Mostrar indicador de sincronización en UI

- [ ] 17.3 Testing
  - [ ] 17.3.1 Test: encolar operación
  - [ ] 17.3.2 Test: sincronización exitosa
  - [ ] 17.3.3 Test: manejo de errores de red
  - [ ] 17.3.4 Test: reintentos automáticos
  - [ ] 17.3.5 Test: sincronización al recuperar conexión

### 18. Optimizaciones
- [ ] 18.1 Lazy loading
  - [ ] 18.1.1 Cargar módulos bajo demanda
  - [ ] 18.1.2 Cargar imágenes con lazy loading
  - [ ] 18.1.3 Diferir carga de scripts no críticos

- [ ] 18.2 Virtual scrolling
  - [ ] 18.2.1 Implementar para listas de barrenos
  - [ ] 18.2.2 Implementar para listas de muestras
  - [ ] 18.2.3 Renderizar solo items visibles

- [ ] 18.3 Web workers
  - [ ] 18.3.1 Mover calculadora de litio a worker
  - [ ] 18.3.2 Mover parseo de archivos grandes a worker
  - [ ] 18.3.3 Mover búsquedas complejas a worker

- [ ] 18.4 Service worker
  - [ ] 18.4.1 Crear service-worker.js
  - [ ] 18.4.2 Cachear assets estáticos
  - [ ] 18.4.3 Estrategia cache-first para datos
  - [ ] 18.4.4 Actualización de cache en background
  - [ ] 18.4.5 Registrar service worker en app

### 19. Documentación
- [ ] 19.1 Manual de usuario
  - [ ] 19.1.1 Introducción al sistema
  - [ ] 19.1.2 Guía de registro de barrenos
  - [ ] 19.1.3 Guía de registro de muestras
  - [ ] 19.1.4 Guía de análisis de campo
  - [ ] 19.1.5 Guía de análisis de laboratorio
  - [ ] 19.1.6 Guía de dashboard y reportes
  - [ ] 19.1.7 Capturas de pantalla y videos

- [ ] 19.2 Documentación técnica
  - [ ] 19.2.1 Arquitectura del sistema
  - [ ] 19.2.2 Modelos de datos
  - [ ] 19.2.3 API endpoints
  - [ ] 19.2.4 Guía de desarrollo
  - [ ] 19.2.5 Guía de deployment

- [ ] 19.3 Guías de troubleshooting
  - [ ] 19.3.1 Problemas comunes y soluciones
  - [ ] 19.3.2 Errores de validación
  - [ ] 19.3.3 Problemas de sincronización
  - [ ] 19.3.4 Contacto de soporte

### 20. Deployment
- [ ] 20.1 Configurar CI/CD
  - [ ] 20.1.1 Configurar pipeline en GitHub Actions o similar
  - [ ] 20.1.2 Ejecutar tests automáticamente
  - [ ] 20.1.3 Build automático
  - [ ] 20.1.4 Deploy automático a staging

- [ ] 20.2 Deploy a staging
  - [ ] 20.2.1 Configurar servidor staging
  - [ ] 20.2.2 Deploy de aplicación
  - [ ] 20.2.3 Configurar base de datos staging
  - [ ] 20.2.4 Configurar variables de entorno

- [ ] 20.3 Testing en staging
  - [ ] 20.3.1 Pruebas funcionales completas
  - [ ] 20.3.2 Pruebas de carga
  - [ ] 20.3.3 Pruebas de seguridad
  - [ ] 20.3.4 Pruebas de compatibilidad (navegadores, dispositivos)
  - [ ] 20.3.5 Corrección de bugs encontrados

- [ ] 20.4 Deploy a producción
  - [ ] 20.4.1 Configurar servidor producción
  - [ ] 20.4.2 Configurar base de datos producción
  - [ ] 20.4.3 Configurar backups automáticos
  - [ ] 20.4.4 Configurar monitoreo y alertas
  - [ ] 20.4.5 Deploy de aplicación
  - [ ] 20.4.6 Smoke tests post-deployment
  - [ ] 20.4.7 Capacitación a usuarios finales
  - [ ] 20.4.8 Go-live y soporte inicial


---

## Notas Importantes

### Priorización
- **Fase 1 es MVP crítico**: Debe completarse primero para tener base funcional
- **Fase 2 depende de Fase 1**: No iniciar hasta completar infraestructura core
- **Fase 3 puede iniciarse en paralelo con Fase 2**: Una vez que servicios base estén listos
- **Fase 4 y 5 son mejoras**: Pueden priorizarse según necesidades del proyecto

### Dependencias Críticas
- Registro de Muestra Núcleo **DEPENDE** de Registro de Barreno
- Análisis de Campo **DEPENDE** de Registro de Muestra
- Análisis de Laboratorio **DEPENDE** de Registro de Muestra
- Dashboard **DEPENDE** de todos los módulos de captura

### Testing
- Escribir tests **ANTES** de implementar funcionalidad (TDD recomendado)
- Cobertura mínima: 80% para módulos core
- Tests de integración obligatorios para flujos completos
- Tests E2E antes de cada deploy

### Código Existente
- **registro-muestras.html** ya tiene implementación parcial
- **js/registro-muestras.js** tiene lógica de wizard y catálogos
- **Refactorizar** código existente en lugar de reescribir desde cero
- **Mantener** compatibilidad con datos ya capturados en localStorage

### Convenciones
- Usar **kebab-case** para nombres de archivos
- Usar **camelCase** para variables y funciones JavaScript
- Usar **PascalCase** para clases
- Prefijo `STORAGE_` para constantes de localStorage
- Prefijo `API_` para constantes de endpoints

### Revisión de Código
- Peer review obligatorio para cambios en módulos core
- Validar que tests pasen antes de merge
- Documentar funciones públicas con JSDoc
- Mantener design.md actualizado con cambios arquitectónicos

### Comunicación
- Actualizar estado de tasks en este archivo
- Reportar blockers inmediatamente
- Documentar decisiones técnicas importantes
- Compartir aprendizajes con el equipo
