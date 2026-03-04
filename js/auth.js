/**
 * Authentication utility for SIIL Document Manager
 * Use this to protect pages that require authentication
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = document.getElementById('loginForm') !== null || /(^|\/)login(_backup)?\.html$/i.test(window.location.pathname);
    if (isLoginPage) {
        return;
    }

    if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        console.log('User not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }

    // Display user info if element exists
    displayUserInfo();
});

function isAuthenticated() {
    const session = sessionStorage.getItem('siil_session') || localStorage.getItem('siil_session');
    
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        return new Date(sessionData.expiresAt) > new Date();
    } catch (error) {
        return false;
    }
}

function getCurrentUser() {
    const userData = sessionStorage.getItem('current_user');
    
    if (!userData) return null;
    
    try {
        return JSON.parse(userData);
    } catch (error) {
        return null;
    }
}

function displayUserInfo() {
    const userInfoElements = document.querySelectorAll('[data-user-info]');
    const currentUser = getCurrentUser();

    if (currentUser && userInfoElements.length > 0) {
        userInfoElements.forEach(element => {
            const infoType = element.getAttribute('data-user-info');
            switch (infoType) {
                case 'name':
                    element.textContent = currentUser.name || currentUser.username;
                    break;
                case 'role':
                    element.textContent = currentUser.role || 'Usuario';
                    break;
                case 'username':
                    element.textContent = currentUser.username;
                    break;
                default:
                    element.textContent = currentUser.name || currentUser.username;
            }
        });
    }
}

// Utility function to check permissions
function checkPermission(requiredRole) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const roleHierarchy = {
        'viewer': 1,
        'user': 2,
        'administrator': 3
    };

    const userLevel = roleHierarchy[currentUser.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
}

// Function to show access denied message
function showAccessDenied() {
    // Use Modal if available, otherwise use native alert
    if (typeof Modal !== 'undefined') {
        Modal.alert({
            title: 'Acceso Denegado',
            message: 'No tiene los permisos necesarios para acceder a esta función. Si cree que esto es un error, contacte al administrador.',
            type: 'danger',
            buttonText: 'Entendido'
        });
    } else {
        alert('Acceso Denegado\n\nNo tiene los permisos necesarios para acceder a esta función.');
    }
}

// Function to protect specific actions
function protectAction(action, requiredRole) {
    return function (...args) {
        if (!checkPermission(requiredRole)) {
            showAccessDenied();
            return;
        }
        return action.apply(this, args);
    };
}

// Export functions for global use
window.AuthUtils = {
    isAuthenticated,
    getCurrentUser,
    checkPermission,
    showAccessDenied,
    protectAction
};
