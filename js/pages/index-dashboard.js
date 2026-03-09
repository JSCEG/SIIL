(function () {
    const STAGE_KEYS = {
        borehole: 'borehole_registry',
        sample: 'sample_registry',
        fieldAnalysis: 'field_analysis',
        laboratory: 'laboratory_analysis',
        map: 'map_view',
        userAccounts: 'user_accounts',
        roleAccess: 'role_access',
        securityPolicy: 'security_policy',
        operationsLog: 'operations_log'
    };

    const ROLE_PROFILES = {
        admin: {
            badge: 'Administrador del sistema',
            title: 'Panel principal del SIIL',
            subtitle: 'Desde aqui puede ver el panorama general, revisar accesos y entrar a cualquier parte de la plataforma.',
            mission: 'Tener claro como va el sistema y atender lo necesario para que el trabajo siga avanzando.',
            stats: [
                { value: '9', label: 'Etapas y modulos', hint: 'Cobertura completa' },
                { value: '5', label: 'Roles activos', hint: 'Operacion habilitada' },
                { value: '24/7', label: 'Vigilancia', hint: 'Control institucional' },
                { value: '100%', label: 'Acceso', hint: 'Perfil maestro' }
            ],
            focusTitle: 'Lo importante aqui',
            focusCopy: 'Aqui lo importante es que los accesos, las cuentas y el flujo general esten en orden para el trabajo diario.',
            focusList: [
                'Revisar accesos, cuentas activas y reactivaciones.',
                'Ver que el flujo completo, de barreno a laboratorio, siga su curso.',
                'Tener a la mano la bitacora de acciones y el estado general de la plataforma.'
            ],
            accent: 'theme-admin'
        },
        coordinador: {
            badge: 'Perfil coordinador',
            title: 'Vista de coordinacion',
            subtitle: 'Desde aqui es mas facil seguir el avance del trabajo, ubicar pendientes y mantener ordenado el flujo de informacion.',
            mission: 'Tener una vista clara de lo que va avanzando y detectar donde hace falta seguimiento.',
            stats: [
                { value: '5', label: 'Etapas visibles', hint: 'Seguimiento completo' },
                { value: '3', label: 'Frentes', hint: 'Coordinacion diaria' },
                { value: '12', label: 'Pendientes', hint: 'Revision tecnica' },
                { value: '1', label: 'Tablero', hint: 'Vista ejecutiva' }
            ],
            focusTitle: 'Lo importante aqui',
            focusCopy: 'Aqui ayuda tener a la vista el avance del registro, los analisis y el contexto territorial del proyecto.',
            focusList: [
                'Seguir el avance desde barrenos hasta resultados.',
                'Cruzar lo que se captura con lo que ya fue analizado.',
                'Usar el mapa para ubicar zonas y prioridades de trabajo.'
            ],
            accent: 'theme-coordinador'
        },
        geologo: {
            badge: 'Perfil geologia',
            title: 'Vista geologica',
            subtitle: 'Aqui puede revisar el contexto del terreno, las muestras y los resultados con apoyo del mapa.',
            mission: 'Tener a la mano la informacion necesaria para interpretar mejor lo que se observa en campo y en los analisis.',
            stats: [
                { value: '5', label: 'Etapas visibles', hint: 'Consulta tecnica' },
                { value: '9', label: 'Sitios', hint: 'Interes geologico' },
                { value: '18', label: 'Muestras', hint: 'Analisis pendiente' },
                { value: '1', label: 'Sesion', hint: 'Trabajo especializado' }
            ],
            focusTitle: 'Lo importante aqui',
            focusCopy: 'En este perfil ayuda empezar por el contexto del barreno, la muestra, el mapa y despues pasar a los resultados.',
            focusList: [
                'Consultar barrenos y muestras con contexto geologico.',
                'Comparar resultados para detectar patrones o zonas relevantes.',
                'Apoyarse en el mapa para ubicar mejor los puntos de interes.'
            ],
            accent: 'theme-geologo'
        },
        operador_campo: {
            badge: 'Perfil de campo',
            title: 'Vista de trabajo en campo',
            subtitle: 'Esta vista esta hecha para registrar barrenos, capturar muestras y ubicar rapido la zona de trabajo.',
            mission: 'Hacer mas simple la captura diaria y dejar claro de donde viene cada muestra y donde se tomo.',
            stats: [
                { value: '3', label: 'Etapas visibles', hint: 'Trabajo en sitio' },
                { value: '6', label: 'Rutas', hint: 'Cobertura diaria' },
                { value: '14', label: 'Capturas', hint: 'Pendientes de carga' },
                { value: 'GPS', label: 'Contexto', hint: 'Referencia territorial' }
            ],
            focusTitle: 'Lo importante aqui',
            focusCopy: 'Lo importante aqui es capturar bien lo que pasa en sitio y tener cerca la referencia del mapa.',
            focusList: [
                'Registrar barrenos y muestras del trabajo en campo.',
                'Consultar el mapa para confirmar ubicaciones.',
                'Mantener ordenado el avance del frente asignado.'
            ],
            accent: 'theme-operador'
        },
        tecnico_lab: {
            badge: 'Perfil laboratorio',
            title: 'Vista de laboratorio',
            subtitle: 'Aqui puede revisar muestras, registrar analisis y validar resultados sin perder tiempo en otros modulos.',
            mission: 'Tener claro el seguimiento de las muestras y dejar bien registrados los analisis.',
            stats: [
                { value: '4', label: 'Etapas visibles', hint: 'Laboratorio' },
                { value: '27', label: 'Ensayos', hint: 'Turno actual' },
                { value: '11', label: 'Validaciones', hint: 'Revision' },
                { value: 'QA', label: 'Control', hint: 'Trazabilidad' }
            ],
            focusTitle: 'Lo importante aqui',
            focusCopy: 'En este perfil ayuda ir de la muestra al laboratorio y cerrar bien los resultados que ya quedaron listos.',
            focusList: [
                'Revisar las muestras que entran al flujo analitico.',
                'Registrar y validar analisis de laboratorio.',
                'Confirmar que los resultados queden consistentes y trazables.'
            ],
            accent: 'theme-lab'
        },
        default: {
            badge: 'Perfil SIIL',
            title: 'Panel de trabajo SIIL',
            subtitle: 'Vista general basada en las etapas y modulos habilitados para la cuenta autenticada.',
            mission: 'Entrar a las secciones disponibles para este perfil y continuar el flujo de trabajo.',
            stats: [
                { value: '0', label: 'Etapas', hint: 'Sin datos' },
                { value: '-', label: 'Perfil', hint: 'Sin definir' },
                { value: '-', label: 'Estado', hint: 'Sin contexto' },
                { value: '-', label: 'Sesion', hint: 'Sin contexto' }
            ],
            focusTitle: 'Foco operativo',
            focusCopy: 'Consulte las secciones habilitadas para continuar su trabajo.',
            focusList: [
                'Abrir la etapa principal disponible.',
                'Consultar apoyo tecnico cuando sea necesario.',
                'Mantener sesion activa solo en equipos autorizados.'
            ],
            accent: 'theme-default'
        }
    };

    const STAGE_CATALOG = {
        [STAGE_KEYS.borehole]: {
            title: 'Registro de barreno',
            description: 'Captura el contexto del barreno y deja listo el punto de partida para el resto del flujo.',
            icon: 'fa-drill',
            image: 'img/analisis_laboratorio.png',
            imageFallback: 'fa-mountain-sun',
            href: 'registro-muestras.html',
            cta: 'Abrir barrenos',
            priority: 10,
            category: 'stage'
        },
        [STAGE_KEYS.sample]: {
            title: 'Registro de muestra',
            description: 'Reune la informacion de la muestra y su contexto para mantener trazabilidad durante todo el proceso.',
            icon: 'fa-vials',
            image: 'img/analisis_laboratorio.png',
            imageFallback: 'fa-microscope',
            href: 'registro-muestras.html',
            cta: 'Abrir muestras',
            priority: 9,
            category: 'stage'
        },
        [STAGE_KEYS.fieldAnalysis]: {
            title: 'Analisis en campo',
            description: 'Da seguimiento a las lecturas y resultados obtenidos directamente en sitio con equipos portatiles.',
            icon: 'fa-wave-square',
            image: 'img/analisis_campo.png',
            imageFallback: 'fa-chart-line',
            href: 'detalle-central.html',
            cta: 'Ver analisis de campo',
            priority: 8,
            category: 'stage'
        },
        [STAGE_KEYS.laboratory]: {
            title: 'Analisis en laboratorio',
            description: 'Concentra el seguimiento de resultados de laboratorio y su validacion dentro del flujo de muestras.',
            icon: 'fa-flask-vial',
            image: 'img/analisis_campo.png',
            imageFallback: 'fa-flask',
            href: 'detalle-central.html',
            cta: 'Ver laboratorio',
            priority: 8,
            category: 'stage'
        },
        [STAGE_KEYS.map]: {
            title: 'Mapa y contexto territorial',
            description: 'Sirve para ubicar puntos de trabajo, zonas de interes y referencia territorial del proyecto.',
            icon: 'fa-map-location-dot',
            image: 'img/litio.png',
            imageFallback: 'fa-map',
            href: 'index_mapa.html',
            cta: 'Explorar mapa',
            priority: 7,
            category: 'support'
        },
        [STAGE_KEYS.userAccounts]: {
            title: 'Gestion de usuarios y cuentas',
            description: 'Desde aqui se administran cuentas, estados de acceso y datos generales de los usuarios.',
            icon: 'fa-users-gear',
            image: '',
            imageFallback: 'fa-user-shield',
            href: 'dashboard.html',
            cta: 'Administrar cuentas',
            priority: 10,
            category: 'admin',
            accentClass: 'module-card--admin'
        },
        [STAGE_KEYS.roleAccess]: {
            title: 'Roles y accesos',
            description: 'Ayuda a revisar como estan organizados los accesos y permisos dentro del sistema.',
            icon: 'fa-key',
            image: '',
            imageFallback: 'fa-lock',
            href: 'dashboard.html',
            cta: 'Revisar accesos',
            priority: 6,
            category: 'admin',
            accentClass: 'module-card--admin'
        },
        [STAGE_KEYS.securityPolicy]: {
            title: 'Politicas de seguridad',
            description: 'Reune criterios y lineamientos para el uso seguro de la plataforma.',
            icon: 'fa-shield-halved',
            image: '',
            imageFallback: 'fa-file-shield',
            href: 'dashboard.html',
            cta: 'Ver politica',
            priority: 5,
            category: 'admin',
            accentClass: 'module-card--admin'
        },
        [STAGE_KEYS.operationsLog]: {
            title: 'Bitacora de acciones',
            description: 'Concentra el registro de quien hizo que, cuando lo hizo y sobre que parte del sistema hubo movimiento.',
            icon: 'fa-clipboard-list',
            image: '',
            imageFallback: 'fa-clipboard-check',
            href: 'dashboard.html',
            cta: 'Ver bitacora',
            priority: 6,
            category: 'admin'
        }
    };

    const ROLE_STAGE_ORDER = {
        admin: [
            STAGE_KEYS.borehole,
            STAGE_KEYS.sample,
            STAGE_KEYS.fieldAnalysis,
            STAGE_KEYS.laboratory,
            STAGE_KEYS.map,
            STAGE_KEYS.userAccounts,
            STAGE_KEYS.roleAccess,
            STAGE_KEYS.securityPolicy,
            STAGE_KEYS.operationsLog
        ],
        coordinador: [
            STAGE_KEYS.borehole,
            STAGE_KEYS.sample,
            STAGE_KEYS.fieldAnalysis,
            STAGE_KEYS.laboratory,
            STAGE_KEYS.map
        ],
        geologo: [
            STAGE_KEYS.borehole,
            STAGE_KEYS.sample,
            STAGE_KEYS.map,
            STAGE_KEYS.fieldAnalysis,
            STAGE_KEYS.laboratory
        ],
        operador_campo: [
            STAGE_KEYS.borehole,
            STAGE_KEYS.sample,
            STAGE_KEYS.map
        ],
        tecnico_lab: [
            STAGE_KEYS.sample,
            STAGE_KEYS.fieldAnalysis,
            STAGE_KEYS.laboratory,
            STAGE_KEYS.map
        ],
        default: [
            STAGE_KEYS.sample,
            STAGE_KEYS.map
        ]
    };

    const RESOURCE_LINKS = {
        admin: [
            { icon: 'fa-users-cog', label: 'Gestion de usuarios y cuentas', href: 'dashboard.html' },
            { icon: 'fa-key', label: 'Roles y accesos', href: 'dashboard.html' },
            { icon: 'fa-shield-halved', label: 'Politicas de seguridad', href: 'dashboard.html' },
            { icon: 'fa-clipboard-list', label: 'Bitacora de acciones', href: 'dashboard.html' },
            { icon: 'fa-envelope-open-text', label: 'Recuperacion y soporte de acceso', href: 'login.html' }
        ],
        coordinador: [
            { icon: 'fa-clipboard-list', label: 'Seguimiento operativo', href: 'detalle-central.html' },
            { icon: 'fa-map-location-dot', label: 'Cobertura territorial', href: 'index_mapa.html' },
            { icon: 'fa-file-lines', label: 'Criterios de captura', href: 'registro-muestras.html' },
            { icon: 'fa-circle-question', label: 'Soporte tecnico', href: 'login.html' }
        ],
        geologo: [
            { icon: 'fa-mountain', label: 'Consulta territorial', href: 'index_mapa.html' },
            { icon: 'fa-chart-line', label: 'Lectura de resultados', href: 'detalle-central.html' },
            { icon: 'fa-book-open', label: 'Criterios geologicos', href: 'registro-muestras.html' },
            { icon: 'fa-circle-question', label: 'Soporte tecnico', href: 'login.html' }
        ],
        operador_campo: [
            { icon: 'fa-location-crosshairs', label: 'Ubicaciones y rutas', href: 'index_mapa.html' },
            { icon: 'fa-vials', label: 'Captura de muestras', href: 'registro-muestras.html' },
            { icon: 'fa-book-open', label: 'Guia de operacion', href: 'registro-muestras.html' },
            { icon: 'fa-circle-question', label: 'Soporte tecnico', href: 'login.html' }
        ],
        tecnico_lab: [
            { icon: 'fa-flask-vial', label: 'Captura analitica', href: 'registro-muestras.html' },
            { icon: 'fa-chart-simple', label: 'Resultados de laboratorio', href: 'detalle-central.html' },
            { icon: 'fa-book-open', label: 'Criterios de validacion', href: 'registro-muestras.html' },
            { icon: 'fa-circle-question', label: 'Soporte tecnico', href: 'login.html' }
        ],
        default: [
            { icon: 'fa-book-open', label: 'Normatividad y referencia', href: '#' },
            { icon: 'fa-file-pdf', label: 'Documentacion tecnica', href: '#' },
            { icon: 'fa-circle-question', label: 'Soporte tecnico', href: 'login.html' },
            { icon: 'fa-graduation-cap', label: 'Capacitacion', href: '#' }
        ]
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getUser() {
        return window.AuthService?.getCurrentUser() || null;
    }

    function getRoleProfile(role) {
        return ROLE_PROFILES[role] || ROLE_PROFILES.default;
    }

    function getStageOrder(role) {
        return ROLE_STAGE_ORDER[role] || ROLE_STAGE_ORDER.default;
    }

    function buildModules(role) {
        return getStageOrder(role)
            .map((key) => STAGE_CATALOG[key])
            .filter(Boolean)
            .sort((left, right) => right.priority - left.priority);
    }

    function renderHero(user, profile, modules) {
        const badge = document.getElementById('roleBadge');
        const title = document.getElementById('heroTitle');
        const subtitle = document.getElementById('heroSubtitle');
        const mission = document.getElementById('heroMission');
        const roleName = document.getElementById('heroRoleName');
        const roleMeta = document.getElementById('heroRoleMeta');
        const primaryAction = document.getElementById('heroPrimaryAction');
        const secondaryAction = document.getElementById('heroSecondaryAction');
        const shell = document.getElementById('dashboardShell');

        if (shell) {
            shell.className = `dashboard-shell ${profile.accent}`;
        }

        if (badge) {
            badge.textContent = profile.badge;
        }

        if (title) {
            title.textContent = profile.title;
        }

        if (subtitle) {
            subtitle.textContent = profile.subtitle;
        }

        if (mission) {
            mission.textContent = profile.mission;
        }

        if (roleName) {
            roleName.textContent = user?.name || user?.email || 'Usuario SIIL';
        }

        if (roleMeta) {
            roleMeta.textContent = `${(user?.role || 'perfil').replace(/_/g, ' ')}${user?.institucion ? ` • ${user.institucion}` : ''}`;
        }

        if (primaryAction) {
            const mainModule = modules[0];
            primaryAction.href = mainModule?.href || '#';
            primaryAction.innerHTML = `${escapeHtml(mainModule?.cta || 'Abrir seccion principal')} <i class="fa-solid fa-arrow-right"></i>`;
        }

        if (secondaryAction) {
            secondaryAction.href = user?.role === 'admin' ? 'dashboard.html' : 'index_mapa.html';
            secondaryAction.innerHTML = user?.role === 'admin'
                ? '<i class="fa-solid fa-users-gear"></i> Administrar cuentas'
                : '<i class="fa-solid fa-location-dot"></i> Abrir mapa';
        }
    }

    function renderStats(profile, modules) {
        const container = document.getElementById('statGrid');
        if (!container) {
            return;
        }

        const stats = profile.stats.map((item, index) => {
            if (index === 0 && item.label.toLowerCase().includes('etapas')) {
                return {
                    ...item,
                    value: String(modules.filter((module) => module.category === 'stage').length)
                };
            }
            return item;
        });

        container.innerHTML = stats.map((item) => `
            <article class="stat-card">
                <span class="stat-value">${escapeHtml(item.value)}</span>
                <span class="stat-label">${escapeHtml(item.label)}</span>
                <span class="stat-hint">${escapeHtml(item.hint)}</span>
            </article>
        `).join('');
    }

    function renderModules(modules) {
        const container = document.getElementById('moduleGrid');
        if (!container) {
            return;
        }

        container.innerHTML = modules.map((module, index) => {
            const imageMarkup = module.image
                ? `<img src="${escapeHtml(module.image)}" alt="${escapeHtml(module.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : '';
            const fallbackStyle = module.image ? 'display:none;' : 'display:flex;';
            const accentClass = module.accentClass ? ` ${module.accentClass}` : '';
            const toneClass = index === 0 ? 'module-card--priority' : '';
            const tagLabel = module.category === 'stage' ? 'Etapa del flujo' : module.category === 'admin' ? 'Administracion' : 'Apoyo';

            return `
                <article class="module-card${accentClass} ${toneClass}">
                    <div class="module-visual">
                        ${imageMarkup}
                        <div class="module-fallback" style="${fallbackStyle}">
                            <i class="fa-solid ${escapeHtml(module.imageFallback)}"></i>
                        </div>
                    </div>
                    <div class="module-body">
                        <span class="module-tag">${escapeHtml(tagLabel)}</span>
                        <div class="module-icon"><i class="fa-solid ${escapeHtml(module.icon)}"></i></div>
                        <h2 class="module-title">${escapeHtml(module.title)}</h2>
                        <p class="module-description">${escapeHtml(module.description)}</p>
                        <a href="${escapeHtml(module.href)}" class="module-cta">
                            ${escapeHtml(module.cta)}
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderFocus(profile) {
        const title = document.getElementById('focusTitle');
        const copy = document.getElementById('focusCopy');
        const list = document.getElementById('focusList');

        if (title) {
            title.textContent = profile.focusTitle;
        }

        if (copy) {
            copy.textContent = profile.focusCopy;
        }

        if (list) {
            list.innerHTML = profile.focusList.map((item) => `
                <li>
                    <i class="fa-solid fa-check"></i>
                    <span>${escapeHtml(item)}</span>
                </li>
            `).join('');
        }
    }

    function renderResources(role) {
        const list = document.getElementById('resourceList');
        if (!list) {
            return;
        }

        const resources = RESOURCE_LINKS[role] || RESOURCE_LINKS.default;
        list.innerHTML = resources.map((item) => `
            <li class="resource-item">
                <a href="${escapeHtml(item.href)}">
                    <span class="resource-icon"><i class="fa-solid ${escapeHtml(item.icon)}"></i></span>
                    <span class="resource-label">${escapeHtml(item.label)}</span>
                    <i class="fa-solid fa-chevron-right resource-arrow"></i>
                </a>
            </li>
        `).join('');
    }

    function renderEmpty() {
        const container = document.getElementById('moduleGrid');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <article class="module-empty">
                <i class="fa-solid fa-circle-info"></i>
                <h2>Sin secciones habilitadas</h2>
                <p>El perfil autenticado todavia no tiene etapas o modulos asignados.</p>
            </article>
        `;
    }

    async function init() {
        const user = getUser();
        const profile = getRoleProfile(user?.role);
        const modules = buildModules(user?.role || 'default');

        renderHero(user, profile, modules);
        renderStats(profile, modules);
        renderFocus(profile);
        renderResources(user?.role || 'default');

        if (modules.length === 0) {
            renderEmpty();
            return;
        }

        renderModules(modules);
    }

    document.addEventListener('DOMContentLoaded', () => {
        init();
    });
}());






