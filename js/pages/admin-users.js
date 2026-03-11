(function () {
    const ROLES = ['admin', 'coordinador', 'geologo', 'operador_campo', 'tecnico_lab'];
    const USERS_PAGE_SIZE = 8;

    const FEATURE_LABELS = {
        map_view: 'Mapa',
        operations_log: 'Bitacora operativa',
        results_view: 'Resultados',
        role_access: 'Roles y accesos',
        sample_registry: 'Registro de muestras',
        security_policy: 'Politicas de seguridad',
        user_accounts: 'Usuarios y cuentas'
    };

    class UserAdminPage {
        constructor() {
            this.state = {
                users: [],
                roleFeatures: {},
                editingUserId: null,
                currentUsersPage: 1
            };

            this.elements = {
                tableBody: document.getElementById('usersTableBody'),
                emptyState: document.getElementById('usersEmptyState'),
                pagination: document.getElementById('usersPagination'),
                form: document.getElementById('userForm'),
                message: document.getElementById('adminMessage'),
                count: document.getElementById('usersCount'),
                roleCount: document.getElementById('rolesCount'),
                activeCount: document.getElementById('activeCount'),
                securityCount: document.getElementById('securityCount'),
                formTitle: document.getElementById('formTitle'),
                submitButton: document.getElementById('userSubmitButton'),
                cancelButton: document.getElementById('cancelEditButton'),
                fields: {
                    id: document.getElementById('userId'),
                    correo: document.getElementById('userCorreo'),
                    nombre: document.getElementById('userNombre'),
                    rol: document.getElementById('userRol'),
                    institucion: document.getElementById('userInstitucion'),
                    proyectos: document.getElementById('userProyectos'),
                    activo: document.getElementById('userActivo')
                }
            };
        }

        async init() {
            const user = window.AuthService?.getCurrentUser();
            if (!user || user.role !== 'admin') {
                window.location.href = 'index.html';
                return;
            }

            this.populateRoleOptions();
            this.bindEvents();
            this.resetForm();
            await this.loadData();
        }

        populateRoleOptions() {
            this.elements.fields.rol.innerHTML = ROLES.map((role) => `<option value="${role}">${role}</option>`).join('');
        }

        bindEvents() {
            this.elements.form.addEventListener('submit', (event) => this.handleSubmit(event));
            this.elements.cancelButton.addEventListener('click', () => this.resetForm());
        }

        getConfig() {
            const session = window.AuthService.readSession();
            const config = window.AuthService.getConfig();
            return {
                config,
                headers: {
                    apikey: config.anonKey,
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            };
        }

        getAccessRedirectUrl() {
            const config = window.AuthService.getConfig();
            return config.recoveryRedirectUrl || new URL('reset-password.html', window.location.href).toString();
        }

        async callAdminFunction(payload) {
            const { config, headers } = this.getConfig();
            const response = await fetch(`${config.url}/functions/v1/admin-users`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.error || data?.message || 'La operacion administrativa fallo.');
            }

            return data;
        }

        async loadData() {
            this.setMessage('Cargando usuarios y permisos...', 'info');

            try {
                const { config, headers } = this.getConfig();
                const [usersResponse, featuresResponse] = await Promise.all([
                    fetch(`${config.url}/rest/v1/usuarios?select=id,correo,nombre,rol,institucion,proyectos,activo,created_at,updated_at&order=nombre.asc`, { headers }),
                    fetch(`${config.url}/rest/v1/role_features?select=role_name,feature_key,enabled&enabled=eq.true&order=role_name.asc`, { headers })
                ]);

                const users = await usersResponse.json();
                const features = await featuresResponse.json();

                if (!usersResponse.ok) {
                    throw new Error(users?.message || 'No fue posible cargar los usuarios.');
                }

                if (!featuresResponse.ok) {
                    throw new Error(features?.message || 'No fue posible cargar la matriz de permisos.');
                }

                this.state.users = Array.isArray(users) ? users : [];
                this.state.roleFeatures = this.groupFeatures(Array.isArray(features) ? features : []);
                this.state.currentUsersPage = 1;
                this.render();
                this.setMessage('Administracion de cuentas lista.', 'success');
            } catch (error) {
                this.setMessage(error.message || 'No fue posible cargar la administracion de usuarios.', 'error');
            }
        }

        groupFeatures(rows) {
            return rows.reduce((accumulator, row) => {
                if (!accumulator[row.role_name]) {
                    accumulator[row.role_name] = [];
                }

                accumulator[row.role_name].push(row.feature_key);
                return accumulator;
            }, {});
        }

        render() {
            this.renderCounters();
            this.renderTable();
            this.renderPagination();
        }

        renderCounters() {
            const activeUsers = this.state.users.filter((user) => user.activo !== false).length;
            this.elements.count.textContent = String(this.state.users.length);
            this.elements.roleCount.textContent = String(new Set(this.state.users.map((user) => user.rol)).size);
            this.elements.activeCount.textContent = String(activeUsers);
            this.elements.securityCount.textContent = String(this.state.roleFeatures.admin?.length || 0);
        }

        getPaginatedUsers() {
            const total = this.state.users.length;
            const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE));
            const currentPage = Math.min(this.state.currentUsersPage, totalPages);
            const start = (currentPage - 1) * USERS_PAGE_SIZE;
            const end = start + USERS_PAGE_SIZE;

            return {
                total,
                totalPages,
                currentPage,
                start,
                end,
                rows: this.state.users.slice(start, end)
            };
        }

        renderTable() {
            const { tableBody, emptyState } = this.elements;
            tableBody.innerHTML = '';

            if (this.state.users.length === 0) {
                emptyState.style.display = 'block';
                return;
            }

            const page = this.getPaginatedUsers();
            this.state.currentUsersPage = page.currentPage;
            emptyState.style.display = 'none';
            tableBody.innerHTML = page.rows.map((user) => {
                const features = this.state.roleFeatures[user.rol] || [];
                const featureBadges = features.length > 0
                    ? features.map((feature) => `<span class="feature-badge">${this.getFeatureLabel(feature)}</span>`).join('')
                    : '<span class="feature-badge muted">Sin modulos</span>';

                return `
                    <tr>
                        <td>
                            <div class="user-primary">${this.escapeHtml(user.nombre)}</div>
                            <div class="user-secondary">${this.escapeHtml(user.correo)}</div>
                        </td>
                        <td><span class="role-pill">${this.escapeHtml(user.rol)}</span></td>
                        <td>${this.escapeHtml(user.institucion || 'Sin definir')}</td>
                        <td>${featureBadges}</td>
                        <td>
                            <span class="status-pill ${user.activo !== false ? 'is-active' : 'is-inactive'}">
                                ${user.activo !== false ? 'Activa' : 'Inactiva'}
                            </span>
                        </td>
                        <td class="table-actions">
                            <button type="button" class="table-btn" data-action="edit" data-id="${user.id}">Editar</button>
                            <button type="button" class="table-btn alt" data-action="toggle" data-id="${user.id}">${user.activo !== false ? 'Desactivar' : 'Activar'}</button>
                            <button type="button" class="table-btn alt" data-action="reset" data-id="${user.id}">Enviar acceso</button>
                        </td>
                    </tr>
                `;
            }).join('');

            tableBody.querySelectorAll('[data-action="edit"]').forEach((button) => {
                button.addEventListener('click', () => this.startEdit(button.dataset.id));
            });

            tableBody.querySelectorAll('[data-action="toggle"]').forEach((button) => {
                button.addEventListener('click', () => this.toggleUserStatus(button.dataset.id));
            });

            tableBody.querySelectorAll('[data-action="reset"]').forEach((button) => {
                button.addEventListener('click', () => this.sendAccessLink(button.dataset.id));
            });
        }

        renderPagination() {
            const container = this.elements.pagination;
            if (!container) {
                return;
            }

            if (this.state.users.length === 0) {
                container.innerHTML = '';
                return;
            }

            const page = this.getPaginatedUsers();
            const from = page.start + 1;
            const to = Math.min(page.end, page.total);

            container.innerHTML = `
                <div class="table-pagination__info">Mostrando ${from}-${to} de ${page.total} cuentas</div>
                <div class="table-pagination__actions">
                    <button type="button" class="table-pagination__button" data-page-action="prev" ${page.currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                    <span class="table-pagination__page">Página ${page.currentPage} de ${page.totalPages}</span>
                    <button type="button" class="table-pagination__button" data-page-action="next" ${page.currentPage === page.totalPages ? 'disabled' : ''}>Siguiente</button>
                </div>
            `;

            container.querySelector('[data-page-action="prev"]')?.addEventListener('click', () => {
                if (this.state.currentUsersPage > 1) {
                    this.state.currentUsersPage -= 1;
                    this.renderTable();
                    this.renderPagination();
                }
            });

            container.querySelector('[data-page-action="next"]')?.addEventListener('click', () => {
                if (this.state.currentUsersPage < page.totalPages) {
                    this.state.currentUsersPage += 1;
                    this.renderTable();
                    this.renderPagination();
                }
            });
        }

        startEdit(userId) {
            const user = this.state.users.find((item) => item.id === userId);
            if (!user) {
                return;
            }

            this.state.editingUserId = userId;
            this.elements.formTitle.textContent = 'Editar cuenta';
            this.elements.submitButton.textContent = 'Guardar cambios';
            this.elements.cancelButton.hidden = false;
            this.elements.fields.id.value = user.id;
            this.elements.fields.correo.value = user.correo;
            this.elements.fields.nombre.value = user.nombre;
            this.elements.fields.rol.value = user.rol;
            this.elements.fields.institucion.value = user.institucion || '';
            this.elements.fields.proyectos.value = Array.isArray(user.proyectos) ? user.proyectos.join(', ') : '';
            this.elements.fields.activo.checked = user.activo !== false;
        }

        resetForm() {
            this.state.editingUserId = null;
            this.elements.form.reset();
            this.elements.fields.id.value = '';
            this.elements.formTitle.textContent = 'Alta de cuenta';
            this.elements.submitButton.textContent = 'Crear e invitar';
            this.elements.cancelButton.hidden = true;
            this.elements.fields.activo.checked = true;
        }

        buildPayload() {
            return {
                id: this.elements.fields.id.value.trim(),
                correo: this.elements.fields.correo.value.trim().toLowerCase(),
                nombre: this.elements.fields.nombre.value.trim(),
                rol: this.elements.fields.rol.value,
                institucion: this.elements.fields.institucion.value.trim(),
                proyectos: this.elements.fields.proyectos.value
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                activo: this.elements.fields.activo.checked
            };
        }

        async handleSubmit(event) {
            event.preventDefault();
            const payload = this.buildPayload();
            const isEditing = Boolean(this.state.editingUserId);

            if (!payload.correo || !payload.nombre || !payload.rol) {
                await this.showActionAlert('Validación requerida', 'Correo, nombre y rol son obligatorios.', 'warning');
                return;
            }

            if (isEditing && !payload.id) {
                await this.showActionAlert('Validación requerida', 'El ID del usuario a editar es obligatorio.', 'warning');
                return;
            }

            const shouldContinue = await this.confirmAction(
                isEditing ? 'Confirmar actualización' : 'Confirmar alta e invitación',
                isEditing
                    ? `Se actualizará la cuenta ${payload.correo}.`
                    : `Se creará la cuenta ${payload.correo} y se enviará un enlace para definir contraseña.`,
                'warning',
                isEditing ? 'Guardar cambios' : 'Crear e invitar'
            );

            if (!shouldContinue) {
                return;
            }

            try {
                const response = await this.callAdminFunction({
                    action: isEditing ? 'update' : 'create',
                    ...payload,
                    redirectTo: this.getAccessRedirectUrl(),
                    viewName: 'dashboard.html'
                });

                this.resetForm();
                await this.loadData();
                await this.showActionAlert(
                    isEditing ? 'Cuenta actualizada' : 'Cuenta creada',
                    response.message || (isEditing ? 'La cuenta se actualizó correctamente.' : 'La cuenta se creó y se envió la invitación de acceso.'),
                    response.warning ? 'warning' : 'success'
                );
            } catch (error) {
                await this.showActionAlert('No fue posible guardar la cuenta', error.message || 'No fue posible guardar la cuenta.', 'danger');
            }
        }

        async toggleUserStatus(userId) {
            const user = this.state.users.find((item) => item.id === userId);
            if (!user) {
                return;
            }

            const nextActiveState = !(user.activo !== false);
            const shouldContinue = await this.confirmAction(
                nextActiveState ? 'Confirmar activación' : 'Confirmar desactivación',
                nextActiveState
                    ? `Se activará la cuenta ${user.correo}. Si corresponde, podrá reenviarse el acceso.`
                    : `Se desactivará la cuenta ${user.correo} y dejará de poder ingresar a SIIL.`,
                nextActiveState ? 'warning' : 'danger',
                nextActiveState ? 'Activar cuenta' : 'Desactivar cuenta'
            );

            if (!shouldContinue) {
                return;
            }

            try {
                const response = await this.callAdminFunction({
                    action: 'toggle',
                    id: userId,
                    activo: nextActiveState,
                    redirectTo: nextActiveState ? this.getAccessRedirectUrl() : '',
                    viewName: 'dashboard.html'
                });

                await this.loadData();
                await this.showActionAlert(
                    nextActiveState ? 'Cuenta activada' : 'Cuenta desactivada',
                    response.message || 'Estado de cuenta actualizado.',
                    response.warning ? 'warning' : 'success'
                );
            } catch (error) {
                await this.showActionAlert('No fue posible actualizar la cuenta', error.message || 'No fue posible actualizar el estado de la cuenta.', 'danger');
            }
        }

        async sendAccessLink(userId) {
            const user = this.state.users.find((item) => item.id === userId);
            if (!user) {
                return;
            }

            const shouldContinue = await this.confirmAction(
                'Enviar enlace de acceso',
                `Se enviará un correo a ${user.correo} para definir o restablecer su contraseña de acceso a SIIL.`,
                'warning',
                'Enviar enlace'
            );

            if (!shouldContinue) {
                return;
            }

            try {
                const response = await this.callAdminFunction({
                    action: 'reset_password',
                    id: userId,
                    redirectTo: this.getAccessRedirectUrl(),
                    viewName: 'dashboard.html'
                });

                await this.showActionAlert('Enlace enviado', response.message || 'Enlace de acceso enviado.', 'success');
            } catch (error) {
                await this.showActionAlert('No fue posible generar el enlace', error.message || 'No fue posible generar el enlace de acceso.', 'danger');
            }
        }

        getFeatureLabel(featureKey) {
            return FEATURE_LABELS[featureKey] || featureKey;
        }

        async showActionAlert(title, message, type = 'info') {
            if (window.Modal?.alert) {
                await window.Modal.alert({
                    title,
                    message,
                    type,
                    buttonText: 'Entendido'
                });
                return;
            }
            this.setMessage(message, type);
        }

        async confirmAction(title, message, type = 'warning', confirmText = 'Confirmar') {
            if (window.Modal?.confirm) {
                return window.Modal.confirm({
                    title,
                    message,
                    type,
                    confirmText,
                    cancelText: 'Cancelar',
                    danger: type === 'danger'
                });
            }
            return window.confirm(message);
        }

        setMessage(message, type) {
            this.elements.message.textContent = message;
            this.elements.message.className = `admin-message ${type}`;
        }

        escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const page = new UserAdminPage();
        page.init();
    });
}());




