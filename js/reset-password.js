class ResetPasswordManager {
    constructor() {
        this.form = document.getElementById('resetPasswordForm');
        this.statusBox = document.getElementById('statusMessage');
        this.passwordInput = document.getElementById('newPassword');
        this.confirmInput = document.getElementById('confirmPassword');
        this.submitButton = this.form?.querySelector('button[type="submit"]') || null;
        this.titleElement = document.getElementById('resetViewTitle');
        this.copyElement = document.getElementById('resetViewCopy');
        this.asideTitleElement = document.getElementById('resetAsideTitle');
        this.asideCopyElement = document.getElementById('resetAsideCopy');
        this.flowType = 'recovery';
        this.recoverySession = null;
        this.init();
    }

    async init() {
        this.applyFlowCopy();
        this.bindEvents();
        await this.bootstrapRecovery();
    }

    getFlowType() {
        const hashParams = new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : '');
        const searchParams = new URLSearchParams(window.location.search);
        const sessionType = this.recoverySession?.type || '';
        return sessionType || hashParams.get('type') || searchParams.get('type') || 'recovery';
    }

    applyFlowCopy() {
        this.flowType = this.getFlowType() === 'invite' ? 'invite' : 'recovery';

        if (this.flowType === 'invite') {
            if (this.titleElement) this.titleElement.textContent = 'Activar cuenta SIIL';
            if (this.copyElement) this.copyElement.textContent = 'Defina su contraseña inicial para activar el acceso a la plataforma SIIL a partir del enlace de invitación enviado a su correo.';
            if (this.asideTitleElement) this.asideTitleElement.textContent = 'Activación inicial por correo institucional';
            if (this.asideCopyElement) this.asideCopyElement.textContent = 'Este flujo usa el enlace firmado de Supabase para que cada usuario defina su contraseña inicial sin compartir credenciales temporales.';
            if (this.submitButton) this.submitButton.textContent = 'Activar cuenta';
            return;
        }

        if (this.titleElement) this.titleElement.textContent = 'Restablecer contraseña';
        if (this.copyElement) this.copyElement.textContent = 'Use esta pantalla para restablecer la contraseña de su cuenta SIIL a partir del enlace enviado por correo.';
        if (this.asideTitleElement) this.asideTitleElement.textContent = 'Recuperación controlada por correo institucional';
        if (this.asideCopyElement) this.asideCopyElement.textContent = 'Este flujo usa el enlace firmado de Supabase y permite recuperar el acceso a SIIL sin compartir contraseñas por otros medios.';
        if (this.submitButton) this.submitButton.textContent = 'Guardar nueva contraseña';
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        }
    }

    async bootstrapRecovery() {
        this.setLoading(true, 'Validando enlace', 'Comprobando acceso seguro');
        this.hideStatus();

        try {
            this.recoverySession = await Promise.race([
                window.AuthService.establishRecoverySessionFromUrl(),
                new Promise((_, reject) => {
                    window.setTimeout(() => {
                        reject(new Error('La validación del enlace tardó demasiado. Recargue la página o solicite un nuevo enlace.')); 
                    }, 10000);
                })
            ]);

            if (!this.recoverySession?.access_token) {
                throw new Error('El enlace de acceso no es válido o ya expiró. Solicite uno nuevo desde la plataforma.');
            }

            this.applyFlowCopy();
            this.setStatus(this.flowType === 'invite' ? 'Invitación válida. Ya puede definir su contraseña inicial.' : 'Enlace válido. Ya puede definir una nueva contraseña.', 'success');
        } catch (error) {
            console.error('Recovery bootstrap error:', error);
            this.applyFlowCopy();
            this.setStatus(error.message || 'No fue posible validar el enlace de acceso.', 'error');
            if (this.submitButton) {
                this.submitButton.disabled = true;
            }
        } finally {
            this.setLoading(false);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.hideStatus();

        if (!this.recoverySession?.access_token) {
            this.setStatus('No hay una sesion valida para continuar. Solicite un nuevo enlace.', 'error');
            return;
        }

        const password = this.passwordInput.value;
        const confirmPassword = this.confirmInput.value;
        const validationMessage = this.validate(password, confirmPassword);
        if (validationMessage) {
            this.setStatus(validationMessage, 'error');
            return;
        }

        this.setLoading(true, this.flowType === 'invite' ? 'Activando cuenta' : 'Actualizando contrasena', 'Guardando nueva credencial');

        try {
            await window.AuthService.updatePassword(password, this.recoverySession.access_token);
            await window.AuthService.signOut();
            this.setLoading(false);

            if (window.Modal) {
                await window.Modal.alert({
                    title: this.flowType === 'invite' ? 'Cuenta activada' : 'Contraseña actualizada',
                    message: this.flowType === 'invite'
                        ? 'La cuenta quedó activada correctamente. Inicie sesión con su nueva contraseña.'
                        : 'La contraseña se actualizó correctamente. Inicie sesión nuevamente con la nueva credencial.',
                    type: 'success',
                    buttonText: 'Ir al login'
                });
            }

            window.location.href = 'login.html';
            return;
        } catch (error) {
            console.error('Update password error:', error);
            this.setStatus(error.message || 'No fue posible guardar la contrasena.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    validate(password, confirmPassword) {
        if (!password) {
            return 'Ingrese la nueva contrasena.';
        }

        if (password.length < 12) {
            return 'La nueva contrasena debe tener al menos 12 caracteres.';
        }

        if (!/[A-Z]/u.test(password) || !/[a-z]/u.test(password) || !/[0-9]/u.test(password)) {
            return 'La nueva contrasena debe incluir mayusculas, minusculas y numeros.';
        }

        if (password !== confirmPassword) {
            return 'La confirmacion no coincide con la nueva contrasena.';
        }

        return '';
    }

    setStatus(message, type) {
        if (!this.statusBox) {
            return;
        }

        this.statusBox.textContent = message;
        this.statusBox.className = `status-message ${type}`;
        this.statusBox.style.display = 'block';
    }

    hideStatus() {
        if (!this.statusBox) {
            return;
        }

        this.statusBox.style.display = 'none';
        this.statusBox.textContent = '';
        this.statusBox.className = 'status-message';
    }

    setLoading(loading, title = 'Procesando', message = 'Espere un momento') {
        if (loading) {
            window.Preloader?.show(title, message);
        } else {
            window.Preloader?.hide();
            const overlay = window.Preloader?.overlay || document.querySelector('.preloader-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
                window.setTimeout(() => {
                    overlay.style.display = '';
                }, 0);
            }
        }

        if (this.submitButton) {
            this.submitButton.disabled = loading;
        }

        if (this.passwordInput) {
            this.passwordInput.disabled = loading;
        }

        if (this.confirmInput) {
            this.confirmInput.disabled = loading;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resetPasswordForm')) {
        window.resetPasswordManager = new ResetPasswordManager();
    }
});







