-- SIIL - Bitacora minima de acciones administrativas
-- Ejecutar despues de supabase-admin-setup.sql

create table if not exists public.audit_log (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc', now()),
    user_id uuid references public.usuarios (id) on delete set null,
    user_name text not null,
    user_role text not null,
    module text not null,
    action text not null,
    entity_type text not null,
    entity_id text,
    entity_label text,
    view_name text,
    status text not null default 'success' check (status in ('success', 'warning', 'error')),
    before_data jsonb,
    after_data jsonb,
    metadata jsonb
);

create index if not exists idx_audit_log_created_at on public.audit_log (created_at desc);
create index if not exists idx_audit_log_user_id on public.audit_log (user_id);
create index if not exists idx_audit_log_module_action on public.audit_log (module, action);
create index if not exists idx_audit_log_entity on public.audit_log (entity_type, entity_id);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_admin_select" on public.audit_log;
create policy "audit_log_admin_select"
on public.audit_log
for select
to authenticated
using (public.current_user_is_admin());

-- La insercion principal corre desde Edge Functions con service role.
-- Si mas adelante se requiere insercion directa desde SQL para pruebas,
-- se puede agregar una policy especifica para admin.
