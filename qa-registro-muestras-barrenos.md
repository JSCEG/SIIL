# Casos de prueba - Registro de Muestras y Barrenos

## Alcance

- Validar `Registro de Muestras` para `Arcillas` y `Salmueras`.
- Validar `Registro de Barrenos` conforme al gestor de cuestionarios.
- Validar reglas de negocio, persistencia local y persistencia en Supabase.

## Precondiciones generales

- Usuario autenticado con acceso a `registro-muestras.html`.
- Esquema SQL y migraciones aplicadas en Supabase.
- Navegador limpio o recarga forzada antes de iniciar.
- Tener un usuario con perfil que incluya `correo`, `nombre` e `institucion`.

## Flujo 1. Muestra de salmuera

### Caso 1.1 Alta exitosa de salmuera

- Objetivo: confirmar que `Salmueras` no usa barreno y genera ID correcto.
- Pasos:
  1. Abrir `registro-muestras.html`.
  2. Verificar que el bloque `Perfil del capturista` muestra correo, nombre e institucion.
  3. En `Contexto de la muestra`, capturar proyecto, institucion, responsable, estado, municipio y localidad opcional.
  4. Elegir `Fuente = Salmueras`.
  5. Capturar campo, pozo, coordenadas, altitud, profundidad, intervalo de produccion, corte de agua, presion, temperatura y pH.
  6. Capturar opcionalmente conductividad y oxigeno disuelto.
  7. Completar litologia, color, textura, notas y fotografias.
  8. Guardar.
- Resultado esperado:
- No aparece ningun paso de barreno o procedencia de arcillas.
- Se genera ID con formato `[Edo]-[Mpio]-[Campo]-[Pozo]-S.0000#`.
- El payload muestra `referenciaBarreno: null`.
- El registro aparece en el catalogo operativo.

### Caso 1.2 Validacion de corte de agua fuera de rango

- Objetivo: confirmar validacion `0 a 1`.
- Pasos: capturar `Corte de agua = 1.5` y guardar.
- Resultado esperado: mensaje de error indicando que debe estar entre `0 y 1`.

### Caso 1.3 Validacion de coordenadas fuera de rango

- Objetivo: validar rangos del gestor.
- Pasos: capturar `Latitud = 40` o `Longitud = -130`.
- Resultado esperado: mensaje de error por coordenadas fuera de rango.

## Flujo 2. Muestra de arcilla de superficie

### Caso 2.1 Alta exitosa sin barreno

- Objetivo: confirmar que `Arcillas > Superficie` no usa barreno.
- Pasos:
  1. Capturar contexto.
  2. Elegir `Fuente = Arcillas`.
  3. Elegir `Procedencia = Superficie`.
  4. Capturar latitud, longitud y altitud.
  5. Completar descripcion tecnica y guardar.
- Resultado esperado:
- No aparece selector de barreno.
- Se genera ID con formato `[Edo]-[Mpio]-SUP-A.0000#`.
- `origen_arcilla = Superficie`.
- `referencia_barreno_id` y `referencia_intervalo_id` quedan nulos.

### Caso 2.2 Sin barrenos registrados

- Objetivo: confirmar que no se ofrezca profundidad si no existe catalogo.
- Pasos: entrar con catalogo de barrenos vacio y elegir `Arcillas`.
- Resultado esperado:
- La procedencia disponible es solo `Superficie`.
- Se muestra el aviso: `Aun no existe un barreno registrado. Se debe registrar uno para continuar con el proceso.`

## Flujo 3. Muestra de arcilla de nucleo

### Caso 3.1 Alta exitosa con barreno

- Objetivo: confirmar enlace correcto al catalogo de barrenos.
- Precondicion: debe existir al menos un barreno con intervalos.
- Pasos:
  1. Capturar contexto.
  2. Elegir `Fuente = Arcillas`.
  3. Elegir `Procedencia = Profundidad (Nucleo)`.
  4. Seleccionar `Barreno (ID)`.
  5. Seleccionar `Intervalo (ID)`.
  6. Verificar autollenado o captura de `Desde` y `Hasta`.
  7. Seleccionar `Estructuras`.
  8. Completar descripcion tecnica y guardar.
- Resultado esperado:
- Se genera ID con formato `[Edo]-[Mpio]-PROF-A.0000#`.
- `referencia_barreno_id` y `referencia_intervalo_id` quedan informados.
- El registro queda visible en el catalogo.

### Caso 3.2 Intervalo invalido en nucleo

- Objetivo: validar `Hasta >= Desde`.
- Pasos: capturar `Desde = 20`, `Hasta = 10`.
- Resultado esperado: mensaje de error.

## Flujo 4. Registro de barreno

### Caso 4.1 Alta exitosa de barreno

- Objetivo: validar el formulario ampliado conforme al gestor.
- Pasos:
  1. Abrir `Registrar barreno`.
  2. Capturar `Sigla subregion`.
  3. Verificar generacion de ID `SEFMP31-[Subregion]-BRN-001`.
  4. Completar perforista, responsable, estado, municipio.
  5. Completar coordenadas, altitud, azimut, inclinacion.
  6. Capturar tipo de barrenacion, fechas, longitud perforada y recuperada.
  7. Verificar calculo automatico de `TCR`.
  8. Completar diametro, numero/nombre de cajas, RQD y observaciones.
  9. Capturar intervalos continuos.
  10. Guardar.
- Resultado esperado:
- Se guarda el barreno.
- Aparece en el catalogo de barrenos.
- Luego ya puede ser seleccionado por muestras de nucleo.

### Caso 4.2 Fecha final menor a fecha inicial

- Objetivo: validar regla documental.
- Pasos: poner `Fecha inicio = 2026-03-10` y `Fecha finalizacion = 2026-03-09`.
- Resultado esperado: mensaje de error.

### Caso 4.3 Longitud recuperada mayor a perforada

- Objetivo: validar consistencia fisica.
- Pasos: `Longitud perforada = 100`, `Longitud recuperada = 120`.
- Resultado esperado: mensaje de error.

### Caso 4.4 Intervalos no continuos

- Objetivo: validar continuidad.
- Pasos: capturar `0-10` y luego `12-20`.
- Resultado esperado: error indicando que el siguiente intervalo debe iniciar exactamente en `10`.

### Caso 4.5 Ultimo intervalo no cierra en longitud perforada

- Objetivo: validar cierre del nucleo.
- Pasos: longitud perforada `50`, ultimo intervalo termina en `45`.
- Resultado esperado: error.

## Flujo 5. Persistencia

### Caso 5.1 Guardado con Supabase disponible

- Objetivo: confirmar persistencia completa.
- Pasos: guardar una muestra y un barreno con sesion y tablas disponibles.
- Resultado esperado:
- Mensaje de exito indicando guardado en Supabase y respaldo local.
- Los registros existen en `public.barrenos`, `public.barreno_intervalos`, `public.muestras` y `public.muestra_fotos`.

### Caso 5.2 Falla de Supabase con respaldo local

- Objetivo: confirmar fallback.
- Pasos: simular fallo de red o tabla ausente y guardar.
- Resultado esperado:
- Mensaje de advertencia.
- El registro queda visible en el catalogo local.
- No se pierde la captura.

## Flujo 6. Reglas de perfil

### Caso 6.1 Perfil del capturista visible

- Objetivo: confirmar separacion entre perfil y dato documental.
- Resultado esperado:
- `Perfil del capturista` muestra datos de sesion en solo lectura.
- `Institucion que tomo la muestra` sigue siendo parte del formulario.

### Caso 6.2 Perfil sin permisos de captura

- Objetivo: validar modo consulta.
- Resultado esperado:
- El catalogo se puede consultar.
- El wizard queda deshabilitado para altas si el rol no puede capturar.

## Revisión en BD sugerida

- `public.muestras.institucion` debe representar la institucion que tomo la muestra.
- `public.muestras.capturista_correo`, `capturista_nombre`, `capturista_institucion` deben reflejar el usuario autenticado.
- `public.muestras.origen_arcilla` debe ser `Superficie` o `Profundidad (Nucleo)`.
- `public.barrenos.subregion_sigla` debe existir y participar en el ID.
- `public.barrenos.tcr` debe quedar entre `0` y `1`.

## Criterio de salida

- Todos los casos felices guardan sin errores.
- Todas las validaciones bloquean captura invalida.
- Los IDs se generan con el formato documental.
- Los datos quedan consistentes entre frontend, payload y base de datos.
