(function () {
    const FEATURE_KEYS = {
        sampleRegistry: 'sample_registry',
        resultsView: 'results_view',
        mapView: 'map_view',
        userAccounts: 'user_accounts',
        roleAccess: 'role_access',
        securityPolicy: 'security_policy',
        operationsLog: 'operations_log'
    };

    const ROLE_FEATURES = {
        admin: Object.values(FEATURE_KEYS),
        coordinador: [
            FEATURE_KEYS.sampleRegistry,
            FEATURE_KEYS.resultsView,
            FEATURE_KEYS.mapView,
            FEATURE_KEYS.operationsLog
        ],
        geologo: [
            FEATURE_KEYS.sampleRegistry,
            FEATURE_KEYS.resultsView,
            FEATURE_KEYS.mapView
        ],
        operador_campo: [
            FEATURE_KEYS.sampleRegistry,
            FEATURE_KEYS.mapView
        ],
        tecnico_lab: [
            FEATURE_KEYS.sampleRegistry,
            FEATURE_KEYS.resultsView
        ],
        default: [
            FEATURE_KEYS.sampleRegistry,
            FEATURE_KEYS.resultsView,
            FEATURE_KEYS.mapView
        ]
    };

    const FEATURE_CATALOG = {
        [FEATURE_KEYS.sampleRegistry]: {
            title: 'Registro de muestras y analisis',
            description: 'Administre barrenos, muestras, validaciones y seguimiento tecnico del flujo de captura.',
            icon: 'fa-microscope',
            image: 'img/analisis_laboratorio.png',
            imageFallback: 'fa-vials',
            href: 'registro-muestras.html',
            cta: 'Entrar al modulo'
        },
        [FEATURE_KEYS.resultsView]: {
            title: 'Resultados y control tecnico',
            description: 'Revise concentraciones, indicadores y consistencia de informacion analitica.',
            icon: 'fa-chart-simple',
            image: 'img/analisis_campo.png',
            imageFallback: 'fa-chart-line',
            href: 'detalle-central.html',
            cta: 'Ver resultados'
        },
        [FEATURE_KEYS.mapView]: {
            title: 'Mapa y contexto territorial',
            description: 'Consulte la vista geoespacial de yacimientos y puntos de interes para seguimiento institucional.',
            icon: 'fa-map',
            image: 'img/litio.png',
            imageFallback: 'fa-map-location-dot',
            href: 'index_mapa.html',
            cta: 'Abrir mapa'
        },
        [FEATURE_KEYS.userAccounts]: {
            title: 'Gestion de usuarios y cuentas',
            description: 'Alta, baja, activacion, roles, control de acceso y seguimiento de cuentas administrativas del sistema.',
            icon: 'fa-users-gear',
            image: '',
            imageFallback: 'fa-user-shield',
            href: 'dashboard.html',
            cta: 'Administrar cuentas',
            accentClass: 'service-card--admin'
        }
    };

    const LINK_CATALOG = {
        [FEATURE_KEYS.userAccounts]: { icon: 'fa-users-cog', label: 'Gestion de usuarios y cuentas', href: 'dashboard.html' },
        [FEATURE_KEYS.roleAccess]: { icon: 'fa-key', label: 'Roles, permisos y accesos', href: 'dashboard.html' },
        [FEATURE_KEYS.securityPolicy]: { icon: 'fa-file-shield', label: 'Politicas de seguridad y respaldo', href: '#' },
        [FEATURE_KEYS.operationsLog]: { icon: 'fa-clipboard-list', label: 'Bitacora operativa y seguimiento', href: '#' },
        default1: { icon: 'fa-book-open', label: 'Normatividad y marco legal', href: '#' },
        default2: { icon: 'fa-file-pdf', label: 'Documentacion tecnica', href: '#' },
        default3: { icon: 'fa-circle-question', label: 'Soporte tecnico', href: '#' },
        default4: { icon: 'fa-graduation-cap', label: 'Capacitacion y tutoriales', href: '#' }
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

    function getEnabledFeatures(user) {
        if (Array.isArray(user?.featureFlags) && user.featureFlags.length > 0) {
            return user.featureFlags;
        }

        const role = user?.role || 'default';
        return ROLE_FEATURES[role] || ROLE_FEATURES.default;
    }

    function buildStats(user, features) {
        if (user?.role === 'admin') {
            return [
                { value: '12', label: 'Usuarios activos' },
                { value: '4', label: 'Roles operando' },
                { value: '128', label: 'Registros hoy' },
                { value: '3', label: 'Cuentas pendientes' }
            ];
        }

        return [
            { value: String(features.length), label: 'Modulos habilitados' },
            { value: user?.role || 'perfil', label: 'Perfil activo' },
            { value: '24', label: 'Sitios activos' },
            { value: '1', label: 'Sesion activa' }
        ];
    }

    function buildLinks(user, features) {
        if (user?.role === 'admin') {
            return [
                LINK_CATALOG[FEATURE_KEYS.userAccounts],
                LINK_CATALOG[FEATURE_KEYS.roleAccess],
                LINK_CATALOG[FEATURE_KEYS.securityPolicy],
                LINK_CATALOG[FEATURE_KEYS.operationsLog]
            ];
        }

        return [
            LINK_CATALOG.default1,
            LINK_CATALOG.default2,
            LINK_CATALOG.default3,
            LINK_CATALOG.default4
        ];
    }

    function buildView(user) {
        const features = getEnabledFeatures(user);
        const services = features
            .filter((featureKey) => FEATURE_CATALOG[featureKey])
            .map((featureKey) => FEATURE_CATALOG[featureKey]);

        return {
            heroTitle: user?.role === 'admin' ? 'Panel administrativo SIIL' : 'Panel operativo SIIL',
            heroSubtitle: user?.role === 'admin'
                ? 'Vista integral para administracion del sistema, supervision operativa, control de accesos y seguimiento de capturas estrategicas del proyecto.'
                : 'Vista de trabajo con los modulos habilitados para el perfil autenticado dentro del Sistema Integral de Informacion del Litio.',
            stats: buildStats(user, features),
            services,
            links: buildLinks(user, features),
            isAdmin: user?.role === 'admin'
        };
    }

    function renderStats(stats) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) {
            return;
        }

        statsGrid.innerHTML = stats.map((item) => `
            <div class="stat-item">
                <div class="stat-value">${escapeHtml(item.value)}</div>
                <div class="stat-label">${escapeHtml(item.label)}</div>
            </div>
        `).join('');
    }

    function renderServices(services) {
        const servicesGrid = document.querySelector('.services-grid');
        if (!servicesGrid) {
            return;
        }

        servicesGrid.innerHTML = services.map((service) => {
            const imageMarkup = service.image
                ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
                : '';
            const imageFallbackStyle = service.image ? 'display: none;' : 'display: flex;';
            const accentClass = service.accentClass ? ` ${service.accentClass}` : '';

            return `
                <article class="service-card${accentClass}">
                    <div class="service-image">
                        ${imageMarkup}
                        <i class="fa-solid ${escapeHtml(service.imageFallback)}" style="${imageFallbackStyle}"></i>
                    </div>
                    <div class="service-content">
                        <div class="service-icon">
                            <i class="fa-solid ${escapeHtml(service.icon)}"></i>
                        </div>
                        <h2 class="service-title">${escapeHtml(service.title)}</h2>
                        <p class="service-description">${escapeHtml(service.description)}</p>
                        <a href="${escapeHtml(service.href)}" class="service-button">
                            ${escapeHtml(service.cta)}
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderLinks(links) {
        const linksList = document.querySelector('.links-list');
        if (!linksList) {
            return;
        }

        linksList.innerHTML = links.map((link) => `
            <li class="link-item">
                <a href="${escapeHtml(link.href)}">
                    <div class="link-content">
                        <div class="link-icon">
                            <i class="fa-solid ${escapeHtml(link.icon)}"></i>
                        </div>
                        <span class="font-medium">${escapeHtml(link.label)}</span>
                    </div>
                    <i class="fa-solid fa-chevron-right text-gray-400"></i>
                </a>
            </li>
        `).join('');
    }

    function applyView(view) {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const quickLinksTitle = document.querySelector('.quick-links-title');

        if (heroTitle) {
            heroTitle.textContent = view.heroTitle;
        }

        if (heroSubtitle) {
            heroSubtitle.textContent = view.heroSubtitle;
        }

        if (quickLinksTitle) {
            quickLinksTitle.innerHTML = `<i class="fa-solid fa-link"></i>${view.isAdmin ? 'Control y recursos administrativos' : 'Recursos y enlaces'}`;
        }

        renderStats(view.stats);
        renderServices(view.services);
        renderLinks(view.links);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const user = getUser();
        applyView(buildView(user));
    });
}());
