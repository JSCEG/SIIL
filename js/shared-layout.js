class SiteHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <div class="site-container">
                    <div class="site-header-content">
                        <div class="site-logo-section">
                            <img src="img/logo_gob.png" alt="Gobierno de México" class="site-logo-gob">
                            <div class="site-logo-separator"></div>
                            <img src="img/logo_sener.png" alt="SENER" class="site-logo-sener">
                            <div class="site-logo-separator"></div>
                            <img src="img/litio.png" alt="Litio MX" class="site-logo-litio">
                        </div>
                        <div class="site-user-section">
                            <div class="site-user-info">
                                <span data-user-info="name" class="site-user-name">Usuario</span>
                                <span data-user-info="role" class="site-user-role">Rol</span>
                            </div>
                            <button class="site-btn-logout" data-action="logout" title="Cerrar sesión" type="button" aria-label="Cerrar sesión">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
        // Initialize user info from session storage
        this.updateUserInfo();
        
        // Bind logout button
        this.bindLogoutButton();
    }
    
    updateUserInfo() {
        // Try to get user from session
        let userName = 'Usuario';
        let userRole = 'Invitado';
        
        try {
            const currentUser = sessionStorage.getItem('current_user');
            if (currentUser) {
                const user = JSON.parse(currentUser);
                userName = user.name || user.username || 'Usuario';
                userRole = user.role || 'Invitado';
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
        
        const nameElement = this.querySelector('[data-user-info="name"]');
        const roleElement = this.querySelector('[data-user-info="role"]');
        
        if (nameElement) nameElement.textContent = userName;
        if (roleElement) roleElement.textContent = userRole;
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
        // Check if Modal is available and initialized
        if (typeof window.Modal === 'undefined' || !window.Modal) {
            console.warn('Modal not available, using native confirm');
            // Fallback to native confirm
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                this.performLogout();
            }
            return;
        }
        
        // Ensure Modal is initialized
        if (typeof window.Modal.init === 'function') {
            window.Modal.init();
        }
        
        // Show elegant confirmation modal
        window.Modal.confirm({
            title: 'Cerrar sesión',
            subtitle: 'Sistema Integral de Información del Litio',
            message: '¿Está seguro que desea cerrar sesión? Será redirigido a la página de inicio de sesión.',
            confirmText: 'Sí, cerrar sesión',
            cancelText: 'Cancelar',
            type: 'warning',
            danger: false
        }).then((confirmed) => {
            if (confirmed) {
                this.performLogout();
            }
        }).catch((error) => {
            console.error('Error showing modal:', error);
            // Fallback to native confirm on error
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                this.performLogout();
            }
        });
    }
    
    performLogout() {
        // Show preloader
        if (window.Preloader) {
            Preloader.show('Cerrando sesión', 'Hasta pronto');
        }
        
        // Clear session data
        sessionStorage.removeItem('siil_session');
        sessionStorage.removeItem('current_user');
        localStorage.removeItem('siil_session');
        
        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);
    }
}

if (!customElements.get('site-header')) {
    customElements.define('site-header', SiteHeader);
}

class SiteBottomNav extends HTMLElement {
    connectedCallback() {
        const currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const isHome = currentPath === 'index.html' || currentPath === 'dashboard.html';
        const isStats = currentPath === 'registro-muestras.html';
        const isResults = currentPath === 'detalle-central.html';
        const isMap = currentPath === 'index_mapa.html';

        this.innerHTML = `
            <nav class="site-bottom-nav" aria-label="Navegación principal">
                <a class="site-bottom-nav__item ${isHome ? 'is-active' : ''}" href="index.html">
                    <i class="fa-solid fa-house"></i>
                    <span>Inicio</span>
                </a>
                <a class="site-bottom-nav__item ${isStats ? 'is-active' : ''}" href="registro-muestras.html">
                    <i class="fa-solid fa-vials"></i>
                    <span>Registros</span>
                </a>
                <a class="site-bottom-nav__item ${isResults ? 'is-active' : ''}" href="detalle-central.html">
                    <i class="fa-solid fa-chart-simple"></i>
                    <span>Resultados</span>
                </a>
                <a class="site-bottom-nav__item ${isMap ? 'is-active' : ''}" href="index_mapa.html">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <span>Mapa</span>
                </a>
            </nav>
        `;
    }
}

if (!customElements.get('site-bottom-nav')) {
    customElements.define('site-bottom-nav', SiteBottomNav);
}
