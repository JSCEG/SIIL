class SiteBreadcrumbs extends HTMLElement {
    connectedCallback() {
        const items = this.getItems();
        this.innerHTML = this.render(items);
    }

    getItems() {
        const raw = this.getAttribute('data-items');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (error) {
                console.error('Invalid breadcrumb data-items JSON:', error);
            }
        }

        return this.getAutoItems();
    }

    getAutoItems() {
        const path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

        const routes = {
            'index.html': [
                { label: 'Inicio' }
            ],
            'dashboard.html': [
                { label: 'Inicio', href: 'index.html' },
                { label: 'Dashboard' }
            ],
            'registro-muestras.html': [
                { label: 'Inicio', href: 'index.html' },
                { label: 'Registro de Muestras y Análisis' }
            ],
            'index_mapa.html': [
                { label: 'Inicio', href: 'index.html' },
                { label: 'Mapa de Yacimientos' }
            ],
            'detalle-central.html': [
                { label: 'Inicio', href: 'index.html' },
                { label: 'Consultorio de Resultados' },
                { label: 'Detalle de Central' }
            ],
            'login.html': [
                { label: 'Iniciar Sesión' }
            ],
            'login_backup.html': [
                { label: 'Iniciar Sesión' }
            ],
            'cuenta.html': [
                { label: 'Inicio', href: 'index.html' },
                { label: 'Configuración de Cuenta' }
            ]
        };

        if (routes[path]) {
            return routes[path];
        }

        const title = document.title ? document.title.split('|')[0].trim() : 'Página';
        return [{ label: 'Inicio', href: 'index.html' }, { label: title }];
    }

    render(items) {
        const list = items
            .map((item, index) => {
                const isLast = index === items.length - 1;
                const label = this.escapeHtml(item.label || '');

                if (!isLast && item.href) {
                    return `<li class="site-breadcrumb__item"><a class="site-breadcrumb__link" href="${item.href}">${label}</a></li>`;
                }

                return `<li class="site-breadcrumb__item" aria-current="page"><span class="site-breadcrumb__current">${label}</span></li>`;
            })
            .join('');

        return `
            <nav class="site-breadcrumb" aria-label="Migas de pan">
                <div class="site-breadcrumb__container">
                    <ol class="site-breadcrumb__list">${list}</ol>
                </div>
            </nav>
        `;
    }

    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

if (!customElements.get('site-breadcrumbs')) {
    customElements.define('site-breadcrumbs', SiteBreadcrumbs);
}


