/**
 * Login functionality for SIIL Document Manager
 * Handles authentication, session management, and form validation
 */

const ICONS = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>`
};

class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPasswordToggle();
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const inputs = document.querySelectorAll('#email, #password');
        inputs.forEach((input) => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin(e);
                }
            });
        });

        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (event) => this.handlePasswordReset(event));
        }
    }

    setupPasswordToggle() {
        const toggleButton = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');

        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                toggleButton.innerHTML = type === 'password' ? ICONS.eye : ICONS.eyeOff;
            });
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const rememberMeElement = document.querySelector('input[name="remember"]');
        const rememberMe = rememberMeElement ? rememberMeElement.checked : false;

        this.hideError();

        if (!this.validateInputs(email, password)) {
            return;
        }

        this.setLoadingState(true, 'Iniciando sesion', 'Verificando credenciales');

        try {
            await window.AuthService.signInWithPassword(email, password, rememberMe);
            this.redirectToDashboard();
        } catch (error) {
            this.showError(error.message || 'Error al conectar con el servidor. Por favor, intente nuevamente.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async handlePasswordReset(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        this.hideError();

        if (!window.AuthService?.getConfig()) {
            this.showError('Configure Supabase en config.local.js antes de iniciar sesion.');
            return;
        }

        if (!email || !this.isValidEmail(email)) {
            this.showError('Capture un correo institucional valido para enviar la recuperacion.');
            document.getElementById('email').focus();
            return;
        }

        this.setLoadingState(true, 'Enviando correo', 'Generando enlace de recuperacion');

        try {
            const authConfig = window.AuthService.getConfig();
            const redirectTo = authConfig?.recoveryRedirectUrl || new URL('reset-password.html', window.location.href).toString();
            await window.AuthService.sendPasswordReset(email, redirectTo);

            this.setLoadingState(false);

            if (window.Modal) {
                await window.Modal.alert({
                    title: 'Correo enviado',
                    message: 'Revise su bandeja de entrada. El enlace de recuperacion lo llevara a la pagina para definir una nueva contrasena.',
                    type: 'success',
                    buttonText: 'Entendido'
                });
            }

            return;
        } catch (error) {
            this.showError(error.message || 'No fue posible enviar el correo de recuperacion.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateInputs(email, password) {
        if (!window.AuthService?.getConfig()) {
            this.showError('Configure Supabase en config.local.js antes de iniciar sesion.');
            return false;
        }

        if (!email) {
            this.showError('Por favor ingrese su correo institucional');
            document.getElementById('email').focus();
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Ingrese un correo electronico valido.');
            document.getElementById('email').focus();
            return false;
        }

        if (!password) {
            this.showError('Por favor ingrese su contrasena');
            document.getElementById('password').focus();
            return false;
        }

        if (password.length < 6) {
            this.showError('La contrasena debe tener al menos 6 caracteres');
            document.getElementById('password').focus();
            return false;
        }

        return true;
    }

    redirectToDashboard() {
        window.location.href = 'index.html';
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'flex';

            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    setLoadingState(loading, title = 'Iniciando sesion', message = 'Verificando credenciales') {
        const loginButton = document.querySelector('.btn-login');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        if (loading) {
            Preloader.show(title, message);
            if (loginButton) {
                loginButton.disabled = true;
            }
            if (emailInput) {
                emailInput.disabled = true;
            }
            if (passwordInput) {
                passwordInput.disabled = true;
            }
            if (forgotPasswordLink) {
                forgotPasswordLink.style.pointerEvents = 'none';
                forgotPasswordLink.style.opacity = '0.6';
            }
        } else {
            Preloader.hide();
            if (loginButton) {
                loginButton.disabled = false;
            }
            if (emailInput) {
                emailInput.disabled = false;
            }
            if (passwordInput) {
                passwordInput.disabled = false;
            }
            if (forgotPasswordLink) {
                forgotPasswordLink.style.pointerEvents = '';
                forgotPasswordLink.style.opacity = '';
            }
        }
    }

    static isAuthenticated() {
        return Boolean(window.AuthService?.isAuthenticated());
    }

    static getCurrentUser() {
        return window.AuthService?.getCurrentUser() || null;
    }

    static async logout() {
        if (window.AuthService) {
            await window.AuthService.signOut();
        }

        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        window.loginManager = new LoginManager();
    }
});

window.LoginManager = LoginManager;








