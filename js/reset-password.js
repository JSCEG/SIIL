class ResetPasswordManager {
    constructor() {
        this.form = document.getElementById('resetPasswordForm');
        this.statusBox = document.getElementById('statusMessage');
        this.passwordInput = document.getElementById('newPassword');
        this.confirmInput = document.getElementById('confirmPassword');
        this.submitButton = this.form?.querySelector('button[type="submit"]') || null;
        this.recoverySession = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.bootstrapRecovery();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        }
    }

    async bootstrapRecovery() {
        this.setLoading(true, 'Validando enlace', 'Comprobando token de recuperacion');
        this.hideStatus();

        try {
            this.recoverySession = await Promise.race([
                window.AuthService.establishRecoverySessionFromUrl(),
                new Promise((_, reject) => {
                    window.setTimeout(() => {
                        reject(new Error('La validacion del enlace tardo demasiado. Recargue la pagina o solicite un nuevo correo de recuperacion.'));
                    }, 10000);
                })
            ]);

            if (!this.recoverySession?.access_token) {
                throw new Error('El enlace de recuperacion no es valido o ya expiro. Solicite uno nuevo desde el login.');
            }

            this.setStatus('Enlace valido. Ya puede definir una nueva contrasena.', 'success');
        } catch (error) {
            console.error('Recovery bootstrap error:', error);
            this.setStatus(error.message || 'No fue posible validar el enlace de recuperacion.', 'error');
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
            this.setStatus('No hay una sesion de recuperacion valida. Solicite un nuevo enlace.', 'error');
            return;
        }

        const password = this.passwordInput.value;
        const confirmPassword = this.confirmInput.value;
        const validationMessage = this.validate(password, confirmPassword);
        if (validationMessage) {
            this.setStatus(validationMessage, 'error');
            return;
        }

        this.setLoading(true, 'Actualizando contrasena', 'Guardando nueva credencial');

        try {
            await window.AuthService.updatePassword(password, this.recoverySession.access_token);
            await window.AuthService.signOut();
            this.setLoading(false);

            if (window.Modal) {
                await window.Modal.alert({
                    title: 'Contrasena actualizada',
                    message: 'La contrasena se actualizo correctamente. Inicie sesion nuevamente con la nueva credencial.',
                    type: 'success',
                    buttonText: 'Ir al login'
                });
            }

            window.location.href = 'login.html';
            return;
        } catch (error) {
            console.error('Update password error:', error);
            this.setStatus(error.message || 'No fue posible actualizar la contrasena.', 'error');
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
