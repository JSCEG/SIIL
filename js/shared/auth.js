(function () {
    const STORAGE_KEYS = {
        session: 'siil_session',
        currentUser: 'current_user'
    };

    const DEFAULT_ALLOWED_ROLES = ['admin'];

    function hasPlaceholderValue(value) {
        return typeof value === 'string' && (value.includes('TU-PROYECTO') || value.includes('TU_SUPABASE_ANON_KEY'));
    }

    function getConfig() {
        const config = window.SIIL_CONFIG?.supabase;
        if (!config?.url || !config?.anonKey) {
            return null;
        }

        return {
            url: String(config.url).replace(/\/+$/, ''),
            anonKey: config.anonKey,
            allowedRoles: Array.isArray(config.allowedRoles) && config.allowedRoles.length > 0
                ? config.allowedRoles
                : DEFAULT_ALLOWED_ROLES,
            recoveryRedirectUrl: config.recoveryRedirectUrl || ''
        };
    }

    function validateConfig(config) {
        if (!config) {
            throw new Error('Falta configurar Supabase en config.js');
        }

        if (hasPlaceholderValue(config.url) || hasPlaceholderValue(config.anonKey)) {
            throw new Error('config.js aun tiene valores de ejemplo. Reemplace la URL y la anon key reales de Supabase.');
        }
    }

    function getStorage(rememberMe) {
        return rememberMe ? localStorage : sessionStorage;
    }

    async function parseResponse(response) {
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = payload?.msg || payload?.error_description || payload?.message || 'No fue posible completar la operacion.';

            if (message === 'Invalid login credentials' || message === 'Email not confirmed') {
                throw new Error('Usuario o contrasena incorrectos.');
            }

            if (message === 'email rate limit exceeded') {
                throw new Error('Ya se envio un correo de recuperacion recientemente. Espere unos minutos antes de intentarlo de nuevo.');
            }

            throw new Error(message);
        }

        return payload;
    }

    async function request(path, options = {}) {
        const config = getConfig();
        validateConfig(config);

        try {
            const response = await fetch(`${config.url}${path}`, {
                ...options,
                headers: {
                    apikey: config.anonKey,
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });

            return parseResponse(response);
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('No se pudo conectar con Supabase. Revise la URL del proyecto, la anon key y que este abriendo la app por http://localhost.');
            }

            throw error;
        }
    }

    function getProfileSelect() {
        return 'id,correo,nombre,rol,institucion,proyectos,activo';
    }

    async function fetchProfile(userId, accessToken) {
        const config = getConfig();
        validateConfig(config);

        try {
            const response = await fetch(
                `${config.url}/rest/v1/usuarios?id=eq.${encodeURIComponent(userId)}&select=${getProfileSelect()}`,
                {
                    headers: {
                        apikey: config.anonKey,
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const payload = await parseResponse(response);
            return Array.isArray(payload) ? payload[0] || null : null;
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('No se pudo consultar el perfil del usuario en Supabase. Revise conectividad y configuracion.');
            }

            throw error;
        }
    }

    function buildSessionPayload(authData, profile) {
        return {
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_at: authData.expires_at,
            expires_in: authData.expires_in,
            token_type: authData.token_type,
            user: {
                id: profile.id,
                email: profile.correo,
                name: profile.nombre,
                role: profile.rol,
                institucion: profile.institucion || '',
                proyectos: Array.isArray(profile.proyectos) ? profile.proyectos : [],
                active: profile.activo !== false
            }
        };
    }

    function saveSession(sessionPayload, rememberMe) {
        const storage = getStorage(rememberMe);
        clearSession();
        storage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionPayload));
        storage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(sessionPayload.user));
    }

    function readSession() {
        const raw = sessionStorage.getItem(STORAGE_KEYS.session) || localStorage.getItem(STORAGE_KEYS.session);
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (_error) {
            clearSession();
            return null;
        }
    }

    function isExpired(sessionPayload) {
        if (!sessionPayload?.expires_at) {
            return true;
        }

        return Date.now() >= sessionPayload.expires_at * 1000;
    }

    function clearSession() {
        sessionStorage.removeItem(STORAGE_KEYS.session);
        sessionStorage.removeItem(STORAGE_KEYS.currentUser);
        localStorage.removeItem(STORAGE_KEYS.session);
        localStorage.removeItem(STORAGE_KEYS.currentUser);
    }

    async function signInWithPassword(email, password, rememberMe) {
        const authData = await request('/auth/v1/token?grant_type=password', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });

        const profile = await fetchProfile(authData.user.id, authData.access_token);
        if (!profile) {
            throw new Error('No existe perfil SIIL para este usuario.');
        }

        if (profile.activo === false) {
            throw new Error('La cuenta esta inactiva. Contacte al administrador.');
        }

        const allowedRoles = getConfig().allowedRoles;
        if (!allowedRoles.includes(profile.rol)) {
            throw new Error('Su cuenta no tiene permisos para acceder a esta aplicacion.');
        }

        const sessionPayload = buildSessionPayload(authData, profile);
        saveSession(sessionPayload, rememberMe);
        return sessionPayload.user;
    }

    async function sendPasswordReset(email, redirectTo) {
        const recoverPath = redirectTo
            ? `/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`
            : '/auth/v1/recover';

        return request(recoverPath, {
            method: 'POST',
            body: JSON.stringify({
                email
            })
        });
    }

    function parseHashParams() {
        const hash = window.location.hash ? window.location.hash.slice(1) : '';
        return new URLSearchParams(hash);
    }

    function parseSearchParams() {
        return new URLSearchParams(window.location.search);
    }

    async function establishRecoverySessionFromUrl() {
        const hashParams = parseHashParams();
        const searchParams = parseSearchParams();

        const hashAccessToken = hashParams.get('access_token');
        if (hashAccessToken) {
            return {
                access_token: hashAccessToken,
                refresh_token: hashParams.get('refresh_token') || '',
                expires_at: Number(hashParams.get('expires_at') || 0),
                expires_in: Number(hashParams.get('expires_in') || 0),
                token_type: hashParams.get('token_type') || 'bearer',
                type: hashParams.get('type') || 'recovery'
            };
        }

        const searchAccessToken = searchParams.get('access_token');
        if (searchAccessToken) {
            return {
                access_token: searchAccessToken,
                refresh_token: searchParams.get('refresh_token') || '',
                expires_at: Number(searchParams.get('expires_at') || 0),
                expires_in: Number(searchParams.get('expires_in') || 0),
                token_type: searchParams.get('token_type') || 'bearer',
                type: searchParams.get('type') || 'recovery'
            };
        }

        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        if (tokenHash && type) {
            const payload = await request('/auth/v1/verify', {
                method: 'POST',
                body: JSON.stringify({
                    type,
                    token_hash: tokenHash
                })
            });

            return payload?.access_token ? payload : payload?.session || null;
        }

        return null;
    }

    async function updatePassword(newPassword, accessToken) {
        const config = getConfig();
        validateConfig(config);

        try {
            const response = await fetch(`${config.url}/auth/v1/user`, {
                method: 'PUT',
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: newPassword
                })
            });

            return parseResponse(response);
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error('No se pudo actualizar la contrasena porque no hay conexion valida con Supabase.');
            }

            throw error;
        }
    }

    async function signOut() {
        const sessionPayload = readSession();

        try {
            if (sessionPayload?.access_token) {
                await request('/auth/v1/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${sessionPayload.access_token}`
                    }
                });
            }
        } catch (_error) {
        } finally {
            clearSession();
        }
    }

    function getCurrentUser() {
        const raw = sessionStorage.getItem(STORAGE_KEYS.currentUser) || localStorage.getItem(STORAGE_KEYS.currentUser);
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (_error) {
            clearSession();
            return null;
        }
    }

    function isAuthenticated() {
        const sessionPayload = readSession();
        if (!sessionPayload || isExpired(sessionPayload)) {
            clearSession();
            return false;
        }

        return true;
    }

    function hasRole(requiredRole) {
        const user = getCurrentUser();
        return Boolean(user && user.role === requiredRole);
    }

    function requireAuth(options = {}) {
        const { redirectTo = 'login.html', allowedRoles = getConfig()?.allowedRoles || DEFAULT_ALLOWED_ROLES } = options;

        if (!isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }

        const user = getCurrentUser();
        if (!user || !allowedRoles.includes(user.role)) {
            clearSession();
            window.location.href = redirectTo;
            return false;
        }

        return true;
    }

    function isPublicPage() {
        const path = window.location.pathname;
        return document.getElementById('loginForm') !== null
            || /(^|\/)login(_backup)?\.html$/i.test(path)
            || /(^|\/)reset-password\.html$/i.test(path);
    }

    window.AuthService = {
        clearSession,
        establishRecoverySessionFromUrl,
        getConfig,
        getCurrentUser,
        hasRole,
        isAuthenticated,
        readSession,
        requireAuth,
        sendPasswordReset,
        signInWithPassword,
        signOut,
        updatePassword
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (isPublicPage()) {
            return;
        }

        if (!requireAuth()) {
            return;
        }

        displayUserInfo();
    });

    function displayUserInfo() {
        const userInfoElements = document.querySelectorAll('[data-user-info]');
        const currentUser = getCurrentUser();

        if (currentUser && userInfoElements.length > 0) {
            userInfoElements.forEach((element) => {
                const infoType = element.getAttribute('data-user-info');
                switch (infoType) {
                    case 'name':
                        element.textContent = currentUser.name || currentUser.email;
                        break;
                    case 'role':
                        element.textContent = currentUser.role || 'Usuario';
                        break;
                    case 'username':
                        element.textContent = currentUser.email;
                        break;
                    default:
                        element.textContent = currentUser.name || currentUser.email;
                }
            });
        }
    }

    function checkPermission(requiredRole) {
        return hasRole(requiredRole);
    }

    function showAccessDenied() {
        if (typeof Modal !== 'undefined') {
            Modal.alert({
                title: 'Acceso denegado',
                message: 'No tiene los permisos necesarios para acceder a esta funcion. Si cree que esto es un error, contacte al administrador.',
                type: 'danger',
                buttonText: 'Entendido'
            });
        } else {
            alert('Acceso denegado\n\nNo tiene los permisos necesarios para acceder a esta funcion.');
        }
    }

    function protectAction(action, requiredRole) {
        return function (...args) {
            if (!checkPermission(requiredRole)) {
                showAccessDenied();
                return;
            }
            return action.apply(this, args);
        };
    }

    window.AuthUtils = {
        isAuthenticated,
        getCurrentUser,
        checkPermission,
        showAccessDenied,
        protectAction
    };
}());






