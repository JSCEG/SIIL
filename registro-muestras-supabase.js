(function () {
    const STORAGE_BARRENOS = "siil_catalogo_barrenos_v1";
    const STORAGE_MUESTRAS = "siil_catalogo_muestras_v1";

    const muestraWizard = document.getElementById("muestraWizard");
    const barrenoWizard = document.getElementById("barrenoWizard");
    const openBarrenoBtn = document.getElementById("openBarrenoBtn");
    const backToCardsBtn = document.getElementById("backToCardsBtn");
    const backToCardsFromBarrenoBtn = document.getElementById("backToCardsFromBarrenoBtn");
    const showBarrenoFormBtn = document.getElementById("showBarrenoFormBtn");
    const showBarrenoCatalogBtn = document.getElementById("showBarrenoCatalogBtn");
    const barrenoFormView = document.getElementById("barrenoFormView");
    const barrenoCatalogView = document.getElementById("barrenoCatalogView");
    const barrenoHeaderCopy = document.getElementById("barrenoHeaderCopy");

    const form = document.getElementById("registroMuestrasForm");
    const fieldsContainer = document.getElementById("dynamicFields");
    const stepTitle = document.querySelector("#dynamicStepTitle h2");
    const stepSubtitle = document.getElementById("dynamicStepSubtitle");
    const stepIndicator = document.getElementById("stepIndicator");
    const messageBox = document.getElementById("formMessages");
    const preview = document.getElementById("payloadPreview");
    const prevBtn = document.getElementById("prevStepBtn");
    const nextBtn = document.getElementById("nextStepBtn");
    const submitBtn = document.getElementById("submitBtn");

    const barrenoForm = document.getElementById("registroBarrenoForm");
    const barrenoMessages = document.getElementById("barrenoMessages");
    const barrenosList = document.getElementById("barrenosList");
    const barrenoDetailContent = document.getElementById("barrenoDetailContent");
    const barrenoIdInput = document.getElementById("barrenoId");
    const barrenoProyectoInput = document.getElementById("barrenoProyecto");
    const barrenoSubregionInput = document.getElementById("barrenoSubregion");
    const barrenoLongitudInput = document.getElementById("barrenoLongitud");
    const barrenoLongitudRecuperadaInput = document.getElementById("barrenoLongitudRecuperada");
    const barrenoTcrInput = document.getElementById("barrenoTcr");
    const barrenoEstadoSelect = document.getElementById("barrenoEstado");
    const barrenoMunicipioSelect = document.getElementById("barrenoMunicipio");
    const barrenoIntervalRows = document.getElementById("barrenoIntervalRows");
    const addIntervalRowBtn = document.getElementById("addIntervalRowBtn");

    const sampleRoleBadge = document.getElementById("sampleRoleBadge");
    const sampleCatalogIntro = document.getElementById("sampleCatalogIntro");
    const sampleCatalogSummary = document.getElementById("sampleCatalogSummary");
    const muestrasList = document.getElementById("muestrasList");
    const profileCorreo = document.getElementById("profileCorreo");
    const profileNombre = document.getElementById("profileNombre");
    const profileInstitucion = document.getElementById("profileInstitucion");

    const INEGI_ENDPOINTS = {
        estados: "https://gaia.inegi.org.mx/wscatgeo/mgee/",
        municipiosByEstado: (cveAgee) => `https://gaia.inegi.org.mx/wscatgeo/mgem/${cveAgee}`
    };

    const INSTITUCIONES = ["Unison", "SGM", "LitioMx", "Otro"];
    const PROJECT_OPTIONS = ["SEFMP.31"];
    const LITOLOGIAS = ["Igneas", "Sedimentarias", "Metamorficas", "Otra"];
    const COLORES_MUESTRA = ["Blanco", "Gris", "Cafe", "Rojo", "Verde", "Negro", "Amarillo", "Otro"];
    const TEXTURAS_MUESTRA = ["Masiva", "Laminada", "Fisurada", "Bioturbada", "Brechoide", "Otra"];
    const ESTRUCTURAS_MUESTRA = ["Fracturas rellenas", "Vetas de yeso", "Nodulos de carbonato", "Otra"];
    const ACCESIBILIDAD_OPTIONS = ["Buena", "Regular", "Mala", "Solo helicoptero", "Otra"];
    const TERRENO_OPTIONS = ["Planicie (Valle o Cuenca)", "Lomerio suave", "Piedemonte", "Canada/Arroyo", "Mesa / Meseta", "Sierra (Ladera)", "Banco de Material", "Otro"];
    const RQD_OPTIONS = ["90% - 100% (Excelente)", "75% - 90% (Bueno)", "50% - 75% (Regular)", "25% - 50% (Pobre)", "0% - 25% (Muy pobre)"];

    const SAMPLE_ROLE_COPY = {
        admin: {
            badge: "Perfil admin",
            intro: "Administre el catalogo operativo y la trazabilidad de muestras.",
            summary: "Puede crear, editar, revisar y validar registros."
        },
        coordinador: {
            badge: "Perfil coordinacion",
            intro: "Revise el avance del muestreo y gestione el flujo operativo.",
            summary: "Puede crear y revisar registros."
        },
        operador_campo: {
            badge: "Perfil operativo",
            intro: "Capture muestras y consulte el catalogo de trabajo del equipo.",
            summary: "Puede crear y actualizar registros en captura."
        },
        default: {
            badge: "Perfil consulta",
            intro: "Consulta operativa del catalogo de muestras.",
            summary: "Sin permisos de captura; la vista queda en modo consulta."
        }
    };

    const SAMPLE_ACTION_MATRIX = {
        admin: {
            borrador: ["view", "edit", "send_review", "cancel"],
            captura_abierta: ["view", "edit", "send_review", "cancel"],
            en_revision: ["view", "edit", "validate", "correct"],
            validado: ["view", "inactivate"],
            corregido: ["view", "edit", "send_review"],
            cancelado: ["view"]
        },
        coordinador: {
            captura_abierta: ["view", "edit", "send_review"],
            en_revision: ["view", "validate", "correct"],
            validado: ["view"],
            corregido: ["view", "edit"],
            cancelado: ["view"]
        },
        operador_campo: {
            borrador: ["view", "edit", "send_review"],
            captura_abierta: ["view", "edit", "send_review"],
            corregido: ["view", "edit", "send_review"],
            validado: ["view"],
            cancelado: ["view"]
        },
        default: {
            borrador: ["view"],
            captura_abierta: ["view"],
            en_revision: ["view"],
            validado: ["view"],
            corregido: ["view"],
            cancelado: ["view"]
        }
    };

    const SAMPLE_STATUS_LABELS = {
        borrador: "Borrador",
        captura_abierta: "Captura abierta",
        en_revision: "En revision",
        validado: "Validado",
        corregido: "Corregido",
        cancelado: "Cancelado",
        inactivo: "Inactivo"
    };

    const geoCatalog = {
        estados: [],
        estadosLoaded: false,
        municipiosByEstado: {},
        municipiosLoading: false
    };

    const state = {
        step: 0,
        barrenos: [],
        muestras: [],
        persistence: "local",
        currentUser: null,
        editingMuestraId: null,
        requestedView: "muestras",
        barrenoView: "form",
        selectedBarrenoId: null,
        data: {
            correo: "",
            nombreRegistro: "",
            institucion: "",
            institucionOtra: "",
            proyecto: "SEFMP.31",
            responsable: "",
            estado: "",
            municipio: "",
            localidad: "",
            fuente: "",
            notas: "",
            origenArcilla: "",
            salmuera_campo: "",
            salmuera_pozo: "",
            salmuera_latitud: "",
            salmuera_longitud: "",
            salmuera_altitud: "",
            salmuera_profundidad: "",
            salmuera_intervalo_inicio: "",
            salmuera_intervalo_fin: "",
            salmuera_corte_agua: "",
            salmuera_presion: "",
            salmuera_temperatura: "",
            salmuera_ph: "",
            salmuera_conductividad: "",
            salmuera_oxigeno_disuelto: "",
            arcilla_notas: "",
            arcilla_procedencia: "",
            arcilla_latitud: "",
            arcilla_longitud: "",
            arcilla_altitud: "",
            arcilla_barreno_id: "",
            arcilla_intervalo_id: "",
            arcilla_desde: "",
            arcilla_hasta: "",
            arcilla_estructuras: "",
            litologia: "",
            color: "",
            textura: "",
            fotos: []
        }
    };

    function getSupabaseConfig() {
        const config = window.SIIL_CONFIG?.supabase;
        if (!config?.url || !config?.anonKey) {
            return null;
        }

        return {
            url: String(config.url).replace(/\/+$/, ""),
            anonKey: config.anonKey
        };
    }

    function getAccessToken() {
        return window.AuthService?.readSession?.()?.access_token || "";
    }

    function canUseSupabase() {
        return Boolean(getSupabaseConfig() && getAccessToken());
    }

    async function supabaseRequest(path, options = {}) {
        const config = getSupabaseConfig();
        const accessToken = getAccessToken();

        if (!config || !accessToken) {
            throw new Error("No hay una sesion valida para guardar en Supabase.");
        }

        const headers = {
            apikey: config.anonKey,
            Authorization: `Bearer ${accessToken}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        };

        try {
            const response = await fetch(`${config.url}/rest/v1/${path}`, {
                method: options.method || "GET",
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            if (response.status === 204) {
                return null;
            }

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                const message = payload?.message || payload?.error_description || payload?.hint || "No fue posible completar la operacion con Supabase.";
                throw new Error(message);
            }

            return payload;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error("No se pudo conectar con Supabase. Revise la URL, la anon key y que la app este corriendo por http://localhost.");
            }

            throw error;
        }
    }

    function getEstadoByName(nombre) {
        return geoCatalog.estados.find((estado) => estado.nombre === nombre) || null;
    }

    function getMunicipioByName(estadoNombre, municipioNombre) {
        const estado = getEstadoByName(estadoNombre);
        if (!estado) return null;
        const municipios = geoCatalog.municipiosByEstado[estado.cve] || [];
        return municipios.find((municipio) => municipio.nombre === municipioNombre) || null;
    }

    function getEstadoOptions() {
        return geoCatalog.estados.map((estado) => estado.nombre);
    }

    function getMunicipioOptions() {
        const estadoSeleccionado = getEstadoByName(state.data.estado);
        if (!estadoSeleccionado) return [];
        const municipios = geoCatalog.municipiosByEstado[estadoSeleccionado.cve] || [];
        return municipios.map((municipio) => municipio.nombre);
    }

    function getBarrenoOptions() {
        return state.barrenos.map((barreno) => barreno.id);
    }

    function getSelectedBarreno() {
        return state.barrenos.find((barreno) => barreno.id === state.data.arcilla_barreno_id) || null;
    }

    function getIntervaloOptions() {
        const barreno = getSelectedBarreno();
        if (!barreno) return [];
        return barreno.intervalos.map((intervalo) => intervalo.id);
    }

    function getIntervaloById(barreno, intervaloId) {
        if (!barreno) return null;
        return barreno.intervalos.find((intervalo) => intervalo.id === intervaloId) || null;
    }

    function hasAvailableBarrenos() {
        return Array.isArray(state.barrenos) && state.barrenos.length > 0;
    }

    function syncBarrenoAvailability() {
        if (state.data.fuente !== "Arcillas") {
            state.data.origenArcilla = "";
            state.data.arcilla_barreno_id = "";
            state.data.arcilla_intervalo_id = "";
            state.data.arcilla_desde = "";
            state.data.arcilla_hasta = "";
            state.data.arcilla_estructuras = "";
            return;
        }

        if (!hasAvailableBarrenos() && state.data.origenArcilla === "Profundidad (Nucleo)") {
            state.data.origenArcilla = "Superficie";
        }

        if (state.data.origenArcilla !== "Profundidad (Nucleo)") {
            state.data.arcilla_barreno_id = "";
            state.data.arcilla_intervalo_id = "";
            state.data.arcilla_desde = "";
            state.data.arcilla_hasta = "";
            state.data.arcilla_estructuras = "";
            return;
        }

        if (!hasAvailableBarrenos()) {
            state.data.arcilla_barreno_id = "";
            state.data.arcilla_intervalo_id = "";
            state.data.arcilla_desde = "";
            state.data.arcilla_hasta = "";
        }
    }

    function syncSampleLocationFromSelectedBarreno() {
        const barreno = getSelectedBarreno();
        if (!barreno || state.data.origenArcilla !== "Profundidad (Nucleo)") {
            return;
        }
        state.data.estado = barreno.estado || state.data.estado;
        state.data.municipio = barreno.municipio || state.data.municipio;
        state.data.localidad = barreno.localidad || "";
    }

    function isBarrenoBoundLocationField(fieldKey) {
        return state.data.fuente === "Arcillas"
            && state.data.origenArcilla === "Profundidad (Nucleo)"
            && Boolean(state.data.arcilla_barreno_id)
            && ["estado", "municipio", "localidad"].includes(fieldKey);
    }

    function persistLocalBarrenosCatalog() {
        localStorage.setItem(STORAGE_BARRENOS, JSON.stringify(state.barrenos));
    }

    function loadLocalBarrenosCatalog() {
        try {
            const raw = localStorage.getItem(STORAGE_BARRENOS);
            const parsed = raw ? JSON.parse(raw) : [];
            state.barrenos = Array.isArray(parsed) ? parsed : [];
        } catch {
            state.barrenos = [];
        }
        state.persistence = "local";
    }

    async function loadBarrenosCatalog() {
        if (!canUseSupabase()) {
            loadLocalBarrenosCatalog();
            state.selectedBarrenoId = state.barrenos[0]?.id || null;
            return;
        }

        try {
            const rows = await supabaseRequest("barrenos?select=id,proyecto,subregion_sigla,perforista,responsable,responsable_descripcion,estado,estado_cve,municipio,municipio_cve,localidad,descripcion_local,litologia_local,estructura_aledana,anomalia_gravimetrica,anomalia_1,anomalia_2,anomalia_3,accesibilidad,tipo_terreno,latitud,longitud,altitud,azimut,inclinacion,tipo_barrenacion,fecha_inicio,fecha_fin,longitud_perforada,longitud_recuperada,diametro_mm,numero_cajas,nombre_cajas,rqd,tcr,intervalos_interes,archivo_descripcion_nucleo,observaciones,barreno_intervalos(intervalo_id,desde,hasta,orden)&order=created_at.desc");
            state.barrenos = Array.isArray(rows)
                ? rows.map((row) => ({
                    id: row.id,
                    proyecto: row.proyecto,
                    subregionSigla: row.subregion_sigla || "",
                    perforista: row.perforista || "",
                    responsable: row.responsable,
                    responsableDescripcion: row.responsable_descripcion || "",
                    estado: row.estado,
                    municipio: row.municipio,
                    localidad: row.localidad || "",
                    descripcionLocal: row.descripcion_local || "",
                    litologiaLocal: row.litologia_local || "",
                    estructuraAledana: row.estructura_aledana || "",
                    anomaliaGravimetrica: Number(row.anomalia_gravimetrica),
                    anomalia1: row.anomalia_1 || "",
                    anomalia2: row.anomalia_2 || "",
                    anomalia3: row.anomalia_3 || "",
                    accesibilidad: row.accesibilidad || "",
                    tipoTerreno: row.tipo_terreno || "",
                    latitud: Number(row.latitud),
                    longitud: Number(row.longitud),
                    altitud: Number(row.altitud),
                    azimut: Number(row.azimut),
                    inclinacion: Number(row.inclinacion),
                    tipoBarrenacion: row.tipo_barrenacion || "",
                    fechaInicio: row.fecha_inicio || "",
                    fechaFin: row.fecha_fin || "",
                    longitudPerforada: Number(row.longitud_perforada),
                    longitudRecuperada: Number(row.longitud_recuperada),
                    diametroMm: Number(row.diametro_mm),
                    numeroCajas: Number(row.numero_cajas),
                    nombreCajas: row.nombre_cajas || "",
                    rqd: row.rqd || "",
                    tcr: Number(row.tcr),
                    intervalosInteres: row.intervalos_interes || "",
                    archivoDescripcion: row.archivo_descripcion_nucleo || "",
                    observaciones: row.observaciones || "",
                    intervalos: Array.isArray(row.barreno_intervalos)
                        ? row.barreno_intervalos.sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0)).map((intervalo) => ({
                            id: intervalo.intervalo_id,
                            desde: Number(intervalo.desde),
                            hasta: Number(intervalo.hasta)
                        }))
                        : []
                }))
                : [];
            persistLocalBarrenosCatalog();
            state.persistence = "supabase";
            state.selectedBarrenoId = state.barrenos[0]?.id || null;
        } catch {
            loadLocalBarrenosCatalog();
            state.selectedBarrenoId = state.barrenos[0]?.id || null;
        }
    }

    function getDefaultSampleData() {
        const currentUser = state.currentUser || {};
        const currentInstitution = typeof currentUser.institucion === "string" ? currentUser.institucion.trim() : "";
        const matchedInstitution = INSTITUCIONES.find((option) => option.toLowerCase() === currentInstitution.toLowerCase());

        return {
            correo: currentUser.email || "",
            nombreRegistro: currentUser.name || "",
            institucion: matchedInstitution ? matchedInstitution : (currentInstitution ? "Otro" : ""),
            institucionOtra: matchedInstitution ? "" : currentInstitution,
            proyecto: "SEFMP.31",
            responsable: "",
            estado: "",
            municipio: "",
            localidad: "",
            fuente: "",
            notas: "",
            origenArcilla: "",
            salmuera_campo: "",
            salmuera_pozo: "",
            salmuera_latitud: "",
            salmuera_longitud: "",
            salmuera_altitud: "",
            salmuera_profundidad: "",
            salmuera_intervalo_inicio: "",
            salmuera_intervalo_fin: "",
            salmuera_corte_agua: "",
            salmuera_presion: "",
            salmuera_temperatura: "",
            salmuera_ph: "",
            salmuera_conductividad: "",
            salmuera_oxigeno_disuelto: "",
            arcilla_notas: "",
            arcilla_procedencia: "",
            arcilla_latitud: "",
            arcilla_longitud: "",
            arcilla_altitud: "",
            arcilla_barreno_id: "",
            arcilla_intervalo_id: "",
            arcilla_desde: "",
            arcilla_hasta: "",
            arcilla_estructuras: "",
            litologia: "",
            color: "",
            textura: "",
            fotos: []
        };
    }

    function fillProfileSummary() {
        const currentUser = state.currentUser || {};
        if (profileCorreo) profileCorreo.value = currentUser.email || "Sin dato";
        if (profileNombre) profileNombre.value = currentUser.name || "Sin dato";
        if (profileInstitucion) profileInstitucion.value = currentUser.institucion || "Sin dato";
    }
    function getCurrentRole() {
        return state.currentUser?.role || "default";
    }

    function getSampleRoleCopy() {
        return SAMPLE_ROLE_COPY[getCurrentRole()] || SAMPLE_ROLE_COPY.default;
    }

    function getAllowedSampleActions(status) {
        const roleMatrix = SAMPLE_ACTION_MATRIX[getCurrentRole()] || {};
        return roleMatrix[status] || ["view"];
    }

    function canCreateSamples() {
        return ["admin", "coordinador", "operador_campo"].includes(getCurrentRole());
    }

    function normalizeSampleRecord(entry) {
        if (entry?.payload && entry?.status) {
            return entry;
        }

        if (entry?.metadata?.idMuestraTomada) {
            const actor = entry.registro?.responsable || entry.registro?.correo || "Usuario SIIL";
            return {
                id: entry.metadata.idMuestraTomada,
                status: entry.metadata.estadoRegistro || "captura_abierta",
                createdAt: entry.metadata.fechaCapturaISO || new Date().toISOString(),
                updatedAt: entry.metadata.fechaCapturaISO || new Date().toISOString(),
                createdBy: actor,
                updatedBy: actor,
                payload: entry
            };
        }

        return null;
    }

    function persistMuestrasCatalog() {
        localStorage.setItem(STORAGE_MUESTRAS, JSON.stringify(state.muestras));
    }

    function loadMuestrasCatalog() {
        try {
            const raw = localStorage.getItem(STORAGE_MUESTRAS);
            const parsed = raw ? JSON.parse(raw) : [];
            state.muestras = (Array.isArray(parsed) ? parsed : []).map(normalizeSampleRecord).filter(Boolean);
        } catch {
            state.muestras = [];
        }
    }

    function upsertMuestraRecord(record) {
        const index = state.muestras.findIndex((item) => item.id === record.id);
        if (index >= 0) {
            state.muestras[index] = record;
        } else {
            state.muestras.unshift(record);
        }
        persistMuestrasCatalog();
    }

    function getStatusPillClasses(status) {
        const map = {
            borrador: "bg-slate-100 text-slate-700",
            captura_abierta: "bg-amber-100 text-amber-800",
            en_revision: "bg-blue-100 text-blue-700",
            validado: "bg-emerald-100 text-emerald-700",
            corregido: "bg-violet-100 text-violet-700",
            cancelado: "bg-rose-100 text-rose-700",
            inactivo: "bg-slate-200 text-slate-600"
        };

        return map[status] || "bg-slate-100 text-slate-700";
    }

    function getActionButtonLabel(action) {
        const labels = {
            view: "Ver",
            edit: "Editar",
            send_review: "Enviar a revision",
            validate: "Validar",
            correct: "Marcar correccion",
            cancel: "Cancelar",
            inactivate: "Inactivar"
        };

        return labels[action] || action;
    }

    function fillSampleCatalogHeader() {
        const copy = getSampleRoleCopy();
        if (sampleRoleBadge) {
            sampleRoleBadge.textContent = copy.badge;
        }
        if (sampleCatalogIntro) {
            sampleCatalogIntro.textContent = copy.intro;
        }
        if (sampleCatalogSummary) {
            sampleCatalogSummary.textContent = copy.summary;
        }
    }

    function renderMuestrasCatalogList() {
        if (!muestrasList) {
            return;
        }

        fillSampleCatalogHeader();
        muestrasList.innerHTML = "";

        if (state.muestras.length === 0) {
            muestrasList.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">Todavia no hay registros de muestra en este equipo.</li>';
            return;
        }

        state.muestras.forEach((record) => {
            const registro = record.payload?.registro || {};
            const statusLabel = SAMPLE_STATUS_LABELS[record.status] || record.status;
            const actions = getAllowedSampleActions(record.status);
            const li = document.createElement("li");
            li.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
            li.innerHTML = `
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div class="space-y-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-base font-bold text-slate-800">${record.id}</span>
                            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusPillClasses(record.status)}">${statusLabel}</span>
                        </div>
                        <div class="text-sm text-slate-600">${registro.fuente || "Sin fuente"} · ${registro.proyecto || "Sin proyecto"} · ${registro.responsable || "Sin responsable"}</div>
                        <div class="text-xs text-slate-500">Actualizado: ${new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.updatedAt))} · Por: ${record.updatedBy || "Usuario SIIL"}</div>
                    </div>
                    <div class="flex flex-wrap gap-2">${actions.map((action) => `<button type="button" class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary" data-sample-action="${action}" data-sample-id="${record.id}">${getActionButtonLabel(action)}</button>`).join("")}</div>
                </div>
            `;
            muestrasList.appendChild(li);
        });

        muestrasList.querySelectorAll("[data-sample-action]").forEach((button) => {
            button.addEventListener("click", () => handleSampleAction(button.dataset.sampleAction, button.dataset.sampleId));
        });
    }

    function getSelectedBarrenoDetail() {
        return state.barrenos.find((barreno) => barreno.id === state.selectedBarrenoId) || state.barrenos[0] || null;
    }

    function renderBarrenoDetail() {
        if (!barrenoDetailContent) return;
        const barreno = getSelectedBarrenoDetail();
        if (!barreno) {
            barrenoDetailContent.innerHTML = "Seleccione un barreno para ver su detalle.";
            return;
        }
        const intervalosHtml = barreno.intervalos.length > 0
            ? barreno.intervalos.map((intervalo) => `<li>${intervalo.id}: ${intervalo.desde} a ${intervalo.hasta} m</li>`).join("")
            : "<li>Sin intervalos registrados.</li>";
        const archivoHtml = barreno.archivoDescripcion
            ? `<div class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">Archivo registrado: <span class="font-semibold">${barreno.archivoDescripcion}</span></div>`
            : `<div class="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">No hay archivo de descripcion del nucleo adjunto.</div>`;
        barrenoDetailContent.innerHTML = `
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="mb-2 text-base font-bold text-slate-800">${barreno.id}</div>
                    <div class="space-y-1 text-sm text-slate-600">
                        <div><span class="font-semibold text-slate-700">Proyecto:</span> ${barreno.proyecto || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Subregion:</span> ${barreno.subregionSigla || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Perforista:</span> ${barreno.perforista || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Responsable:</span> ${barreno.responsable || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Ubicacion:</span> ${barreno.estado || "-"} / ${barreno.municipio || "-"} / ${barreno.localidad || "Sin localidad"}</div>
                        <div><span class="font-semibold text-slate-700">Coordenadas:</span> ${Number.isFinite(barreno.latitud) ? barreno.latitud : "-"}, ${Number.isFinite(barreno.longitud) ? barreno.longitud : "-"}</div>
                        <div><span class="font-semibold text-slate-700">Altitud:</span> ${Number.isFinite(barreno.altitud) ? barreno.altitud : "-"} msnm</div>
                        <div><span class="font-semibold text-slate-700">Fechas:</span> ${barreno.fechaInicio || "-"} a ${barreno.fechaFin || "-"}</div>
                    </div>
                </div>
                <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Geometria y nucleo</div>
                    <div class="space-y-1 text-sm text-slate-600">
                        <div><span class="font-semibold text-slate-700">Tipo de barrenacion:</span> ${barreno.tipoBarrenacion || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Longitud perforada:</span> ${Number.isFinite(barreno.longitudPerforada) ? barreno.longitudPerforada : "-"} m</div>
                        <div><span class="font-semibold text-slate-700">Longitud recuperada:</span> ${Number.isFinite(barreno.longitudRecuperada) ? barreno.longitudRecuperada : "-"} m</div>
                        <div><span class="font-semibold text-slate-700">TCR:</span> ${Number.isFinite(barreno.tcr) ? barreno.tcr.toFixed(4) : "-"}</div>
                        <div><span class="font-semibold text-slate-700">RQD:</span> ${barreno.rqd || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Diametro:</span> ${Number.isFinite(barreno.diametroMm) ? barreno.diametroMm : "-"} mm</div>
                        <div><span class="font-semibold text-slate-700">Cajas:</span> ${Number.isFinite(barreno.numeroCajas) ? barreno.numeroCajas : "-"} · ${barreno.nombreCajas || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Azimut/Inclinacion:</span> ${Number.isFinite(barreno.azimut) ? barreno.azimut : "-"} / ${Number.isFinite(barreno.inclinacion) ? barreno.inclinacion : "-"}</div>
                    </div>
                </div>
                <div class="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
                    <div class="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Contexto geologico</div>
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm text-slate-600">
                        <div><span class="font-semibold text-slate-700">Descripcion local:</span> ${barreno.descripcionLocal || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Litologia local:</span> ${barreno.litologiaLocal || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Estructura aledana:</span> ${barreno.estructuraAledana || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Accesibilidad:</span> ${barreno.accesibilidad || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Tipo de terreno:</span> ${barreno.tipoTerreno || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Anomalia gravimetrica:</span> ${Number.isFinite(barreno.anomaliaGravimetrica) ? barreno.anomaliaGravimetrica : "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Anomalia 1:</span> ${barreno.anomalia1 || "Sin dato"}</div>
                        <div><span class="font-semibold text-slate-700">Anomalia 2:</span> ${barreno.anomalia2 || "Sin dato"}</div>
                        <div class="md:col-span-2"><span class="font-semibold text-slate-700">Anomalia 3:</span> ${barreno.anomalia3 || "Sin dato"}</div>
                    </div>
                </div>
                <div class="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
                    <div class="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Intervalos y anexos</div>
                    <div class="mb-3 text-sm text-slate-600"><span class="font-semibold text-slate-700">Intervalos de interes:</span> ${barreno.intervalosInteres || "Sin dato"}</div>
                    <ul class="mb-4 list-disc pl-5 text-sm text-slate-600">${intervalosHtml}</ul>
                    ${archivoHtml}
                    <div class="mt-3 text-sm text-slate-600"><span class="font-semibold text-slate-700">Observaciones:</span> ${barreno.observaciones || "Sin dato"}</div>
                </div>
            </div>
        `;
    }

    function renderBarrenosCatalogList() {
        barrenosList.innerHTML = "";
        if (state.barrenos.length === 0) {
            state.selectedBarrenoId = null;
            barrenosList.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">No hay barrenos registrados aun.</li>';
            renderBarrenoDetail();
            return;
        }

        if (!state.selectedBarrenoId || !state.barrenos.some((barreno) => barreno.id === state.selectedBarrenoId)) {
            state.selectedBarrenoId = state.barrenos[0].id;
        }

        state.barrenos.forEach((barreno) => {
            const isSelected = barreno.id === state.selectedBarrenoId;
            const li = document.createElement("li");
            li.className = `rounded-xl border p-4 shadow-sm ${isSelected ? "border-primary bg-primary/5" : "border-slate-200 bg-white"}`;
            li.innerHTML = `
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div class="space-y-2">
                        <div class="text-base font-bold text-slate-800">${barreno.id}</div>
                        <div class="text-sm text-slate-600">${barreno.estado || "-"} / ${barreno.municipio || "-"} / ${barreno.localidad || "Sin localidad"}</div>
                        <div class="text-xs text-slate-500">Perforista: ${barreno.perforista || "Sin dato"} · Intervalos: ${barreno.intervalos.length} · TCR: ${Number.isFinite(barreno.tcr) ? barreno.tcr.toFixed(4) : "-"}</div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" class="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-primary hover:text-primary" data-barreno-detail="${barreno.id}">Ver detalle</button>
                    </div>
                </div>
            `;
            barrenosList.appendChild(li);
        });

        barrenosList.querySelectorAll("[data-barreno-detail]").forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedBarrenoId = button.dataset.barrenoDetail;
                renderBarrenosCatalogList();
            });
        });

        renderBarrenoDetail();
    }

    function showMuestraWizardView() {
        muestraWizard.classList.remove("hidden");
        barrenoWizard.classList.add("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setBarrenoView(mode) {
        state.barrenoView = mode === "catalog" ? "catalog" : "form";
        if (barrenoFormView) barrenoFormView.classList.toggle("hidden", state.barrenoView !== "form");
        if (barrenoCatalogView) barrenoCatalogView.classList.toggle("hidden", state.barrenoView !== "catalog");
        showBarrenoFormBtn?.classList.toggle("bg-primary", state.barrenoView === "form");
        showBarrenoFormBtn?.classList.toggle("text-white", state.barrenoView === "form");
        showBarrenoCatalogBtn?.classList.toggle("bg-primary", state.barrenoView === "catalog");
        showBarrenoCatalogBtn?.classList.toggle("text-white", state.barrenoView === "catalog");
        if (barrenoHeaderCopy) {
            barrenoHeaderCopy.textContent = state.barrenoView === "catalog"
                ? "Consulte los barrenos registrados y abra su ficha tecnica completa sin entrar al formulario de alta."
                : "Capture un nuevo barreno y sus intervalos conforme al cuestionario operativo.";
        }
        if (state.barrenoView === "catalog") {
            renderBarrenosCatalogList();
        }
    }

    function showBarrenoWizardView(mode = state.barrenoView || "form") {
        muestraWizard.classList.add("hidden");
        barrenoWizard.classList.remove("hidden");
        if (backToCardsFromBarrenoBtn) {
            backToCardsFromBarrenoBtn.classList.toggle("hidden", state.requestedView === "barrenos" || state.requestedView === "barrenos-catalogo");
        }
        hydrateBarrenoGeoSelects();
        setBarrenoView(mode);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setFallbackEstados() {
        geoCatalog.estados = ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Coahuila de Zaragoza", "Colima", "Chiapas", "Chihuahua", "Ciudad de Mexico", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Michoacan de Ocampo", "Morelos", "Nayarit", "Nuevo Leon", "Oaxaca", "Puebla", "Queretaro", "Quintana Roo", "San Luis Potosi", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz de Ignacio de la Llave", "Yucatan", "Zacatecas"].map((nombre, index) => ({ cve: String(index + 1).padStart(2, "0"), nombre }));
        geoCatalog.estadosLoaded = true;
    }

    async function loadEstados() {
        if (geoCatalog.estadosLoaded) return;
        try {
            const response = await fetch(INEGI_ENDPOINTS.estados);
            if (!response.ok) throw new Error();
            const payload = await response.json();
            const rows = Array.isArray(payload?.datos) ? payload.datos : [];
            geoCatalog.estados = rows.map((row) => ({ cve: row.cve_agee, nombre: row.nom_agee }));
            if (geoCatalog.estados.length === 0) setFallbackEstados();
            geoCatalog.estadosLoaded = true;
        } catch {
            setFallbackEstados();
        }
    }

    async function loadMunicipiosForEstado(estadoNombre) {
        const estado = getEstadoByName(estadoNombre);
        if (!estado) return;
        if (Array.isArray(geoCatalog.municipiosByEstado[estado.cve])) return;

        geoCatalog.municipiosLoading = true;
        try {
            const response = await fetch(INEGI_ENDPOINTS.municipiosByEstado(estado.cve));
            if (!response.ok) throw new Error();
            const payload = await response.json();
            const rows = Array.isArray(payload?.datos) ? payload.datos : [];
            geoCatalog.municipiosByEstado[estado.cve] = rows.map((row) => ({ cve: row.cve_agem, nombre: row.nom_agem })).filter((municipio) => municipio.nombre);
        } catch {
            geoCatalog.municipiosByEstado[estado.cve] = [];
        } finally {
            geoCatalog.municipiosLoading = false;
        }
    }

    async function hydrateBarrenoGeoSelects() {
        await loadEstados();
        barrenoEstadoSelect.innerHTML = '<option value="">Seleccione...</option>';
        getEstadoOptions().forEach((nombre) => {
            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            barrenoEstadoSelect.appendChild(option);
        });
        barrenoMunicipioSelect.innerHTML = '<option value="">Seleccione primero un estado...</option>';
    }
    function getSteps() {
        const steps = [
            {
                key: "contexto",
                title: "Contexto de la muestra",
                subtitle: `Datos del registro. Persistencia actual: ${state.persistence}.`,
                fields: [
                    { key: "proyecto", label: "Proyecto", type: "select", required: true, options: PROJECT_OPTIONS },
                    { key: "institucion", label: "Institucion que tomo la muestra", type: "select", required: true, options: INSTITUCIONES },
                    { key: "institucionOtra", label: "Otra institucion", type: "text", required: true, showIf: (data) => data.institucion === "Otro" || data.institucion === "Otra" },
                    { key: "responsable", label: "Responsable", type: "text", required: true },
                    { key: "estado", label: "Estado", type: "select", required: true },
                    { key: "municipio", label: "Municipio", type: "select", required: true },
                    { key: "localidad", label: "Localidad (opcional)", type: "text" }
                ]
            },
            {
                key: "fuente",
                title: "Fuente",
                subtitle: "Seleccione la fuente de donde se tomo la muestra.",
                fields: [{ key: "fuente", label: "Fuente", type: "radio", required: true, options: ["Arcillas", "Salmueras"] }]
            }
        ];

        if (state.data.fuente === "Arcillas") {
            steps.push({
                key: "procedencia_arcillas",
                title: "Procedencia",
                subtitle: !hasAvailableBarrenos()
                    ? "Aun no existe un barreno registrado; la procedencia disponible es Superficie hasta registrar uno."
                    : "Indique si la muestra de arcilla proviene de superficie o de profundidad (nucleo).",
                fields: [{
                    key: "origenArcilla",
                    label: "Procedencia",
                    type: "radio",
                    required: true,
                    options: hasAvailableBarrenos() ? ["Superficie", "Profundidad (Nucleo)"] : ["Superficie"]
                }]
            });

            if (state.data.origenArcilla === "Superficie") {
                steps.push({
                    key: "arcillas_superficie",
                    title: "Arcillas de superficie",
                    subtitle: "Georreferenciacion del punto de toma para muestras de superficie.",
                    fields: [
                        { key: "arcilla_latitud", label: "Latitud (Norte)", type: "number", step: "any", required: true },
                        { key: "arcilla_longitud", label: "Longitud (Este)", type: "number", step: "any", required: true },
                        { key: "arcilla_altitud", label: "Altitud (msnm)", type: "number", step: "any", required: true }
                    ]
                });
            }

            if (state.data.origenArcilla === "Profundidad (Nucleo)") {
                steps.push({
                    key: "arcillas_nucleo",
                    title: "Arcillas de nucleo",
                    subtitle: "Seleccione el barreno y el intervalo de donde procede la muestra.",
                    fields: [
                        { key: "arcilla_barreno_id", label: "Barreno (ID)", type: "select", required: true },
                        { key: "arcilla_intervalo_id", label: "Intervalo (ID)", type: "select", required: true },
                        { key: "arcilla_desde", label: "Desde (m)", type: "number", step: "any", required: true },
                        { key: "arcilla_hasta", label: "Hasta (m)", type: "number", step: "any", required: true },
                        { key: "arcilla_estructuras", label: "Estructuras", type: "select", required: true, options: ESTRUCTURAS_MUESTRA }
                    ]
                });
            }
        }

        if (state.data.fuente === "Salmueras") {
            steps.push({
                key: "salmueras",
                title: "Salmueras",
                subtitle: "Datos operativos del campo, pozo y fluido asociado.",
                fields: [
                    { key: "salmuera_campo", label: "Campo", type: "text", required: true },
                    { key: "salmuera_pozo", label: "Pozo", type: "text", required: true },
                    { key: "salmuera_latitud", label: "Latitud (Norte)", type: "number", step: "any", required: true },
                    { key: "salmuera_longitud", label: "Longitud (Este)", type: "number", step: "any", required: true },
                    { key: "salmuera_altitud", label: "Altitud (msnm)", type: "number", step: "any", required: true },
                    { key: "salmuera_profundidad", label: "Profundidad (m)", type: "number", step: "any", required: true },
                    { key: "salmuera_intervalo_inicio", label: "Intervalo de produccion - inicio (m)", type: "number", step: "any", required: true },
                    { key: "salmuera_intervalo_fin", label: "Intervalo de produccion - fin (m)", type: "number", step: "any", required: true },
                    { key: "salmuera_corte_agua", label: "Corte de agua (0 a 1)", type: "number", step: "any", required: true },
                    { key: "salmuera_presion", label: "Presion (Pa)", type: "number", step: "any", required: true },
                    { key: "salmuera_temperatura", label: "Temperatura (C)", type: "number", step: "any", required: true },
                    { key: "salmuera_ph", label: "pH", type: "number", step: "any", required: true },
                    { key: "salmuera_conductividad", label: "Conductividad electrica", type: "number", step: "any", required: false },
                    { key: "salmuera_oxigeno_disuelto", label: "Oxigeno disuelto", type: "number", step: "any", required: false }
                ]
            });
        }

        steps.push({
            key: "descripcion",
            title: "Descripcion tecnica y evidencias",
            subtitle: "Caracterizacion geologica, notas y fotografias de la muestra.",
            fields: [
                { key: "litologia", label: "Litologia", type: "select", required: true, options: LITOLOGIAS },
                { key: "color", label: "Color", type: "select", required: true, options: COLORES_MUESTRA },
                { key: "textura", label: "Textura", type: "select", required: true, options: TEXTURAS_MUESTRA },
                { key: "notas", label: "Notas", type: "textarea", required: false },
                { key: "fotos", label: "Fotografias de la muestra", type: "file", required: true, multiple: true }
            ]
        });

        return steps;
    }

    function renderIndicators(steps) {
        stepIndicator.innerHTML = "";
        steps.forEach((step, index) => {
            const el = document.createElement("div");
            const isActive = index === state.step;
            const isDone = index < state.step;
            el.className = `rounded-full px-3 py-2 text-xs font-bold transition-colors ${isActive ? "bg-primary text-white" : isDone ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500"}`;
            el.textContent = `${index + 1}. ${step.title}`;
            stepIndicator.appendChild(el);
        });
    }

    function fieldWrapper(label, input, fullWidth = false) {
        const wrap = document.createElement("div");
        wrap.className = fullWidth ? "md:col-span-2" : "";
        const labelEl = document.createElement("label");
        labelEl.className = "mb-1.5 block text-sm font-semibold text-slate-700";
        labelEl.textContent = label;
        wrap.appendChild(labelEl);
        wrap.appendChild(input);
        return wrap;
    }

    function renderField(field) {
        const isUserBoundField = ["correo", "nombreRegistro"].includes(field.key);
        const isBarrenoLockedField = isBarrenoBoundLocationField(field.key);
        if (field.showIf && !field.showIf(state.data)) return null;

        if (isUserBoundField) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = state.data[field.key] || "Sin dato";
            input.readOnly = true;
            input.className = "w-full rounded-lg border-slate-300 bg-slate-50 text-sm text-slate-700";
            return fieldWrapper(field.label, input);
        }

        if (field.type === "radio") {
            const group = document.createElement("div");
            group.className = "space-y-2 md:col-span-2";
            const title = document.createElement("p");
            title.className = "mb-1.5 block text-sm font-semibold text-slate-700";
            title.textContent = field.label;
            group.appendChild(title);

            field.options.forEach((option) => {
                const label = document.createElement("label");
                label.className = "flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 hover:border-primary/40";
                const input = document.createElement("input");
                input.type = "radio";
                input.name = field.key;
                input.value = option;
                input.checked = state.data[field.key] === option;
                input.className = "text-primary focus:ring-primary";
                input.addEventListener("change", () => {
                    state.data[field.key] = option;
                    if (field.key === "fuente") {
                        state.data.origenArcilla = "";
                        state.data.arcilla_barreno_id = "";
                        state.data.arcilla_intervalo_id = "";
                        state.data.arcilla_desde = "";
                        state.data.arcilla_hasta = "";
                        state.data.arcilla_estructuras = "";
                        syncBarrenoAvailability();
                    }
                    if (field.key === "origenArcilla") {
                        if (option === "Profundidad (Nucleo)" && !hasAvailableBarrenos()) {
                            state.data.origenArcilla = "Superficie";
                            showMessage(["Aun no existe un barreno registrado; se debe registrar uno para continuar con el proceso."], "warning");
                            render();
                            return;
                        }
                        state.data.arcilla_barreno_id = "";
                        state.data.arcilla_intervalo_id = "";
                        state.data.arcilla_desde = "";
                        state.data.arcilla_hasta = "";
                        state.data.arcilla_estructuras = "";
                        syncBarrenoAvailability();
                    }
                    render();
                });
                const text = document.createElement("span");
                text.className = "text-sm text-slate-700";
                text.textContent = option;
                label.appendChild(input);
                label.appendChild(text);
                group.appendChild(label);
            });

            return group;
        }

        if (field.type === "textarea") {
            const input = document.createElement("textarea");
            input.className = "w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary";
            input.rows = 4;
            input.value = state.data[field.key] || "";
            if (isBarrenoLockedField) {
                input.readOnly = true;
                input.classList.add("bg-slate-50", "text-slate-700");
            }
            input.addEventListener("input", (event) => {
                if (isBarrenoLockedField) {
                    return;
                }
                state.data[field.key] = event.target.value;
                updatePreview();
            });
            return fieldWrapper(field.label, input, true);
        }

        if (field.type === "select") {
            const input = document.createElement("select");
            input.className = "w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary";
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Seleccione...";
            input.appendChild(placeholder);

            let options = field.options || [];
            if (field.key === "estado") options = getEstadoOptions();
            if (field.key === "municipio") {
                options = getMunicipioOptions();
                input.disabled = !state.data.estado || geoCatalog.municipiosLoading;
                if (!state.data.estado) placeholder.textContent = "Seleccione primero un estado...";
            }
            if (field.key === "arcilla_barreno_id") {
                options = getBarrenoOptions();
                if (options.length === 0) placeholder.textContent = "Sin barrenos en catalogo";
            }
            if (field.key === "arcilla_intervalo_id") {
                options = getIntervaloOptions();
                input.disabled = !state.data.arcilla_barreno_id;
                if (!state.data.arcilla_barreno_id) placeholder.textContent = "Seleccione primero un barreno...";
            }

            options.forEach((option) => {
                const opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                input.appendChild(opt);
            });

            input.value = state.data[field.key] || "";
            if (isUserBoundField || isBarrenoLockedField) {
                input.disabled = true;
                input.classList.add("bg-slate-50", "text-slate-700");
            }
            input.addEventListener("change", async (event) => {
                if (isUserBoundField || isBarrenoLockedField) {
                    return;
                }
                if (field.key === "estado") {
                    state.data.estado = event.target.value;
                    state.data.municipio = "";
                    await loadMunicipiosForEstado(state.data.estado);
                    render();
                    return;
                }
                if (field.key === "municipio") {
                    state.data.municipio = event.target.value;
                    render();
                    return;
                }
                if (field.key === "arcilla_barreno_id") {
                    state.data.arcilla_barreno_id = event.target.value;
                    state.data.arcilla_intervalo_id = "";
                    state.data.arcilla_desde = "";
                    state.data.arcilla_hasta = "";
                    syncSampleLocationFromSelectedBarreno();
                    await loadMunicipiosForEstado(state.data.estado);
                    render();
                    return;
                }
                if (field.key === "arcilla_intervalo_id") {
                    state.data.arcilla_intervalo_id = event.target.value;
                    const barreno = getSelectedBarreno();
                    const intervalo = getIntervaloById(barreno, state.data.arcilla_intervalo_id);
                    if (intervalo) {
                        state.data.arcilla_desde = String(intervalo.desde);
                        state.data.arcilla_hasta = String(intervalo.hasta);
                    }
                    render();
                    return;
                }

                state.data[field.key] = event.target.value;
                render();
            });

            return fieldWrapper(field.label, input);
        }

        if (field.type === "file") {
            const input = document.createElement("input");
            input.type = "file";
            input.className = "w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary";
            if (field.multiple) input.multiple = true;
            input.addEventListener("change", (event) => {
                const files = Array.from(event.target.files || []);
                state.data[field.key] = files.map((file) => file.name);
                updatePreview();
            });
            return fieldWrapper(field.label, input, true);
        }

        const input = document.createElement("input");
        input.type = field.type || "text";
        if (field.step) input.step = field.step;
        input.className = "w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary";
        input.value = state.data[field.key] || "";
        if (isUserBoundField || isBarrenoLockedField) {
            input.readOnly = true;
            input.classList.add("bg-slate-50", "text-slate-700");
        }
        input.addEventListener("input", (event) => {
            if (isUserBoundField || isBarrenoLockedField) {
                return;
            }
            state.data[field.key] = event.target.value;
            updatePreview();
        });
        return fieldWrapper(field.label, input);
    }

    function visibleFields(step) {
        return step.fields.filter((field) => !field.showIf || field.showIf(state.data));
    }

    function validateStep(step) {
        const errors = [];
        visibleFields(step).forEach((field) => {
            if (!field.required) return;
            const value = state.data[field.key];
            if (Array.isArray(value)) {
                if (value.length === 0) errors.push(`El campo "${field.label}" es obligatorio.`);
                return;
            }
            if (String(value || "").trim() === "") errors.push(`El campo "${field.label}" es obligatorio.`);
        });

        const validateGeoRange = (label, lat, lng, alt) => {
            const latNum = Number(lat);
            const lngNum = Number(lng);
            const altNum = Number(alt);
            if (Number.isFinite(latNum) && (latNum < 14 || latNum > 33)) errors.push(`${label}: latitud fuera de rango valido (14.0 a 33.0).`);
            if (Number.isFinite(lngNum) && (lngNum < -118.5 || lngNum > -86.0)) errors.push(`${label}: longitud fuera de rango valido (-118.5 a -86.0).`);
            if (Number.isFinite(altNum) && altNum <= 0) errors.push(`${label}: altitud debe ser mayor a 0.`);
        };

        if (step.key === "arcillas_superficie") {
            validateGeoRange("Arcillas superficie", state.data.arcilla_latitud, state.data.arcilla_longitud, state.data.arcilla_altitud);
        }

        if (step.key === "salmueras") {
            validateGeoRange("Salmueras", state.data.salmuera_latitud, state.data.salmuera_longitud, state.data.salmuera_altitud);
            const start = Number(state.data.salmuera_intervalo_inicio);
            const end = Number(state.data.salmuera_intervalo_fin);
            const corteAgua = Number(state.data.salmuera_corte_agua);
            const profundidad = Number(state.data.salmuera_profundidad);
            const presion = Number(state.data.salmuera_presion);
            const temperatura = Number(state.data.salmuera_temperatura);
            const ph = Number(state.data.salmuera_ph);
            if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
                errors.push("El intervalo de produccion fin no puede ser menor que inicio.");
            }
            if (!Number.isNaN(corteAgua) && (corteAgua < 0 || corteAgua > 1)) {
                errors.push("Corte de agua debe estar entre 0 y 1.");
            }
            if (!Number.isNaN(profundidad) && profundidad <= 0) errors.push("Profundidad debe ser mayor a 0.");
            if (!Number.isNaN(presion) && presion <= 0) errors.push("Presion debe ser mayor a 0.");
            if (!Number.isNaN(temperatura) && temperatura <= 0) errors.push("Temperatura debe ser mayor a 0.");
            if (!Number.isNaN(ph) && ph <= 0) errors.push("pH debe ser mayor a 0.");
        }

        if (step.key === "arcillas_nucleo") {
            if (state.barrenos.length === 0) {
                errors.push("No hay barrenos en catalogo. Registre un barreno primero.");
            }
            const desde = Number(state.data.arcilla_desde);
            const hasta = Number(state.data.arcilla_hasta);
            if (!Number.isNaN(desde) && desde <= 0) errors.push("Desde debe ser mayor a 0.");
            if (!Number.isNaN(hasta) && hasta <= 0) errors.push("Hasta debe ser mayor a 0.");
            if (!Number.isNaN(desde) && !Number.isNaN(hasta) && hasta < desde) {
                errors.push("El campo Hasta no puede ser menor que Desde.");
            }
        }

        return errors;
    }

    function showMessage(messages, type = "error") {
        if (!messages || messages.length === 0) {
            messageBox.className = "hidden rounded-lg border px-3 py-2 text-sm mt-6";
            messageBox.innerHTML = "";
            return;
        }

        const classes = {
            error: "bg-red-50 border-red-200 text-red-700",
            success: "bg-emerald-50 border-emerald-200 text-emerald-700",
            warning: "bg-amber-50 border-amber-200 text-amber-800"
        };

        messageBox.className = `mt-6 rounded-lg border px-3 py-2 text-sm ${classes[type] || classes.error}`;
        messageBox.innerHTML = messages.map((msg) => `<div>• ${msg}</div>`).join("");
    }

    function showBarrenoMessage(messages, type = "error") {
        if (!messages || messages.length === 0) {
            barrenoMessages.className = "hidden rounded-lg border px-3 py-2 text-sm mt-6";
            barrenoMessages.innerHTML = "";
            return;
        }

        const classes = {
            error: "bg-red-50 border-red-200 text-red-700",
            success: "bg-emerald-50 border-emerald-200 text-emerald-700",
            warning: "bg-amber-50 border-amber-200 text-amber-800"
        };

        barrenoMessages.className = `mt-6 rounded-lg border px-3 py-2 text-sm ${classes[type] || classes.error}`;
        barrenoMessages.innerHTML = messages.map((msg) => `<div>• ${msg}</div>`).join("");
    }
    function normalizeToken(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function buildProjectSigla(projectName) {
        const compact = normalizeToken(projectName).replace(/\s+/g, "");
        return compact.slice(0, 8) || "PRJ";
    }

    function buildSubregionSiglaFromSelection() {
        const estado = normalizeToken(barrenoEstadoSelect?.value).replace(/\s+/g, "").slice(0, 3);
        const municipio = normalizeToken(barrenoMunicipioSelect?.value).replace(/\s+/g, "").slice(0, 5);
        const joined = `${estado}${municipio}`;
        return joined || "SUBREG";
    }

    function nextBarrenoConsecutivo(prefix) {
        const regex = new RegExp(`^${prefix}-(\\d{3})$`);
        let max = 0;
        state.barrenos.forEach((barreno) => {
            const match = barreno.id.match(regex);
            if (match) {
                max = Math.max(max, Number(match[1]));
            }
        });
        return String(max + 1).padStart(3, "0");
    }

    function updateBarrenoIdPreview() {
        const projectSigla = buildProjectSigla(barrenoProyectoInput.value);
        const hasGeoSelection = Boolean(barrenoEstadoSelect?.value && barrenoMunicipioSelect?.value);
        const subregionSigla = hasGeoSelection ? buildSubregionSiglaFromSelection() : "";

        if (barrenoSubregionInput) {
            barrenoSubregionInput.value = subregionSigla;
        }

        if (!barrenoProyectoInput.value.trim() || !hasGeoSelection) {
            barrenoIdInput.value = "";
            return;
        }

        const prefix = `${projectSigla}-${subregionSigla}-BRN`;
        const consecutivo = nextBarrenoConsecutivo(prefix);
        barrenoIdInput.value = `${prefix}-${consecutivo}`;
    }

    function updateBarrenoTcrPreview() {
        if (!barrenoLongitudInput || !barrenoLongitudRecuperadaInput || !barrenoTcrInput) return;
        const perforada = Number(barrenoLongitudInput.value);
        const recuperada = Number(barrenoLongitudRecuperadaInput.value);
        if (!Number.isFinite(perforada) || perforada <= 0 || !Number.isFinite(recuperada) || recuperada < 0) {
            barrenoTcrInput.value = "";
            return;
        }
        barrenoTcrInput.value = (recuperada / perforada).toFixed(4);
    }

    function buildCatalogSequence(prefix) {
        const items = Array.isArray(state.muestras) ? state.muestras : [];
        let max = 0;
        items.forEach((item) => {
            const sampleId = item?.id || item?.payload?.metadata?.idMuestraTomada || "";
            if (!sampleId.startsWith(prefix)) return;
            const suffix = sampleId.slice(prefix.length);
            const match = suffix.match(/(\d{5})$/);
            if (match) {
                max = Math.max(max, Number(match[1]));
            }
        });
        return String(max + 1).padStart(5, "0");
    }

    function buildIdSegment(value, maxLength = 6) {
        return normalizeToken(value).replace(/\s+/g, "").slice(0, maxLength) || "NA";
    }

    function generateMuestraId(estadoCve, municipioCve) {
        if (state.data.fuente === "Salmueras") {
            const campoKey = buildIdSegment(state.data.salmuera_campo, 6);
            const pozoKey = buildIdSegment(state.data.salmuera_pozo, 6);
            const prefix = `${estadoCve}-${municipioCve}-${campoKey}-${pozoKey}-S.`;
            return `${prefix}${buildCatalogSequence(prefix)}`;
        }

        const procedenciaKey = state.data.origenArcilla === "Profundidad (Nucleo)" ? "PROF" : "SUP";
        const prefix = `${estadoCve}-${municipioCve}-${procedenciaKey}-A.`;
        return `${prefix}${buildCatalogSequence(prefix)}`;
    }

    function buildPayload() {
        const now = new Date();
        const estado = getEstadoByName(state.data.estado);
        const municipio = getMunicipioByName(state.data.estado, state.data.municipio);
        const estadoCve = estado?.cve || "00";
        const municipioCve = municipio?.cve || "000";
        const idMuestra = generateMuestraId(estadoCve, municipioCve);
        const barreno = getSelectedBarreno();
        const intervalo = getIntervaloById(barreno, state.data.arcilla_intervalo_id);

        return {
            metadata: {
                formulario: "Registro de Muestras V2",
                fechaCapturaISO: now.toISOString(),
                idMuestraTomada: idMuestra,
                cveEstado: estadoCve,
                cveMunicipio: municipioCve,
                persistencia: state.persistence,
                capturistaCorreo: state.currentUser?.email || state.data.correo || "",
                capturistaNombre: state.currentUser?.name || state.data.nombreRegistro || "",
                capturistaInstitucion: state.currentUser?.institucion || ""
            },
            referenciaBarreno: barreno ? { id: barreno.id, intervalo: intervalo || null } : null,
            registro: { ...state.data }
        };
    }

    function updatePreview() {
        preview.textContent = JSON.stringify(buildPayload(), null, 2);
    }

    function resetSampleDraft() {
        state.step = 0;
        state.editingMuestraId = null;
        state.data = getDefaultSampleData();
        fillProfileSummary();
        submitBtn.textContent = "Guardar muestra";
    }

    function loadSampleIntoForm(record) {
        state.editingMuestraId = record.id;
        state.step = 0;
        state.data = {
            ...getDefaultSampleData(),
            ...(record.payload?.registro || {})
        };
        submitBtn.textContent = "Guardar cambios";
        showMuestraWizardView();
        render();
        showMessage([`Editando registro ${record.id}.`], "warning");
    }

    async function updateSampleStatus(record, nextStatus) {
        record.status = nextStatus;
        record.updatedAt = new Date().toISOString();
        record.updatedBy = state.currentUser?.name || state.currentUser?.email || "Usuario SIIL";
        if (record.payload?.metadata) {
            record.payload.metadata.estadoRegistro = nextStatus;
            record.payload.metadata.fechaActualizacionISO = record.updatedAt;
        }
        upsertMuestraRecord(record);
        renderMuestrasCatalogList();
        preview.textContent = JSON.stringify(record.payload, null, 2);
    }

    async function handleSampleAction(action, sampleId) {
        const record = state.muestras.find((item) => item.id === sampleId);
        if (!record) {
            return;
        }

        if (action === "view") {
            preview.textContent = JSON.stringify(record.payload, null, 2);
            showMuestraWizardView();
            showMessage([`Consulta del registro ${record.id}.`], "success");
            return;
        }

        if (action === "edit") {
            loadSampleIntoForm(record);
            return;
        }

        const nextStatusMap = {
            send_review: "en_revision",
            validate: "validado",
            correct: "corregido",
            cancel: "cancelado",
            inactivate: "inactivo"
        };

        const nextStatus = nextStatusMap[action];
        if (!nextStatus) {
            return;
        }

        updateSampleStatus(record, nextStatus);
        showMessage([`El registro ${record.id} paso a ${SAMPLE_STATUS_LABELS[nextStatus] || nextStatus}.`], nextStatus === "cancelado" ? "warning" : "success");
    }

    function sanitizeStep() {
        const steps = getSteps();
        if (state.step >= steps.length) {
            state.step = steps.length - 1;
        }
        if (state.step < 0) {
            state.step = 0;
        }
    }

    function renderBarrenoWarningIfNeeded(currentStep) {
        const mustWarnForProcedencia = currentStep.key === "procedencia_arcillas" && state.data.fuente === "Arcillas" && !hasAvailableBarrenos();
        const mustWarnForNucleo = currentStep.key === "arcillas_nucleo" && !hasAvailableBarrenos();
        if (!mustWarnForProcedencia && !mustWarnForNucleo) return;

        const warning = document.createElement("div");
        warning.className = "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2";
        warning.innerHTML = "<div class='mb-2 font-semibold'>Aun no existe un barreno registrado.</div><div class='mb-2'>Se debe registrar uno para continuar con el proceso.</div>";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#7f1c3a]";
        button.textContent = mustWarnForProcedencia ? "Registrar barreno" : "Ir a Registro de Barreno";
        button.addEventListener("click", () => showBarrenoWizardView());
        warning.appendChild(button);
        fieldsContainer.prepend(warning);
    }

    function render() {
        syncBarrenoAvailability();
        const steps = getSteps();
        sanitizeStep();
        const current = steps[state.step];
        const isReadOnlyCatalogMode = !canCreateSamples() && !state.editingMuestraId;

        stepTitle.textContent = current.title;
        stepSubtitle.textContent = isReadOnlyCatalogMode
            ? "Este perfil consulta el catalogo de muestras y usa esta vista como referencia operativa."
            : (current.subtitle || "");

        fieldsContainer.innerHTML = "";
        visibleFields(current).forEach((field) => {
            const rendered = renderField(field);
            if (rendered) fieldsContainer.appendChild(rendered);
        });
        renderBarrenoWarningIfNeeded(current);

        renderIndicators(steps);
        prevBtn.disabled = state.step === 0 || isReadOnlyCatalogMode;
        const isLast = state.step === steps.length - 1;
        nextBtn.classList.toggle("hidden", isLast);
        submitBtn.classList.toggle("hidden", !isLast);
        nextBtn.disabled = isReadOnlyCatalogMode;
        submitBtn.disabled = isReadOnlyCatalogMode;
        Array.from(fieldsContainer.querySelectorAll("input, select, textarea")).forEach((field) => {
            field.disabled = isReadOnlyCatalogMode;
        });
        updatePreview();
    }

    prevBtn.addEventListener("click", () => {
        showMessage([]);
        state.step -= 1;
        render();
    });

    nextBtn.addEventListener("click", () => {
        const current = getSteps()[state.step];
        const errors = validateStep(current);
        if (errors.length > 0) {
            showMessage(errors, "error");
            return;
        }
        showMessage([]);
        state.step += 1;
        render();
    });

    function numberOrNull(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function buildMuestraRow(payload) {
        const registro = payload.registro;
        const referencia = payload.referenciaBarreno;

        return {
            id_muestra: payload.metadata.idMuestraTomada,
            correo: registro.correo,
            nombre_registro: registro.nombreRegistro,
            institucion: registro.institucion,
            institucion_otra: registro.institucionOtra || null,
            capturista_correo: payload.metadata.capturistaCorreo || registro.correo,
            capturista_nombre: payload.metadata.capturistaNombre || registro.nombreRegistro,
            capturista_institucion: payload.metadata.capturistaInstitucion || null,
            proyecto: registro.proyecto,
            responsable: registro.responsable,
            estado: registro.estado,
            estado_cve: payload.metadata.cveEstado,
            municipio: registro.municipio,
            municipio_cve: payload.metadata.cveMunicipio,
            localidad: registro.localidad || null,
            notas: registro.notas || null,
            fuente: registro.fuente,
            origen_arcilla: registro.origenArcilla || null,
            litologia: registro.litologia,
            color: registro.color,
            textura: registro.textura,
            referencia_barreno_id: referencia?.id || null,
            referencia_intervalo_id: referencia?.intervalo?.id || null,
            salmuera_campo: registro.salmuera_campo || null,
            salmuera_pozo: registro.salmuera_pozo || null,
            salmuera_latitud: numberOrNull(registro.salmuera_latitud),
            salmuera_longitud: numberOrNull(registro.salmuera_longitud),
            salmuera_altitud: numberOrNull(registro.salmuera_altitud),
            salmuera_profundidad: numberOrNull(registro.salmuera_profundidad),
            salmuera_intervalo_inicio: numberOrNull(registro.salmuera_intervalo_inicio),
            salmuera_intervalo_fin: numberOrNull(registro.salmuera_intervalo_fin),
            salmuera_corte_agua: numberOrNull(registro.salmuera_corte_agua),
            salmuera_presion: numberOrNull(registro.salmuera_presion),
            salmuera_temperatura: numberOrNull(registro.salmuera_temperatura),
            salmuera_ph: numberOrNull(registro.salmuera_ph),
            salmuera_conductividad: numberOrNull(registro.salmuera_conductividad),
            salmuera_oxigeno_disuelto: numberOrNull(registro.salmuera_oxigeno_disuelto),
            arcilla_notas: registro.notas || registro.arcilla_notas || null,
            arcilla_procedencia: registro.arcilla_procedencia || null,
            arcilla_latitud: numberOrNull(registro.arcilla_latitud),
            arcilla_longitud: numberOrNull(registro.arcilla_longitud),
            arcilla_altitud: numberOrNull(registro.arcilla_altitud),
            arcilla_desde: numberOrNull(registro.arcilla_desde),
            arcilla_hasta: numberOrNull(registro.arcilla_hasta),
            arcilla_estructuras: registro.arcilla_estructuras || null,
            metadata: payload.metadata,
            registro
        };
    }

    function buildSampleRecord(payload, existingRecord = null) {
        const now = new Date().toISOString();
        const actor = state.currentUser?.name || state.currentUser?.email || payload.registro?.responsable || "Usuario SIIL";
        const sampleId = existingRecord?.id || payload.metadata.idMuestraTomada;

        payload.metadata.idMuestraTomada = sampleId;
        payload.metadata.estadoRegistro = existingRecord?.status || payload.metadata.estadoRegistro || "captura_abierta";
        payload.metadata.fechaActualizacionISO = now;

        return {
            id: sampleId,
            status: payload.metadata.estadoRegistro,
            createdAt: existingRecord?.createdAt || payload.metadata.fechaCapturaISO || now,
            updatedAt: now,
            createdBy: existingRecord?.createdBy || actor,
            updatedBy: actor,
            payload
        };
    }

    async function syncMuestraRecord(record, isCreate) {
        if (!canUseSupabase()) {
            state.persistence = "local";
            return { synced: false };
        }

        const path = isCreate
            ? "muestras"
            : `muestras?id_muestra=eq.${encodeURIComponent(record.id)}`;

        const response = await supabaseRequest(path, {
            method: isCreate ? "POST" : "PATCH",
            headers: { Prefer: isCreate ? "return=representation" : "return=minimal" },
            body: buildMuestraRow(record.payload)
        });

        if (isCreate) {
            const muestraRow = Array.isArray(response) ? response[0] : response;
            if (muestraRow?.id && Array.isArray(record.payload.registro.fotos) && record.payload.registro.fotos.length > 0) {
                await supabaseRequest("muestra_fotos", {
                    method: "POST",
                    headers: { Prefer: "return=minimal" },
                    body: record.payload.registro.fotos.map((nombre) => ({ muestra_id: muestraRow.id, nombre_archivo: nombre }))
                });
            }
        }

        state.persistence = "supabase";
        return { synced: true };
    }

    async function saveMuestra(payload) {
        const existingRecord = state.editingMuestraId
            ? state.muestras.find((item) => item.id === state.editingMuestraId) || null
            : null;
        const record = buildSampleRecord(payload, existingRecord);
        upsertMuestraRecord(record);

        try {
            const result = await syncMuestraRecord(record, !existingRecord);
            return { ...result, record };
        } catch (error) {
            state.persistence = "local";
            return { synced: false, record, error };
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!canCreateSamples() && !state.editingMuestraId) {
            showMessage(["Este perfil solo puede consultar el catalogo de muestras."], "warning");
            return;
        }

        const current = getSteps()[state.step];
        const errors = validateStep(current);
        if (errors.length > 0) {
            showMessage(errors, "error");
            return;
        }

        const payload = buildPayload();
        preview.textContent = JSON.stringify(payload, null, 2);

        const result = await saveMuestra(payload);
        renderMuestrasCatalogList();
        resetSampleDraft();
        render();

        if (result.error) {
            showMessage([
                result.error.message || "No fue posible sincronizar la muestra con Supabase.",
                `ID de la muestra tomada: ${result.record.id}`,
                "El registro quedo en respaldo local y sigue visible en el catalogo operativo."
            ], "warning");
            return;
        }

        showMessage([
            result.synced ? "Registro guardado en Supabase y respaldo local." : "Registro guardado solo en respaldo local.",
            `ID de la muestra tomada: ${result.record.id}`,
            "El flujo de nucleo queda enlazado al catalogo de barrenos."
        ], result.synced ? "success" : "warning");
    });
    barrenoEstadoSelect.addEventListener("change", async (event) => {
        const estadoNombre = event.target.value;
        barrenoMunicipioSelect.innerHTML = '<option value="">Cargando municipios...</option>';
        if (!estadoNombre) {
            barrenoMunicipioSelect.innerHTML = '<option value="">Seleccione primero un estado...</option>';
            updateBarrenoIdPreview();
            return;
        }
        await loadMunicipiosForEstado(estadoNombre);
        const municipios = getMunicipioOptionsForBarreno(estadoNombre);
        barrenoMunicipioSelect.innerHTML = '<option value="">Seleccione...</option>';
        municipios.forEach((nombre) => {
            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            barrenoMunicipioSelect.appendChild(option);
        });
        updateBarrenoIdPreview();
    });

    barrenoMunicipioSelect.addEventListener("change", () => {
        updateBarrenoIdPreview();
    });

    barrenoProyectoInput.addEventListener("input", () => {
        updateBarrenoIdPreview();
    });


    if (barrenoLongitudInput) {
        barrenoLongitudInput.addEventListener("input", () => {
            updateBarrenoTcrPreview();
        });
    }

    if (barrenoLongitudRecuperadaInput) {
        barrenoLongitudRecuperadaInput.addEventListener("input", () => {
            updateBarrenoTcrPreview();
        });
    }

    function getMunicipioOptionsForBarreno(estadoNombre) {
        const estado = getEstadoByName(estadoNombre);
        if (!estado) return [];
        const municipios = geoCatalog.municipiosByEstado[estado.cve] || [];
        return municipios.map((municipio) => municipio.nombre);
    }

    function renumberIntervalRows() {
        const rows = Array.from(barrenoIntervalRows.children);
        rows.forEach((row, index) => {
            const label = row.querySelector("[data-interval-label]");
            const desdeInput = row.querySelector('[data-interval-field="desde"]');
            const hastaInput = row.querySelector('[data-interval-field="hasta"]');
            const deleteButton = row.querySelector(".delete-interval-row");
            if (label) {
                label.textContent = `INT-${String(index + 1).padStart(2, "0")}`;
            }
            if (desdeInput) {
                if (index === 0) {
                    desdeInput.value = "0";
                } else {
                    const prevRow = rows[index - 1];
                    const prevHastaInput = prevRow?.querySelector('[data-interval-field="hasta"]');
                    const prevHasta = Number(prevHastaInput?.value);
                    desdeInput.value = Number.isFinite(prevHasta) ? String(prevHasta) : "";
                }
                desdeInput.readOnly = true;
                desdeInput.classList.add("bg-slate-50");
            }
            if (hastaInput) {
                hastaInput.oninput = () => {
                    renumberIntervalRows();
                };
            }
            if (deleteButton) {
                if (index === 0) {
                    deleteButton.classList.add("hidden");
                } else {
                    deleteButton.classList.remove("hidden");
                }
            }
        });
    }

    function createIntervalRow(intervalo = { desde: "", hasta: "" }) {
        const row = document.createElement("div");
        row.className = "grid grid-cols-12 items-center gap-2";
        row.innerHTML = `
            <div class="col-span-4 md:col-span-4">
                <div data-interval-label class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">INT-01</div>
            </div>
            <div class="col-span-3 md:col-span-3">
                <input type="number" step="any" data-interval-field="desde" class="w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary" placeholder="0" value="${intervalo.desde}">
            </div>
            <div class="col-span-3 md:col-span-3">
                <input type="number" step="any" data-interval-field="hasta" class="w-full rounded-lg border-slate-300 text-sm focus:border-primary focus:ring-primary" placeholder="2.5" value="${intervalo.hasta}">
            </div>
            <div class="col-span-2 md:col-span-2 flex justify-end">
                <button type="button" class="delete-interval-row inline-flex items-center justify-center rounded-lg bg-red-50 px-2.5 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100">Quitar</button>
            </div>
        `;

        row.querySelector(".delete-interval-row").addEventListener("click", () => {
            row.remove();
            ensureAtLeastOneIntervalRow();
            renumberIntervalRows();
        });

        return row;
    }

    function addIntervalRow(intervalo) {
        barrenoIntervalRows.appendChild(createIntervalRow(intervalo));
        renumberIntervalRows();
    }

    function ensureAtLeastOneIntervalRow() {
        if (barrenoIntervalRows.children.length === 0) {
            addIntervalRow();
        }
    }

    function readIntervalRows() {
        const rows = Array.from(barrenoIntervalRows.children);
        return rows.map((row, index) => ({
            id: `INT-${String(index + 1).padStart(2, "0")}`,
            desde: Number(row.querySelector('[data-interval-field="desde"]').value),
            hasta: Number(row.querySelector('[data-interval-field="hasta"]').value)
        }));
    }

    function isSameDepth(a, b, tolerance = 0.000001) {
        return Math.abs(a - b) <= tolerance;
    }

    function hasLetters(value) {
        return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(String(value || ""));
    }

    function numberInputValue(id) {
        return Number(document.getElementById(id)?.value);
    }

    function textInputValue(id) {
        return String(document.getElementById(id)?.value || "").trim();
    }

    function fileNameValue(id) {
        return document.getElementById(id)?.files?.[0]?.name || "";
    }

    function buildBarrenoRow(record) {
        const estadoRow = getEstadoByName(record.estado);
        const municipioRow = getMunicipioByName(record.estado, record.municipio);

        return {
            id: record.id,
            proyecto: record.proyecto,
            subregion_sigla: record.subregionSigla,
            perforista: record.perforista,
            responsable: record.responsable,
            responsable_descripcion: record.responsableDescripcion || null,
            estado: record.estado,
            estado_cve: estadoRow?.cve || null,
            municipio: record.municipio,
            municipio_cve: municipioRow?.cve || null,
            localidad: record.localidad || null,
            descripcion_local: record.descripcionLocal || null,
            litologia_local: record.litologiaLocal || null,
            estructura_aledana: record.estructuraAledana || null,
            anomalia_gravimetrica: numberOrNull(record.anomaliaGravimetrica),
            anomalia_1: record.anomalia1 || null,
            anomalia_2: record.anomalia2 || null,
            anomalia_3: record.anomalia3 || null,
            accesibilidad: record.accesibilidad || null,
            tipo_terreno: record.tipoTerreno || null,
            latitud: numberOrNull(record.latitud),
            longitud: numberOrNull(record.longitud),
            altitud: numberOrNull(record.altitud),
            azimut: Number.isFinite(record.azimut) ? Math.trunc(record.azimut) : null,
            inclinacion: Number.isFinite(record.inclinacion) ? Math.trunc(record.inclinacion) : null,
            tipo_barrenacion: record.tipoBarrenacion,
            fecha_inicio: record.fechaInicio || null,
            fecha_fin: record.fechaFin || null,
            longitud_perforada: numberOrNull(record.longitudPerforada),
            longitud_recuperada: numberOrNull(record.longitudRecuperada),
            diametro_mm: Number.isFinite(record.diametroMm) ? Math.trunc(record.diametroMm) : null,
            numero_cajas: Number.isFinite(record.numeroCajas) ? Math.trunc(record.numeroCajas) : null,
            nombre_cajas: record.nombreCajas || null,
            rqd: record.rqd || null,
            tcr: numberOrNull(record.tcr),
            intervalos_interes: record.intervalosInteres || null,
            archivo_descripcion_nucleo: record.archivoDescripcion || null,
            observaciones: record.observaciones || null
        };
    }

    function formatModalMessage(items) {
        return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
    }

    function getBarrenoTcrWarning(record) {
        if (!Number.isFinite(record.tcr)) {
            return "No fue posible calcular TCR; revise longitudes perforada y recuperada.";
        }
        const litologia = normalizeToken(record.litologiaLocal);
        if (litologia.includes("GRANITO") || litologia.includes("RIOLITA")) {
            return record.tcr < 0.9 ? "TCR menor a 0.90 para roca ignea masiva; el cuestionario sugiere revisar causa de baja recuperacion." : "";
        }
        if (litologia.includes("TOBA") || litologia.includes("FRACTUR")) {
            return record.tcr < 0.75 ? "TCR menor a 0.75 para roca volcanica fracturada/toba; revise causa de baja recuperacion." : "";
        }
        if (litologia.includes("ARCILLA") || litologia.includes("LIMO") || litologia.includes("CONGLOMER")) {
            return record.tcr < 0.85 ? "TCR menor a 0.85 para arcillas, limos o conglomerados; revise causa de baja recuperacion." : "";
        }
        return record.tcr < 0.85 ? "TCR menor a 0.85; revise causa de baja recuperacion." : "";
    }

    function validateBarrenoRecord(record) {
        const errors = [];
        const warnings = [];
        const today = new Date().toISOString().slice(0, 10);
        if (!record.id) errors.push("Barreno (ID) es obligatorio.");
        if (!record.proyecto) errors.push("Proyecto es obligatorio.");
        if (!record.subregionSigla) errors.push("Sigla subregion es obligatoria.");
        if (!record.perforista) errors.push("Perforista es obligatorio.");
        if (!record.responsable) errors.push("Responsable es obligatorio.");
        if (!record.estado) errors.push("Estado es obligatorio.");
        if (!record.municipio) errors.push("Municipio es obligatorio.");
        if (!Number.isFinite(record.latitud) || record.latitud < 14 || record.latitud > 33) errors.push("Latitud debe estar entre 14.0 y 33.0.");
        if (!Number.isFinite(record.longitud) || record.longitud < -118.5 || record.longitud > -86.0) errors.push("Longitud debe estar entre -118.5 y -86.0.");
        if (!Number.isFinite(record.altitud) || record.altitud <= 0) errors.push("Altitud debe ser mayor a 0.");
        if (!Number.isFinite(record.azimut) || record.azimut < 0 || record.azimut > 360) errors.push("Azimut debe estar entre 0 y 360.");
        if (!Number.isFinite(record.inclinacion) || record.inclinacion < -90 || record.inclinacion > 0) errors.push("Inclinacion debe estar entre -90 y 0.");
        if (!record.tipoBarrenacion) errors.push("Tipo de barrenacion es obligatorio.");
        if (!record.fechaInicio) errors.push("Fecha de inicio es obligatoria.");
        if (!record.fechaFin) errors.push("Fecha de finalizacion es obligatoria.");
        if (record.fechaInicio && record.fechaInicio > today) errors.push("Fecha de inicio debe ser menor o igual a la fecha de registro.");
        if (record.fechaInicio && record.fechaFin && record.fechaFin < record.fechaInicio) errors.push("Fecha de finalizacion debe ser mayor o igual a la fecha de inicio.");
        if (!Number.isFinite(record.longitudPerforada) || record.longitudPerforada <= 0) errors.push("Longitud perforada debe ser mayor a 0.");
        if (!Number.isFinite(record.longitudRecuperada) || record.longitudRecuperada <= 0) errors.push("Longitud recuperada debe ser mayor a 0.");
        if (Number.isFinite(record.longitudPerforada) && Number.isFinite(record.longitudRecuperada) && record.longitudRecuperada > record.longitudPerforada) errors.push("Longitud recuperada no puede ser mayor que la longitud perforada.");
        if (!Number.isFinite(record.diametroMm) || record.diametroMm <= 0) errors.push("Diametro debe ser mayor a 0.");
        if (!Number.isFinite(record.numeroCajas) || record.numeroCajas <= 0) errors.push("Numero de cajas debe ser mayor a 0.");
        if (!record.nombreCajas) errors.push("Nombre de cajas es obligatorio.");
        if (record.intervalos.length === 0) errors.push("Debe capturar al menos un intervalo.");

        record.intervalos.forEach((intervalo, index) => {
            if (!Number.isFinite(intervalo.desde) || !Number.isFinite(intervalo.hasta)) {
                errors.push(`Intervalo ${index + 1}: Desde/Hasta invalidos.`);
            } else if (intervalo.hasta <= intervalo.desde) {
                errors.push(`Intervalo ${index + 1}: Hasta debe ser mayor que Desde.`);
            }
        });

        if (record.intervalos.length > 0) {
            const primer = record.intervalos[0];
            if (Number.isFinite(primer.desde) && !isSameDepth(primer.desde, 0)) {
                errors.push("El primer intervalo debe iniciar en 0 m.");
            }
            for (let i = 1; i < record.intervalos.length; i += 1) {
                const anterior = record.intervalos[i - 1];
                const actual = record.intervalos[i];
                if (Number.isFinite(anterior.hasta) && Number.isFinite(actual.desde) && !isSameDepth(anterior.hasta, actual.desde)) {
                    errors.push(`Intervalo ${i + 1}: debe iniciar exactamente en ${anterior.hasta} m para mantener continuidad.`);
                }
            }
            const ultimo = record.intervalos[record.intervalos.length - 1];
            if (Number.isFinite(ultimo.hasta) && Number.isFinite(record.longitudPerforada) && !isSameDepth(ultimo.hasta, record.longitudPerforada)) {
                errors.push(`El ultimo intervalo debe terminar en la longitud perforada (${record.longitudPerforada} m).`);
            }
        }

        if (state.barrenos.some((barreno) => barreno.id === record.id)) {
            errors.push("El Barreno (ID) ya existe en catalogo.");
        }

        if (!record.localidad) warnings.push("Localidad no esta capturada.");
        if (!record.descripcionLocal) warnings.push("Descripcion local no esta capturada.");
        if (!record.litologiaLocal) warnings.push("Litologia local no esta capturada.");
        if (!record.estructuraAledana) warnings.push("Estructura aledana no esta capturada.");
        if (!record.accesibilidad) warnings.push("Accesibilidad no esta capturada.");
        if (!record.tipoTerreno) warnings.push("Tipo de terreno no esta capturado.");
        if (!record.responsableDescripcion) warnings.push("Responsable de descripcion geologica no esta capturado.");
        if (!record.rqd) warnings.push("RQD no esta capturado.");
        if (!record.intervalosInteres) warnings.push("Intervalos de interes no estan capturados.");
        if (!record.archivoDescripcion) warnings.push("Archivo de descripcion del nucleo no esta cargado.");
        if (!record.observaciones) warnings.push("Observaciones no estan capturadas.");
        if (!record.anomalia1 && !record.anomalia2 && !record.anomalia3) warnings.push("No se capturo ninguna anomalia prospectiva para el barreno.");
        const tcrWarning = getBarrenoTcrWarning(record);
        if (tcrWarning) warnings.push(tcrWarning);

        return { errors, warnings };
    }

    async function showBarrenoValidationAlert(title, items, type = "warning") {
        const message = formatModalMessage(items);
        if (window.Modal?.alert) {
            await window.Modal.alert({ title, message, type, buttonText: "Entendido" });
            return;
        }
        showBarrenoMessage(items, type);
    }

    async function confirmBarrenoWarnings(items) {
        const message = formatModalMessage(items);
        if (window.Modal?.confirm) {
            return window.Modal.confirm({
                title: "Revise estas advertencias",
                subtitle: "El registro puede continuar, pero requiere confirmacion.",
                message,
                type: "warning",
                confirmText: "Continuar",
                cancelText: "Revisar formulario"
            });
        }
        showBarrenoMessage(items, "warning");
        return false;
    }

    async function saveBarreno(record) {
        state.barrenos.push(record);
        state.selectedBarrenoId = record.id;
        persistLocalBarrenosCatalog();

        if (!canUseSupabase()) {
            state.persistence = "local";
            return { synced: false };
        }

        await supabaseRequest("barrenos", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: buildBarrenoRow(record)
        });

        await supabaseRequest("barreno_intervalos", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: record.intervalos.map((intervalo, index) => ({
                barreno_id: record.id,
                intervalo_id: intervalo.id,
                orden: index + 1,
                desde: intervalo.desde,
                hasta: intervalo.hasta
            }))
        });

        state.persistence = "supabase";
        return { synced: true };
    }

    barrenoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showBarrenoMessage([]);

        const record = {
            id: textInputValue("barrenoId"),
            proyecto: textInputValue("barrenoProyecto"),
            subregionSigla: textInputValue("barrenoSubregion"),
            perforista: textInputValue("barrenoPerforista"),
            responsable: textInputValue("barrenoResponsable"),
            responsableDescripcion: textInputValue("barrenoResponsableDescripcion"),
            estado: barrenoEstadoSelect.value,
            municipio: barrenoMunicipioSelect.value,
            localidad: textInputValue("barrenoLocalidad"),
            descripcionLocal: textInputValue("barrenoDescripcionLocal"),
            litologiaLocal: textInputValue("barrenoLitologiaLocal"),
            estructuraAledana: textInputValue("barrenoEstructuraAledana"),
            anomaliaGravimetrica: numberInputValue("barrenoAnomaliaGravimetrica"),
            anomalia1: textInputValue("barrenoAnomalia1"),
            anomalia2: textInputValue("barrenoAnomalia2"),
            anomalia3: textInputValue("barrenoAnomalia3"),
            accesibilidad: textInputValue("barrenoAccesibilidad"),
            tipoTerreno: textInputValue("barrenoTipoTerreno"),
            latitud: numberInputValue("barrenoLatitud"),
            longitud: numberInputValue("barrenoLongitudCoord"),
            altitud: numberInputValue("barrenoAltitud"),
            azimut: numberInputValue("barrenoAzimut"),
            inclinacion: numberInputValue("barrenoInclinacion"),
            tipoBarrenacion: textInputValue("barrenoTipo"),
            fechaInicio: textInputValue("barrenoFechaInicio"),
            fechaFin: textInputValue("barrenoFechaFin"),
            longitudPerforada: numberInputValue("barrenoLongitud"),
            longitudRecuperada: numberInputValue("barrenoLongitudRecuperada"),
            diametroMm: numberInputValue("barrenoDiametro"),
            numeroCajas: numberInputValue("barrenoNumeroCajas"),
            nombreCajas: textInputValue("barrenoNombreCajas"),
            rqd: textInputValue("barrenoRQD"),
            tcr: numberOrNull(textInputValue("barrenoTcr")),
            intervalosInteres: textInputValue("barrenoIntervalosInteres"),
            archivoDescripcion: fileNameValue("barrenoArchivoDescripcion"),
            observaciones: textInputValue("barrenoObservaciones"),
            intervalos: readIntervalRows()
        };

        const { errors, warnings } = validateBarrenoRecord(record);
        if (errors.length > 0) {
            await showBarrenoValidationAlert("Corrija el registro de barreno", errors, "danger");
            return;
        }

        if (warnings.length > 0) {
            const shouldContinue = await confirmBarrenoWarnings(warnings);
            if (!shouldContinue) {
                return;
            }
        }

        try {
            const result = await saveBarreno(record);
            renderBarrenosCatalogList();
            setBarrenoView("catalog");
            barrenoForm.reset();
            barrenoIntervalRows.innerHTML = "";
            ensureAtLeastOneIntervalRow();
            barrenoMunicipioSelect.innerHTML = '<option value="">Seleccione primero un estado...</option>';
            updateBarrenoIdPreview();
            updateBarrenoTcrPreview();
            showBarrenoMessage([
                result.synced ? "Barreno guardado en Supabase y respaldo local." : "Barreno guardado solo en respaldo local.",
                `ID del barreno: ${record.id}`
            ], result.synced ? "success" : "warning");
        } catch (error) {
            state.persistence = "local";
            renderBarrenosCatalogList();
            await showBarrenoValidationAlert("No fue posible sincronizar el barreno", [error.message || "El barreno quedo en respaldo local."], "warning");
        }
    });

    addIntervalRowBtn.addEventListener("click", () => {
        addIntervalRow();
    });


    if (openBarrenoBtn) {
        openBarrenoBtn.addEventListener("click", () => {
            showBarrenoWizardView("form");
        });
    }

    if (backToCardsBtn) {
        backToCardsBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    if (backToCardsFromBarrenoBtn) {
        backToCardsFromBarrenoBtn.addEventListener("click", () => {
            showMuestraWizardView();
            render();
        });
    }

    if (showBarrenoFormBtn) {
        showBarrenoFormBtn.addEventListener("click", () => {
            setBarrenoView("form");
        });
    }

    if (showBarrenoCatalogBtn) {
        showBarrenoCatalogBtn.addEventListener("click", () => {
            setBarrenoView("catalog");
        });
    }

    async function bootstrap() {
        const requestedView = new URLSearchParams(window.location.search).get("view");
        state.requestedView = requestedView === "barrenos-catalogo" ? "barrenos-catalogo" : requestedView === "barrenos" ? "barrenos" : "muestras";
        state.barrenoView = state.requestedView === "barrenos-catalogo" ? "catalog" : "form";
        state.currentUser = window.AuthService?.getCurrentUser?.() || null;
        state.data = getDefaultSampleData();
        fillProfileSummary();
        loadMuestrasCatalog();
        await loadBarrenosCatalog();
        await loadEstados();
        ensureAtLeastOneIntervalRow();
        updateBarrenoIdPreview();
        updateBarrenoTcrPreview();
        renderBarrenosCatalogList();
        renderMuestrasCatalogList();

        if (requestedView === "barrenos" || requestedView === "barrenos-catalogo") {
            showBarrenoWizardView(state.barrenoView);
            return;
        }

        showMuestraWizardView();
        render();
    }

    bootstrap();
})();
















































































