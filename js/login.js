/**
 * Login functionality for SIIL Document Manager
 * Handles authentication, session management, and form validation
 */

// SVG Icons for zero-dependency implementation
const ICONS = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>`,
    spinner: `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
};

class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        // this.checkExistingSession(); // Disabled to prevent redirect loops
        this.setupPasswordToggle();
        
        // Ensure session is cleared when visiting login page to prevent issues
        // But only if we are truly on login page (which we are, due to the init check)
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Handle Enter key on inputs
        const inputs = document.querySelectorAll('#username, #password');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin(e);
                }
            });
        });
    }

    setupPasswordToggle() {
        const toggleButton = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');
        
        if (toggleButton && passwordInput) {
            toggleButton.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Toggle SVG content
                toggleButton.innerHTML = type === 'password' ? ICONS.eye : ICONS.eyeOff;
            });
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMeElement = document.getElementById('rememberMe');
        const rememberMe = rememberMeElement ? rememberMeElement.checked : false;
        
        // Clear previous errors
        this.hideError();
        
        // Validate inputs
        if (!this.validateInputs(username, password)) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate API call (replace with actual API endpoint)
            const response = await this.authenticateUser(username, password);
            
            if (response.success) {
                // Store session
                this.storeSession(response.user, rememberMe);
                
                // Redirect to dashboard
                this.redirectToDashboard();
            } else {
                this.showError(response.message || 'Usuario o contraseña incorrectos');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Error al conectar con el servidor. Por favor, intente nuevamente.');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateInputs(username, password) {
        if (!username) {
            this.showError('Por favor ingrese su usuario');
            document.getElementById('username').focus();
            return false;
        }
        
        if (!password) {
            this.showError('Por favor ingrese su contraseña');
            document.getElementById('password').focus();
            return false;
        }
        
        if (password.length < 6) {
            this.showError('La contraseña debe tener al menos 6 caracteres');
            document.getElementById('password').focus();
            return false;
        }
        
        return true;
    }

    async authenticateUser(username, password) {
        // Simulate API call - Replace with actual endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock authentication logic
                const validUsers = [
                    { username: 'admin', password: 'admin123', role: 'administrator' },
                    { username: 'usuario', password: 'user123', role: 'user' },
                    { username: 'demo', password: 'demo123', role: 'viewer' }
                ];
                
                const user = validUsers.find(u => u.username === username && u.password === password);
                
                if (user) {
                    resolve({
                        success: true,
                        user: {
                            username: user.username,
                            role: user.role,
                            name: this.getUserDisplayName(user.username),
                            email: `${user.username}@sener.gob.mx`,
                            lastLogin: new Date().toISOString()
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Usuario o contraseña incorrectos'
                    });
                }
            }, 1000); // Simulate network delay
        });
    }

    getUserDisplayName(username) {
        const names = {
            'admin': 'Administrador del Sistema',
            'usuario': 'Usuario General',
            'demo': 'Usuario Demo'
        };
        return names[username] || username;
    }

    storeSession(user, rememberMe) {
        const sessionData = {
            user: user,
            token: this.generateToken(),
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString() // 7 days if remember me, 1 day otherwise
        };
        
        if (rememberMe) {
            localStorage.setItem('siil_session', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('siil_session', JSON.stringify(sessionData));
        }
        
        // Store in both for consistency
        sessionStorage.setItem('current_user', JSON.stringify(user));
    }

    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    checkExistingSession() {
        // Check for existing session
        const session = sessionStorage.getItem('siil_session') || localStorage.getItem('siil_session');
        
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                
                // Check if session is expired
                if (new Date(sessionData.expiresAt) > new Date()) {
                    // Valid session found
                    // Only redirect if we are NOT already on the dashboard/index
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('index.html') && !currentPath.endsWith('/') && !currentPath.includes('dashboard.html')) {
                        this.redirectToDashboard();
                    }
                } else {
                    // Session expired, clear it
                    this.clearSession();
                }
            } catch (error) {
                console.error('Error checking session:', error);
                this.clearSession();
            }
        }
    }

    clearSession() {
        sessionStorage.removeItem('siil_session');
        sessionStorage.removeItem('current_user');
        localStorage.removeItem('siil_session');
    }

    redirectToDashboard() {
        // Redirect to main application
        window.location.href = 'index.html';
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'flex';
            
            // Auto-hide after 5 seconds
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

    setLoadingState(loading) {
        const loginButton = document.querySelector('.btn-login');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (loading) {
            // Mostrar preloader de pantalla completa
            Preloader.show('Iniciando sesión', 'Verificando credenciales');
            
            // Deshabilitar botón e inputs
            if (loginButton) loginButton.disabled = true;
            if (usernameInput) usernameInput.disabled = true;
            if (passwordInput) passwordInput.disabled = true;
        } else {
            // Ocultar preloader
            Preloader.hide();
            
            // Habilitar botón e inputs
            if (loginButton) loginButton.disabled = false;
            if (usernameInput) usernameInput.disabled = false;
            if (passwordInput) passwordInput.disabled = false;
        }
    }

    // Utility method to check if user is logged in (can be used in other pages)
    static isAuthenticated() {
        const session = sessionStorage.getItem('siil_session') || localStorage.getItem('siil_session');
        
        if (!session) return false;
        
        try {
            const sessionData = JSON.parse(session);
            return new Date(sessionData.expiresAt) > new Date();
        } catch (error) {
            return false;
        }
    }

    // Utility method to get current user
    static getCurrentUser() {
        const userData = sessionStorage.getItem('current_user');
        
        if (!userData) return null;
        
        try {
            return JSON.parse(userData);
        } catch (error) {
            return null;
        }
    }

    // Utility method to logout
    static logout() {
        sessionStorage.removeItem('siil_session');
        sessionStorage.removeItem('current_user');
        localStorage.removeItem('siil_session');
        window.location.href = 'login.html';
    }
}

// Initialize login manager when DOM is loaded, but only if we are on the login page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        window.loginManager = new LoginManager();
    }
});

// Export LoginManager class globally for potential use in hooks or other scripts
window.LoginManager = LoginManager;