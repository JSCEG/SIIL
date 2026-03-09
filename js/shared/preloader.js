/**
 * PRELOADER GLOBAL - SIIL
 * Sistema de carga reutilizable para todas las páginas
 */

const Preloader = {
    overlay: null,
    
    /**
     * Inicializa el preloader en el DOM
     */
    init() {
        if (this.overlay) return; // Ya está inicializado
        
        // Crear el overlay del preloader
        this.overlay = document.createElement('div');
        this.overlay.className = 'preloader-overlay';
        this.overlay.innerHTML = `
            <div class="preloader-content">
                <div class="preloader-spinner"></div>
                <div class="preloader-text">Cargando</div>
                <div class="preloader-subtext">
                    Por favor espere
                    <span class="preloader-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
    },
    
    /**
     * Muestra el preloader con mensaje personalizado
     * @param {string} message - Mensaje principal
     * @param {string} submessage - Mensaje secundario
     */
    show(message = 'Cargando', submessage = 'Por favor espere') {
        this.init();
        
        const textElement = this.overlay.querySelector('.preloader-text');
        const subtextElement = this.overlay.querySelector('.preloader-subtext');
        
        if (textElement) {
            textElement.textContent = message;
        }
        
        if (subtextElement) {
            subtextElement.innerHTML = `
                ${submessage}
                <span class="preloader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            `;
        }
        
        // Mostrar con animación
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
    },
    
    /**
     * Oculta el preloader
     * @param {number} delay - Retraso antes de ocultar (ms)
     */
    hide(delay = 0) {
        if (!this.overlay) return;
        
        setTimeout(() => {
            this.overlay.classList.remove('active');
        }, delay);
    },
    
    /**
     * Muestra el preloader durante una promesa
     * @param {Promise} promise - Promesa a ejecutar
     * @param {string} message - Mensaje a mostrar
     * @param {string} submessage - Submensaje a mostrar
     * @returns {Promise}
     */
    async wrap(promise, message = 'Cargando', submessage = 'Por favor espere') {
        this.show(message, submessage);
        
        try {
            const result = await promise;
            this.hide(300);
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }
};

/**
 * MODAL SYSTEM - SIIL
 * Sistema de modales elegantes para confirmaciones y alertas
 */

const Modal = {
    overlay: null,
    currentResolve: null,
    
    /**
     * Inicializa el modal en el DOM
     */
    init() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-icon warning">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                    </div>
                    <div class="modal-header-text">
                        <div class="modal-title">Título</div>
                        <div class="modal-subtitle">Subtítulo</div>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="modal-message">Mensaje del modal</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-cancel" data-action="cancel">
                        <i class="fa-solid fa-times"></i>
                        Cancelar
                    </button>
                    <button class="modal-btn modal-btn-confirm" data-action="confirm">
                        <i class="fa-solid fa-check"></i>
                        Confirmar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        // Bind events
        this.overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => this.close(false));
        this.overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => this.close(true));
        
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close(false);
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close(false);
            }
        });
    },
    
    /**
     * Muestra un modal de confirmación
     * @param {Object} options - Opciones del modal
     * @returns {Promise<boolean>}
     */
    confirm(options = {}) {
        this.init();
        
        const {
            title = 'Confirmar acción',
            subtitle = '',
            message = '¿Está seguro que desea continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning', // warning, danger, success, info
            danger = false
        } = options;
        
        // Update content
        const icon = this.overlay.querySelector('.modal-icon');
        const titleEl = this.overlay.querySelector('.modal-title');
        const subtitleEl = this.overlay.querySelector('.modal-subtitle');
        const messageEl = this.overlay.querySelector('.modal-message');
        const confirmBtn = this.overlay.querySelector('[data-action="confirm"]');
        const cancelBtn = this.overlay.querySelector('[data-action="cancel"]');
        
        // Set icon type
        icon.className = `modal-icon ${type}`;
        const icons = {
            warning: 'fa-exclamation-triangle',
            danger: 'fa-exclamation-circle',
            success: 'fa-check-circle',
            info: 'fa-info-circle'
        };
        icon.querySelector('i').className = `fa-solid ${icons[type] || icons.warning}`;
        
        // Set texts
        titleEl.textContent = title;
        subtitleEl.textContent = subtitle;
        subtitleEl.style.display = subtitle ? 'block' : 'none';
        messageEl.textContent = message;
        
        // Set button texts
        confirmBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${confirmText}`;
        cancelBtn.innerHTML = `<i class="fa-solid fa-times"></i> ${cancelText}`;
        
        // Set button style
        if (danger) {
            confirmBtn.classList.add('danger');
        } else {
            confirmBtn.classList.remove('danger');
        }
        
        // Show modal
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
        
        // Return promise
        return new Promise((resolve) => {
            this.currentResolve = resolve;
        });
    },
    
    /**
     * Cierra el modal
     * @param {boolean} result - Resultado de la confirmación
     */
    close(result) {
        this.overlay.classList.remove('active');
        
        if (this.currentResolve) {
            this.currentResolve(result);
            this.currentResolve = null;
        }
    },
    
    /**
     * Muestra un modal de alerta simple
     * @param {Object} options - Opciones del modal
     * @returns {Promise<void>}
     */
    async alert(options = {}) {
        const {
            title = 'Información',
            message = '',
            type = 'info',
            buttonText = 'Aceptar'
        } = options;
        
        this.init();
        
        // Hide cancel button
        const cancelBtn = this.overlay.querySelector('[data-action="cancel"]');
        cancelBtn.style.display = 'none';
        
        const result = await this.confirm({
            ...options,
            confirmText: buttonText,
            subtitle: ''
        });
        
        // Show cancel button again
        cancelBtn.style.display = '';
        
        return result;
    }
};

/**
 * Agrega estado de carga a un botón
 * @param {HTMLElement} button - Botón a modificar
 * @param {boolean} loading - Estado de carga
 */
function setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        
        // Guardar el contenido original
        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
        }
        
        // Envolver el texto en un span si no existe
        const textSpan = button.querySelector('.btn-text');
        if (!textSpan) {
            button.innerHTML = `<span class="btn-text">${button.innerHTML}</span>`;
        }
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        
        // Restaurar contenido original
        if (button.dataset.originalContent) {
            button.innerHTML = button.dataset.originalContent;
            delete button.dataset.originalContent;
        }
    }
}

// Exportar para uso global
window.Preloader = Preloader;
window.Modal = Modal;
window.setButtonLoading = setButtonLoading;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Preloader.init();
        Modal.init();
    });
} else {
    Preloader.init();
    Modal.init();
}
