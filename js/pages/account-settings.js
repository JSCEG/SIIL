(function () {
    const MIN_PASSWORD_LENGTH = 8;

    function getElements() {
        return {
            form: document.getElementById('accountPasswordForm'),
            message: document.getElementById('accountMessage'),
            submitButton: document.getElementById('accountSubmitButton'),
            newPassword: document.getElementById('newPassword'),
            confirmPassword: document.getElementById('confirmPassword'),
            profile: {
                name: document.getElementById('accountName'),
                email: document.getElementById('accountEmail'),
                role: document.getElementById('accountRole'),
                institution: document.getElementById('accountInstitution'),
                projects: document.getElementById('accountProjects')
            },
            hero: {
                email: document.getElementById('accountHeroEmail'),
                role: document.getElementById('accountHeroRole'),
                institution: document.getElementById('accountHeroInstitution')
            }
        };
    }

    function setMessage(elements, text, type) {
        elements.message.textContent = text;
        elements.message.className = `account-message is-visible is-${type}`;
    }

    function clearMessage(elements) {
        elements.message.textContent = '';
        elements.message.className = 'account-message';
    }

    function fillUserData(elements, user) {
        const projects = Array.isArray(user?.proyectos) && user.proyectos.length > 0
            ? user.proyectos.join(', ')
            : 'Sin dato';
        const institution = user?.institucion || 'Sin dato';
        const name = user?.name || user?.email || 'Usuario SIIL';
        const email = user?.email || 'Sin dato';
        const role = user?.role || 'Sin dato';

        elements.profile.name.textContent = name;
        elements.profile.email.textContent = email;
        elements.profile.role.textContent = role;
        elements.profile.institution.textContent = institution;
        elements.profile.projects.textContent = projects;
        elements.hero.email.textContent = email;
        elements.hero.role.textContent = role;
        elements.hero.institution.textContent = institution;
    }

    function validatePassword(newPassword, confirmPassword) {
        if (!newPassword || !confirmPassword) {
            throw new Error('Capture y confirme la nueva contraseña.');
        }

        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            throw new Error(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
        }

        if (newPassword !== confirmPassword) {
            throw new Error('La confirmación no coincide con la nueva contraseña.');
        }
    }

    async function handleSubmit(event, elements) {
        event.preventDefault();
        clearMessage(elements);

        try {
            const session = window.AuthService?.readSession?.();
            if (!session?.access_token) {
                throw new Error('La sesión actual no es válida. Inicie sesión de nuevo.');
            }

            const newPassword = elements.newPassword.value.trim();
            const confirmPassword = elements.confirmPassword.value.trim();
            validatePassword(newPassword, confirmPassword);

            elements.submitButton.disabled = true;
            setMessage(elements, 'Actualizando contraseña...', 'info');
            await window.AuthService.updatePassword(newPassword, session.access_token);
            elements.form.reset();
            setMessage(elements, 'La contraseña se actualizó correctamente.', 'success');
        } catch (error) {
            setMessage(elements, error.message || 'No fue posible actualizar la contraseña.', 'error');
        } finally {
            elements.submitButton.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!window.AuthService?.requireAuth?.()) {
            return;
        }

        const elements = getElements();
        const user = window.AuthService.getCurrentUser();
        fillUserData(elements, user);
        elements.form.addEventListener('submit', (event) => handleSubmit(event, elements));
    });
}());
