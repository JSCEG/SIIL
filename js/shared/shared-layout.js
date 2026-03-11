class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <div class="site-container">
                    <div class="site-header-content">
                        <div class="site-logo-section">
                            <img src="img/logo_gob.png" alt="Gobierno de Mexico" class="site-logo-gob">
                            <div class="site-logo-separator"></div>
                            <img src="img/logo_sener.png" alt="SENER" class="site-logo-sener">
                            <div class="site-logo-separator"></div>
                            <img src="img/litio.png" alt="Litio MX" class="site-logo-litio">
                        </div>
                        <div class="site-user-section">
                            <a class="site-user-info site-user-info--link" href="cuenta.html" title="Configuracion de cuenta" aria-label="Ir a configuracion de cuenta">
                                <span data-user-info="name" class="site-user-name">Usuario <i class="fas fa-chevron-down site-user-chevron" aria-hidden="true"></i></span>
                                <span data-user-info="role" class="site-user-role">Rol</span>
                            </a>
                            <button class="site-btn-logout" data-action="logout" title="Cerrar sesion" type="button" aria-label="Cerrar sesion">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;

        this.updateUserInfo();
        this.bindLogoutButton();
    }

    updateUserInfo() {
        let userName = 'Usuario';
        let userRole = 'Invitado';

        try {
            const user = window.AuthService?.getCurrentUser();
            if (user) {
                userName = user.name || user.email || 'Usuario';
                userRole = user.role || 'Invitado';
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }

        const nameElement = this.querySelector('[data-user-info="name"]');
        const roleElement = this.querySelector('[data-user-info="role"]');

        if (nameElement) {
            nameElement.textContent = userName;
        }
        if (roleElement) {
            roleElement.textContent = userRole;
        }
    }

    bindLogoutButton() {
        const logoutButton = this.querySelector('[data-action="logout"]');

        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    handleLogout() {
        if (typeof window.Modal === 'undefined' || !window.Modal) {
            console.warn('Modal not available, using native confirm');
            if (confirm('¿Esta seguro que desea cerrar sesion?')) {
                this.performLogout();
            }
            return;
        }

        if (typeof window.Modal.init === 'function') {
            window.Modal.init();
        }

        window.Modal.confirm({
            title: 'Cerrar sesion',
            subtitle: 'Sistema Integral de Informacion del Litio',
            message: '¿Esta seguro que desea cerrar sesion? Sera redirigido a la pagina de inicio de sesion.',
            confirmText: 'Si, cerrar sesion',
            cancelText: 'Cancelar',
            type: 'warning',
            danger: false
        }).then((confirmed) => {
            if (confirmed) {
                this.performLogout();
            }
        }).catch((error) => {
            console.error('Error showing modal:', error);
            if (confirm('¿Esta seguro que desea cerrar sesion?')) {
                this.performLogout();
            }
        });
    }

    async performLogout() {
        if (window.Preloader) {
            Preloader.show('Cerrando sesion', 'Hasta pronto');
        }

        if (window.AuthService) {
            await window.AuthService.signOut();
        }

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}

const BOTTOM_NAV_BY_ROLE = {
    admin: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html', 'dashboard.html'] },
        { key: 'accounts', label: 'Cuentas', href: 'dashboard.html', icon: 'fa-users-gear', matches: ['dashboard.html'] },
        { key: 'records', label: 'Registros', href: 'registro-muestras.html', icon: 'fa-vials', matches: ['registro-muestras.html'] },
        { key: 'results', label: 'Resultados', href: 'detalle-central.html', icon: 'fa-chart-simple', matches: ['detalle-central.html'] },
        { key: 'map', label: 'Mapa', href: 'index_mapa.html', icon: 'fa-map-location-dot', matches: ['index_mapa.html'] }
    ],
    coordinador: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html'] },
        { key: 'flow', label: 'Flujo', href: 'registro-muestras.html', icon: 'fa-diagram-project', matches: ['registro-muestras.html'] },
        { key: 'results', label: 'Resultados', href: 'detalle-central.html', icon: 'fa-chart-simple', matches: ['detalle-central.html'] },
        { key: 'map', label: 'Mapa', href: 'index_mapa.html', icon: 'fa-map-location-dot', matches: ['index_mapa.html'] }
    ],
    geologo: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html'] },
        { key: 'samples', label: 'Muestras', href: 'registro-muestras.html', icon: 'fa-vials', matches: ['registro-muestras.html'] },
        { key: 'results', label: 'Resultados', href: 'detalle-central.html', icon: 'fa-chart-line', matches: ['detalle-central.html'] },
        { key: 'map', label: 'Mapa', href: 'index_mapa.html', icon: 'fa-map-location-dot', matches: ['index_mapa.html'] }
    ],
    operador_campo: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html'] },
        { key: 'records', label: 'Registros', href: 'registro-muestras.html', icon: 'fa-vials', matches: ['registro-muestras.html'] },
        { key: 'map', label: 'Mapa', href: 'index_mapa.html', icon: 'fa-map-location-dot', matches: ['index_mapa.html'] }
    ],
    tecnico_lab: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html'] },
        { key: 'samples', label: 'Muestras', href: 'registro-muestras.html', icon: 'fa-vials', matches: ['registro-muestras.html'] },
        { key: 'lab', label: 'Lab', href: 'detalle-central.html', icon: 'fa-flask-vial', matches: ['detalle-central.html'] },
        { key: 'results', label: 'Resultados', href: 'detalle-central.html', icon: 'fa-chart-simple', matches: ['detalle-central.html'] }
    ],
    default: [
        { key: 'home', label: 'Inicio', href: 'index.html', icon: 'fa-house', matches: ['index.html'] },
        { key: 'records', label: 'Registros', href: 'registro-muestras.html', icon: 'fa-vials', matches: ['registro-muestras.html'] },
        { key: 'results', label: 'Resultados', href: 'detalle-central.html', icon: 'fa-chart-simple', matches: ['detalle-central.html'] },
        { key: 'map', label: 'Mapa', href: 'index_mapa.html', icon: 'fa-map-location-dot', matches: ['index_mapa.html'] }
    ]
};

class SiteBottomNav extends HTMLElement {
    connectedCallback() {
        const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const currentUser = window.AuthService?.getCurrentUser?.();
        const role = currentUser?.role || 'default';
        const items = BOTTOM_NAV_BY_ROLE[role] || BOTTOM_NAV_BY_ROLE.default;

        this.innerHTML = `
            <nav class="site-bottom-nav" aria-label="Navegacion principal">
                ${items.map((item) => {
                    const isActive = item.matches.includes(currentPath);
                    return `
                        <a class="site-bottom-nav__item ${isActive ? 'is-active' : ''}" href="${item.href}">
                            <i class="fa-solid ${item.icon}"></i>
                            <span>${item.label}</span>
                        </a>
                    `;
                }).join('')}
            </nav>
        `;
    }
}

if (!customElements.get('site-bottom-nav')) {
    customElements.define('site-bottom-nav', SiteBottomNav);
}



