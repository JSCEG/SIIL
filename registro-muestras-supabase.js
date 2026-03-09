(function () {
    const STORAGE_BARRENOS = "siil_catalogo_barrenos_v1";
    const STORAGE_MUESTRAS = "siil_catalogo_muestras_v1";

    const cardsHome = document.getElementById("cardsHome");
    const muestraWizard = document.getElementById("muestraWizard");
    const barrenoWizard = document.getElementById("barrenoWizard");
    const openMuestraBtn = document.getElementById("openMuestraBtn");
    const openBarrenoBtn = document.getElementById("openBarrenoBtn");
    const backToCardsBtn = document.getElementById("backToCardsBtn");
    const backToCardsFromBarrenoBtn = document.getElementById("backToCardsFromBarrenoBtn");

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
    const barrenoIdInput = document.getElementById("barrenoId");
    const barrenoProyectoInput = document.getElementById("barrenoProyecto");
    const barrenoEstadoSelect = document.getElementById("barrenoEstado");
    const barrenoMunicipioSelect = document.getElementById("barrenoMunicipio");
    const barrenoIntervalRows = document.getElementById("barrenoIntervalRows");
    const addIntervalRowBtn = document.getElementById("addIntervalRowBtn");

    const INEGI_ENDPOINTS = {
        estados: "https://gaia.inegi.org.mx/wscatgeo/mgee/",
        municipiosByEstado: (cveAgee) => `https://gaia.inegi.org.mx/wscatgeo/mgem/${cveAgee}`
    };

    const INSTITUCIONES = ["LitioMx", "UNISON", "SGM", "SEFMP.31", "Otra"];
    const LITOLOGIAS = ["Arcilla lacustre", "Sedimentaria", "Ignea", "Metamorfica", "Otra"];

    const geoCatalog = {
        estados: [],
        estadosLoaded: false,
        municipiosByEstado: {},
        municipiosLoading: false
    };

    const state = {
        step: 0,
        barrenos: [],
        persistence: "local",
        data: {
            correo: "",
            nombreRegistro: "",
            institucion: "",
            institucionOtra: "",
            proyecto: "",
            responsable: "",
            estado: "",
            municipio: "",
            fuente: "",
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
            arcilla_notas: "",
            arcilla_procedencia: "",
            arcilla_latitud: "",
            arcilla_longitud: "",
            arcilla_altitud: "",
            arcilla_barreno_id: "",
            arcilla_intervalo_id: "",
            arcilla_desde: "",
            arcilla_hasta: "",
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
            return;
        }

        try {
            const rows = await supabaseRequest("barrenos?select=id,proyecto,responsable,estado,estado_cve,municipio,municipio_cve,longitud_perforada,barreno_intervalos(intervalo_id,desde,hasta,orden)&order=created_at.desc");
            state.barrenos = Array.isArray(rows)
                ? rows.map((row) => ({
                    id: row.id,
                    proyecto: row.proyecto,
                    responsable: row.responsable,
                    estado: row.estado,
                    municipio: row.municipio,
                    longitudPerforada: Number(row.longitud_perforada),
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
        } catch {
            loadLocalBarrenosCatalog();
        }
    }

    function persistLocalMuestra(payload) {
        try {
            const raw = localStorage.getItem(STORAGE_MUESTRAS);
            const parsed = raw ? JSON.parse(raw) : [];
            const samples = Array.isArray(parsed) ? parsed : [];
            samples.push(payload);
            localStorage.setItem(STORAGE_MUESTRAS, JSON.stringify(samples));
        } catch {
            localStorage.setItem(STORAGE_MUESTRAS, JSON.stringify([payload]));
        }
    }

    function renderBarrenosCatalogList() {
        barrenosList.innerHTML = "";
        if (state.barrenos.length === 0) {
            barrenosList.innerHTML = '<li class="rounded-lg border border-dashed border-slate-300 p-4 text-slate-500">No hay barrenos registrados aun.</li>';
            return;
        }

        state.barrenos.forEach((barreno) => {
            const li = document.createElement("li");
            li.className = "rounded-lg border border-slate-200 bg-slate-50 p-3";
            li.textContent = `${barreno.id} · ${barreno.estado}/${barreno.municipio} · Intervalos: ${barreno.intervalos.length}`;
            barrenosList.appendChild(li);
        });
    }

    function showCardsView() {
        cardsHome.classList.remove("hidden");
        muestraWizard.classList.add("hidden");
        barrenoWizard.classList.add("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showMuestraWizardView() {
        cardsHome.classList.add("hidden");
        muestraWizard.classList.remove("hidden");
        barrenoWizard.classList.add("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function showBarrenoWizardView() {
        cardsHome.classList.add("hidden");
        muestraWizard.classList.add("hidden");
        barrenoWizard.classList.remove("hidden");
        renderBarrenosCatalogList();
        hydrateBarrenoGeoSelects();
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
                    { key: "correo", label: "Correo electronico", type: "email", required: true },
                    { key: "nombreRegistro", label: "Nombre", type: "text", required: true },
                    { key: "institucion", label: "Institucion", type: "select", required: true, options: INSTITUCIONES },
                    { key: "institucionOtra", label: "Otra institucion", type: "text", required: true, showIf: (data) => data.institucion === "Otra" },
                    { key: "proyecto", label: "Proyecto", type: "text", required: true },
                    { key: "responsable", label: "Responsable", type: "text", required: true },
                    { key: "estado", label: "Estado", type: "select", required: true },
                    { key: "municipio", label: "Municipio", type: "select", required: true }
                ]
            },
            {
                key: "fuente",
                title: "Fuente",
                subtitle: "Seleccione la rama de captura segun el tipo de muestra.",
                fields: [{ key: "fuente", label: "Fuente", type: "radio", required: true, options: ["Arcillas", "Salmueras"] }]
            }
        ];

        if (state.data.fuente === "Salmueras") {
            steps.push({
                key: "salmueras",
                title: "Salmueras",
                subtitle: "Datos del campo y pozo petrolero.",
                fields: [
                    { key: "salmuera_campo", label: "Campo", type: "text", required: true },
                    { key: "salmuera_pozo", label: "Pozo", type: "text", required: true },
                    { key: "salmuera_latitud", label: "Latitud", type: "number", step: "any", required: true },
                    { key: "salmuera_longitud", label: "Longitud", type: "number", step: "any", required: true },
                    { key: "salmuera_altitud", label: "Altitud (msnm)", type: "number", step: "any", required: true },
                    { key: "salmuera_profundidad", label: "Profundidad (m)", type: "number", step: "any", required: true },
                    { key: "salmuera_intervalo_inicio", label: "Intervalo de produccion - inicio", type: "number", step: "any", required: true },
                    { key: "salmuera_intervalo_fin", label: "Intervalo de produccion - fin", type: "number", step: "any", required: true },
                    { key: "salmuera_corte_agua", label: "Corte de agua (%)", type: "number", step: "any", required: true },
                    { key: "salmuera_presion", label: "Presion (Pa)", type: "number", step: "any", required: true },
                    { key: "salmuera_temperatura", label: "Temperatura", type: "number", step: "any", required: true },
                    { key: "salmuera_ph", label: "pH", type: "number", step: "any", required: true }
                ]
            });
        }

        if (state.data.fuente === "Arcillas") {
            steps.push({
                key: "arcillas_origen",
                title: "Arcillas - Origen",
                subtitle: "Seleccione el tipo de toma de muestra.",
                fields: [{ key: "origenArcilla", label: "Origen de la muestra", type: "radio", required: true, options: ["Superficie", "Profundidad (Nucleo)"] }]
            });

            if (state.data.origenArcilla === "Superficie") {
                steps.push({
                    key: "arcillas_superficie",
                    title: "Arcillas - Superficie",
                    subtitle: "Datos de procedencia y georreferenciacion.",
                    fields: [
                        { key: "arcilla_notas", label: "Notas", type: "textarea", required: true },
                        { key: "arcilla_procedencia", label: "Procedencia", type: "text", required: true },
                        { key: "arcilla_latitud", label: "Latitud", type: "number", step: "any", required: true },
                        { key: "arcilla_longitud", label: "Longitud", type: "number", step: "any", required: true },
                        { key: "arcilla_altitud", label: "Altitud (msnm)", type: "number", step: "any", required: true }
                    ]
                });
            }

            if (state.data.origenArcilla === "Profundidad (Nucleo)") {
                steps.push({
                    key: "arcillas_profundidad",
                    title: "Arcillas - Nucleo",
                    subtitle: "Seleccione barreno e intervalo desde catalogo.",
                    fields: [
                        { key: "arcilla_barreno_id", label: "Barreno (ID)", type: "select", required: true },
                        { key: "arcilla_intervalo_id", label: "Intervalo (ID)", type: "select", required: true },
                        { key: "arcilla_desde", label: "Desde (m)", type: "number", step: "any", required: true },
                        { key: "arcilla_hasta", label: "Hasta (m)", type: "number", step: "any", required: true },
                        { key: "arcilla_altitud", label: "Altitud (msnm)", type: "number", step: "any", required: true }
                    ]
                });
            }
        }

        steps.push({
            key: "descripcion",
            title: "Descripcion tecnica y fotografias",
            subtitle: "Cierre del registro con caracterizacion y evidencia visual.",
            fields: [
                { key: "litologia", label: "Litologia", type: "select", required: true, options: LITOLOGIAS },
                { key: "color", label: "Color", type: "text", required: true },
                { key: "textura", label: "Textura", type: "text", required: true },
                { key: "fotos", label: "Fotografias de la muestra", type: "file", required: true, multiple: true }
            ]
        });

        return steps;
    }

    function sanitizeStep() {
        const maxIndex = getSteps().length - 1;
        if (state.step > maxIndex) state.step = maxIndex;
        if (state.step < 0) state.step = 0;
    }

    function renderIndicators(steps) {
        stepIndicator.innerHTML = "";
        steps.forEach((step, index) => {
            const active = index === state.step;
            const done = index < state.step;
            const el = document.createElement("span");
            el.className = `rounded-full border px-2.5 py-1 font-semibold ${active ? "border-primary bg-primary text-white" : done ? "border-primary/30 bg-primary/10 text-primary" : "border-slate-200 bg-slate-50 text-slate-500"}`;
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
        if (field.showIf && !field.showIf(state.data)) return null;

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
                    }
                    if (field.key === "origenArcilla") {
                        state.data.arcilla_barreno_id = "";
                        state.data.arcilla_intervalo_id = "";
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
            input.addEventListener("input", (event) => {
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
            input.addEventListener("change", async (event) => {
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
        input.addEventListener("input", (event) => {
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
                if (value.length === 0) errors.push(`El campo \"${field.label}\" es obligatorio.`);
                return;
            }
            if (String(value || "").trim() === "") errors.push(`El campo \"${field.label}\" es obligatorio.`);
        });

        if (step.key === "salmueras") {
            const start = Number(state.data.salmuera_intervalo_inicio);
            const end = Number(state.data.salmuera_intervalo_fin);
            if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
                errors.push("El intervalo de produccion fin no puede ser menor que inicio.");
            }
        }

        if (step.key === "arcillas_profundidad") {
            if (state.barrenos.length === 0) {
                errors.push("No hay barrenos en catalogo. Registre un barreno primero.");
            }
            const desde = Number(state.data.arcilla_desde);
            const hasta = Number(state.data.arcilla_hasta);
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
        const normalized = normalizeToken(projectName);
        if (!normalized) return "PRJ";
        const words = normalized.split(" ").filter(Boolean);
        if (words.length >= 2) {
            return words.slice(0, 4).map((word) => word[0]).join("").slice(0, 4);
        }
        return words[0].slice(0, 4) || "PRJ";
    }

    function buildGeoSigla(estadoNombre, municipioNombre) {
        const estado = normalizeToken(estadoNombre).replace(/\s+/g, "").slice(0, 3);
        const municipio = normalizeToken(municipioNombre).replace(/\s+/g, "").slice(0, 3);
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
        const geoSigla = buildGeoSigla(barrenoEstadoSelect.value, barrenoMunicipioSelect.value);

        if (!barrenoProyectoInput.value.trim() || !barrenoEstadoSelect.value || !barrenoMunicipioSelect.value) {
            barrenoIdInput.value = "";
            return;
        }

        const prefix = `${projectSigla}-${geoSigla}-BRN`;
        const consecutivo = nextBarrenoConsecutivo(prefix);
        barrenoIdInput.value = `${prefix}-${consecutivo}`;
    }

    function buildPayload() {
        const now = new Date();
        const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
        const randomTag = Math.floor(1000 + Math.random() * 9000);
        const estado = getEstadoByName(state.data.estado);
        const municipio = getMunicipioByName(state.data.estado, state.data.municipio);
        const estadoCve = estado?.cve || "00";
        const municipioCve = municipio?.cve || "000";
        const idMuestra = `SIIL-MUE-${estadoCve}${municipioCve}-${dateTag}-${randomTag}`;
        const barreno = getSelectedBarreno();
        const intervalo = getIntervaloById(barreno, state.data.arcilla_intervalo_id);

        return {
            metadata: {
                formulario: "Registro de Muestras V2",
                fechaCapturaISO: now.toISOString(),
                idMuestraTomada: idMuestra,
                cveEstado: estadoCve,
                cveMunicipio: municipioCve,
                persistencia: state.persistence
            },
            referenciaBarreno: barreno ? { id: barreno.id, intervalo: intervalo || null } : null,
            registro: { ...state.data }
        };
    }

    function updatePreview() {
        preview.textContent = JSON.stringify(buildPayload(), null, 2);
    }

    function renderNucleoWarningIfNeeded(currentStep) {
        if (currentStep.key !== "arcillas_profundidad" || state.barrenos.length > 0) return;
        const warning = document.createElement("div");
        warning.className = "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2";
        warning.innerHTML = "<div class='mb-2 font-semibold'>No hay barrenos disponibles.</div><div class='mb-2'>Para registrar una muestra de nucleo primero debe crear al menos un barreno.</div>";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#7f1c3a]";
        button.textContent = "Ir a Registro de Barreno";
        button.addEventListener("click", () => showBarrenoWizardView());
        warning.appendChild(button);
        fieldsContainer.prepend(warning);
    }

    function render() {
        const steps = getSteps();
        sanitizeStep();
        const current = steps[state.step];

        stepTitle.textContent = current.title;
        stepSubtitle.textContent = current.subtitle || "";

        fieldsContainer.innerHTML = "";
        visibleFields(current).forEach((field) => {
            const rendered = renderField(field);
            if (rendered) fieldsContainer.appendChild(rendered);
        });
        renderNucleoWarningIfNeeded(current);

        renderIndicators(steps);
        prevBtn.disabled = state.step === 0;
        const isLast = state.step === steps.length - 1;
        nextBtn.classList.toggle("hidden", isLast);
        submitBtn.classList.toggle("hidden", !isLast);
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
            proyecto: registro.proyecto,
            responsable: registro.responsable,
            estado: registro.estado,
            estado_cve: payload.metadata.cveEstado,
            municipio: registro.municipio,
            municipio_cve: payload.metadata.cveMunicipio,
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
            arcilla_notas: registro.arcilla_notas || null,
            arcilla_procedencia: registro.arcilla_procedencia || null,
            arcilla_latitud: numberOrNull(registro.arcilla_latitud),
            arcilla_longitud: numberOrNull(registro.arcilla_longitud),
            arcilla_altitud: numberOrNull(registro.arcilla_altitud),
            arcilla_desde: numberOrNull(registro.arcilla_desde),
            arcilla_hasta: numberOrNull(registro.arcilla_hasta),
            metadata: payload.metadata,
            registro
        };
    }

    async function saveMuestra(payload) {
        persistLocalMuestra(payload);

        if (!canUseSupabase()) {
            state.persistence = "local";
            return { mode: "local", synced: false };
        }

        const inserted = await supabaseRequest("muestras", {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: buildMuestraRow(payload)
        });

        const muestraRow = Array.isArray(inserted) ? inserted[0] : inserted;
        if (muestraRow?.id && Array.isArray(payload.registro.fotos) && payload.registro.fotos.length > 0) {
            await supabaseRequest("muestra_fotos", {
                method: "POST",
                headers: { Prefer: "return=minimal" },
                body: payload.registro.fotos.map((nombre) => ({ muestra_id: muestraRow.id, nombre_archivo: nombre }))
            });
        }

        state.persistence = "supabase";
        return { mode: "supabase", synced: true };
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const current = getSteps()[state.step];
        const errors = validateStep(current);
        if (errors.length > 0) {
            showMessage(errors, "error");
            return;
        }

        const payload = buildPayload();
        preview.textContent = JSON.stringify(payload, null, 2);

        try {
            const result = await saveMuestra(payload);
            showMessage([
                result.synced ? "Registro guardado en Supabase y respaldo local." : "Registro guardado solo en respaldo local.",
                `ID de la muestra tomada: ${payload.metadata.idMuestraTomada}`,
                "El flujo de nucleo queda enlazado al catalogo de barrenos."
            ], result.synced ? "success" : "warning");
        } catch (error) {
            state.persistence = "local";
            showMessage([
                error.message || "No fue posible sincronizar la muestra con Supabase.",
                "El registro quedo en respaldo local y el payload permanece visible para validacion tecnica."
            ], "warning");
        }
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

    function buildBarrenoRow({ barrenoId, proyecto, responsable, estado, municipio, longitud }) {
        const estadoRow = getEstadoByName(estado);
        const municipioRow = getMunicipioByName(estado, municipio);

        return {
            id: barrenoId,
            proyecto,
            responsable,
            estado,
            estado_cve: estadoRow?.cve || null,
            municipio,
            municipio_cve: municipioRow?.cve || null,
            longitud_perforada: longitud
        };
    }

    async function saveBarreno(record) {
        state.barrenos.push(record);
        persistLocalBarrenosCatalog();

        if (!canUseSupabase()) {
            state.persistence = "local";
            return { synced: false };
        }

        await supabaseRequest("barrenos", {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: buildBarrenoRow({
                barrenoId: record.id,
                proyecto: record.proyecto,
                responsable: record.responsable,
                estado: record.estado,
                municipio: record.municipio,
                longitud: record.longitudPerforada
            })
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

        const barrenoId = document.getElementById("barrenoId").value.trim();
        const proyecto = document.getElementById("barrenoProyecto").value.trim();
        const responsable = document.getElementById("barrenoResponsable").value.trim();
        const estado = barrenoEstadoSelect.value;
        const municipio = barrenoMunicipioSelect.value;
        const longitud = Number(document.getElementById("barrenoLongitud").value);
        const intervalos = readIntervalRows();

        const errors = [];
        if (!barrenoId) errors.push("Barreno (ID) es obligatorio.");
        if (!proyecto) errors.push("Proyecto es obligatorio.");
        if (proyecto && !hasLetters(proyecto)) errors.push("Proyecto debe incluir texto valido.");
        if (!responsable) errors.push("Responsable es obligatorio.");
        if (responsable && !hasLetters(responsable)) errors.push("Responsable debe incluir texto valido.");
        if (!estado) errors.push("Estado es obligatorio.");
        if (!municipio) errors.push("Municipio es obligatorio.");
        if (!Number.isFinite(longitud) || longitud <= 0) errors.push("Longitud perforada debe ser mayor a 0.");
        if (intervalos.length === 0) errors.push("Debe capturar al menos un intervalo.");

        intervalos.forEach((intervalo, index) => {
            if (!Number.isFinite(intervalo.desde) || !Number.isFinite(intervalo.hasta)) {
                errors.push(`Intervalo ${index + 1}: Desde/Hasta invalidos.`);
            } else if (intervalo.hasta <= intervalo.desde) {
                errors.push(`Intervalo ${index + 1}: Hasta debe ser mayor que Desde.`);
            }
        });

        if (intervalos.length > 0) {
            const primer = intervalos[0];
            if (Number.isFinite(primer.desde) && !isSameDepth(primer.desde, 0)) {
                errors.push("El primer intervalo debe iniciar en 0 m.");
            }

            for (let i = 1; i < intervalos.length; i += 1) {
                const anterior = intervalos[i - 1];
                const actual = intervalos[i];
                if (Number.isFinite(anterior.hasta) && Number.isFinite(actual.desde) && !isSameDepth(anterior.hasta, actual.desde)) {
                    errors.push(`Intervalo ${i + 1}: debe iniciar exactamente en ${anterior.hasta} m para mantener continuidad.`);
                }
            }

            const ultimo = intervalos[intervalos.length - 1];
            if (Number.isFinite(ultimo.hasta) && Number.isFinite(longitud) && !isSameDepth(ultimo.hasta, longitud)) {
                errors.push(`El ultimo intervalo debe terminar en la longitud perforada (${longitud} m).`);
            }
        }

        if (state.barrenos.some((barreno) => barreno.id === barrenoId)) {
            errors.push("El Barreno (ID) ya existe en catalogo.");
        }

        if (errors.length > 0) {
            showBarrenoMessage(errors, "error");
            return;
        }

        const record = {
            id: barrenoId,
            proyecto,
            responsable,
            estado,
            municipio,
            longitudPerforada: longitud,
            intervalos
        };

        try {
            const result = await saveBarreno(record);
            renderBarrenosCatalogList();
            barrenoForm.reset();
            barrenoIntervalRows.innerHTML = "";
            ensureAtLeastOneIntervalRow();
            barrenoMunicipioSelect.innerHTML = '<option value="">Seleccione primero un estado...</option>';
            updateBarrenoIdPreview();
            showBarrenoMessage([
                result.synced ? "Barreno guardado en Supabase y respaldo local." : "Barreno guardado solo en respaldo local.",
                "El catalogo queda disponible para muestras de nucleo."
            ], result.synced ? "success" : "warning");
        } catch (error) {
            state.persistence = "local";
            renderBarrenosCatalogList();
            showBarrenoMessage([error.message || "No fue posible sincronizar el barreno con Supabase.", "El barreno quedo en respaldo local."], "warning");
        }
    });
    addIntervalRowBtn.addEventListener("click", () => {
        addIntervalRow();
    });

    openMuestraBtn.addEventListener("click", () => {
        showMuestraWizardView();
        render();
    });

    openBarrenoBtn.addEventListener("click", () => {
        showBarrenoWizardView();
    });

    backToCardsBtn.addEventListener("click", () => showCardsView());
    backToCardsFromBarrenoBtn.addEventListener("click", () => showCardsView());

    async function bootstrap() {
        await loadBarrenosCatalog();
        await loadEstados();
        ensureAtLeastOneIntervalRow();
        updateBarrenoIdPreview();
        renderBarrenosCatalogList();
        showCardsView();
        render();
    }

    bootstrap();
})();



