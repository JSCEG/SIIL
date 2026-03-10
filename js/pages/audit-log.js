(function () {
    const AUDIT_PAGE_SIZE = 12;

    const ACTION_LABELS = {
        create: 'Alta',
        update: 'Edición',
        delete: 'Baja',
        activate: 'Activación',
        deactivate: 'Desactivación',
        reset_password: 'Recuperación'
    };

    const MODULE_LABELS = {
        user_accounts: 'Usuarios y cuentas',
        sample_registry: 'Registro de muestras y barrenos'
    };

    class AuditLogPage {
        constructor() {
            this.state = {
                auditLogs: [],
                currentPage: 1
            };

            this.elements = {
                message: document.getElementById('auditMessage'),
                auditTableBody: document.getElementById('auditTableBody'),
                auditEmptyState: document.getElementById('auditEmptyState'),
                auditCount: document.getElementById('auditCount'),
                auditPagination: document.getElementById('auditPagination'),
                auditActionFilter: document.getElementById('auditActionFilter'),
                auditModuleFilter: document.getElementById('auditModuleFilter'),
                auditUserFilter: document.getElementById('auditUserFilter'),
                auditDateFilter: document.getElementById('auditDateFilter'),
                clearAuditFilters: document.getElementById('clearAuditFilters')
            };
        }

        async init() {
            const user = window.AuthService?.getCurrentUser();
            if (!user || user.role !== 'admin') {
                window.location.href = 'index.html';
                return;
            }

            this.bindEvents();
            await this.loadAuditLog();
        }

        bindEvents() {
            this.elements.auditActionFilter.addEventListener('change', () => this.applyFilters());
            this.elements.auditModuleFilter?.addEventListener('change', () => this.applyFilters());
            this.elements.auditUserFilter.addEventListener('input', () => this.applyFilters());
            this.elements.auditDateFilter.addEventListener('change', () => this.applyFilters());
            this.elements.clearAuditFilters.addEventListener('click', () => this.clearFilters());
        }

        applyFilters() {
            this.state.currentPage = 1;
            this.renderAuditTable();
            this.renderPagination();
        }

        clearFilters() {
            this.elements.auditActionFilter.value = '';
            if (this.elements.auditModuleFilter) {
                this.elements.auditModuleFilter.value = '';
            }
            this.elements.auditUserFilter.value = '';
            this.elements.auditDateFilter.value = '';
            this.applyFilters();
        }

        getHeaders() {
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

        async loadAuditLog() {
            this.setMessage('Cargando bitácora...', 'info');

            try {
                const { config, headers } = this.getHeaders();
                const response = await fetch(`${config.url}/rest/v1/audit_log?select=id,created_at,user_name,user_role,module,action,entity_type,entity_id,entity_label,view_name,status,before_data,after_data,metadata&order=created_at.desc&limit=500`, { headers });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || 'No fue posible cargar la bitácora.');
                }

                this.state.auditLogs = Array.isArray(data) ? data : [];
                this.state.currentPage = 1;
                this.renderAuditTable();
                this.renderPagination();
                this.setMessage('Bitácora lista.', 'success');
            } catch (error) {
                this.setMessage(error.message || 'No fue posible cargar la bitácora.', 'error');
            }
        }

        getFilteredAuditLogs() {
            const actionFilter = this.elements.auditActionFilter.value.trim();
            const moduleFilter = this.elements.auditModuleFilter?.value.trim() || '';
            const userFilter = this.elements.auditUserFilter.value.trim().toLowerCase();
            const dateFilter = this.elements.auditDateFilter.value;

            return this.state.auditLogs.filter((entry) => {
                const matchesAction = !actionFilter || entry.action === actionFilter;
                const matchesModule = !moduleFilter || entry.module === moduleFilter;
                const actor = `${entry.user_name || ''} ${entry.entity_label || ''}`.toLowerCase();
                const matchesUser = !userFilter || actor.includes(userFilter);
                const matchesDate = !dateFilter || (entry.created_at || '').startsWith(dateFilter);
                return matchesAction && matchesModule && matchesUser && matchesDate;
            });
        }

        getPaginatedAuditLogs() {
            const filtered = this.getFilteredAuditLogs();
            const total = filtered.length;
            const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
            const currentPage = Math.min(this.state.currentPage, totalPages);
            const start = (currentPage - 1) * AUDIT_PAGE_SIZE;
            const end = start + AUDIT_PAGE_SIZE;

            return {
                filtered,
                total,
                totalPages,
                currentPage,
                start,
                end,
                rows: filtered.slice(start, end)
            };
        }

        renderAuditTable() {
            const page = this.getPaginatedAuditLogs();
            this.state.currentPage = page.currentPage;
            this.elements.auditTableBody.innerHTML = '';
            this.elements.auditCount.textContent = `${page.total} eventos`;

            if (page.total === 0) {
                this.elements.auditEmptyState.style.display = 'block';
                return;
            }

            this.elements.auditEmptyState.style.display = 'none';
            this.elements.auditTableBody.innerHTML = page.rows.map((entry) => `
                <tr>
                    <td>
                        <div class="user-primary">${this.formatDate(entry.created_at)}</div>
                        <div class="audit-muted">${this.escapeHtml(this.getModuleLabel(entry.module))} · ${this.escapeHtml(entry.view_name || 'dashboard.html')}</div>
                    </td>
                    <td>
                        <div class="user-primary">${this.escapeHtml(entry.user_name || 'Sin usuario')}</div>
                        <div class="user-secondary">${this.escapeHtml(entry.user_role || 'Sin rol')}</div>
                    </td>
                    <td>
                        <span class="audit-action-pill ${entry.status === 'warning' ? 'warning' : ''}">${this.getActionLabel(entry.action)}</span>
                    </td>
                    <td>
                        <div class="user-primary">${this.escapeHtml(entry.entity_label || entry.entity_id || 'Sin referencia')}</div>
                        <div class="audit-muted">${this.escapeHtml(entry.entity_type || 'registro')}</div>
                    </td>
                    <td>
                        <div class="audit-change-list">${this.summarizeChanges(entry)}</div>
                    </td>
                    <td>
                        <span class="status-pill ${entry.status === 'success' ? 'is-active' : 'is-inactive'}">${this.getStatusLabel(entry.status)}</span>
                    </td>
                </tr>
            `).join('');
        }

        renderPagination() {
            const container = this.elements.auditPagination;
            if (!container) {
                return;
            }

            const page = this.getPaginatedAuditLogs();
            if (page.total === 0) {
                container.innerHTML = '';
                return;
            }

            const from = page.start + 1;
            const to = Math.min(page.end, page.total);
            container.innerHTML = `
                <div class="table-pagination__info">Mostrando ${from}-${to} de ${page.total} eventos</div>
                <div class="table-pagination__actions">
                    <button type="button" class="table-pagination__button" data-page-action="prev" ${page.currentPage === 1 ? 'disabled' : ''}>Anterior</button>
                    <span class="table-pagination__page">Página ${page.currentPage} de ${page.totalPages}</span>
                    <button type="button" class="table-pagination__button" data-page-action="next" ${page.currentPage === page.totalPages ? 'disabled' : ''}>Siguiente</button>
                </div>
            `;

            container.querySelector('[data-page-action="prev"]')?.addEventListener('click', () => {
                if (this.state.currentPage > 1) {
                    this.state.currentPage -= 1;
                    this.renderAuditTable();
                    this.renderPagination();
                }
            });

            container.querySelector('[data-page-action="next"]')?.addEventListener('click', () => {
                if (this.state.currentPage < page.totalPages) {
                    this.state.currentPage += 1;
                    this.renderAuditTable();
                    this.renderPagination();
                }
            });
        }

        summarizeChanges(entry) {
            const beforeData = this.toPlainObject(entry.before_data);
            const afterData = this.toPlainObject(entry.after_data);
            const lines = [];

            if (entry.action === 'reset_password') {
                lines.push('<div class="audit-change-item">Se genero correo de recuperacion para la cuenta.</div>');
            }

            if (beforeData || afterData) {
                const keys = Array.from(new Set([
                    ...Object.keys(beforeData || {}),
                    ...Object.keys(afterData || {})
                ])).filter((key) => JSON.stringify(beforeData?.[key] ?? null) !== JSON.stringify(afterData?.[key] ?? null));

                keys.forEach((key) => {
                    const beforeValue = this.formatAuditValue(beforeData?.[key]);
                    const afterValue = this.formatAuditValue(afterData?.[key]);
                    lines.push(`<div class="audit-change-item"><strong>${this.getFieldLabel(key)}:</strong> ${this.escapeHtml(beforeValue)} → ${this.escapeHtml(afterValue)}</div>`);
                });
            }

            if (lines.length === 0) {
                lines.push('<div class="audit-change-item">Sin detalle adicional.</div>');
            }

            return lines.join('');
        }

        toPlainObject(value) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                return null;
            }
            return value;
        }

        formatAuditValue(value) {
            if (Array.isArray(value)) {
                return value.length ? value.join(', ') : 'Sin datos';
            }

            if (value === true) {
                return 'Activo';
            }

            if (value === false) {
                return 'Inactivo';
            }

            if (value === null || value === undefined || value === '') {
                return 'Sin datos';
            }

            return String(value);
        }

        getFieldLabel(field) {
            const labels = {
                correo: 'Correo',
                nombre: 'Nombre',
                rol: 'Rol',
                institucion: 'Institucion',
                proyectos: 'Proyectos',
                activo: 'Estado'
            };

            return labels[field] || field;
        }

        formatDate(value) {
            if (!value) {
                return 'Sin fecha';
            }

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return value;
            }

            return new Intl.DateTimeFormat('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        }

        getActionLabel(action) {
            return ACTION_LABELS[action] || action;
        }

        getModuleLabel(module) {
            return MODULE_LABELS[module] || module || 'Módulo no especificado';
        }

        getStatusLabel(status) {
            if (status === 'warning') {
                return 'Advertencia';
            }

            if (status === 'error') {
                return 'Error';
            }

            return 'Correcto';
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
        const page = new AuditLogPage();
        page.init();
    });
}());
