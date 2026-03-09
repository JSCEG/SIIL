-- SIIL - Matriz base de funcionalidades por rol
-- Ejecutar despues de supabase-admin-setup.sql

create table if not exists public.role_features (
    role_name text not null,
    feature_key text not null,
    enabled boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    primary key (role_name, feature_key),
    constraint role_features_role_check check (role_name in ('operador_campo', 'tecnico_lab', 'geologo', 'coordinador', 'admin'))
);

alter table public.role_features enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select rol
    from public.usuarios
    where id = auth.uid()
      and activo = true
    limit 1;
$$;

drop policy if exists "role_features_admin_or_self_role" on public.role_features;
create policy "role_features_admin_or_self_role"
on public.role_features
for select
to authenticated
using (
    public.current_user_is_admin()
    or role_name = public.current_user_role()
);

insert into public.role_features (role_name, feature_key, enabled)
values
    ('admin', 'sample_registry', true),
    ('admin', 'results_view', true),
    ('admin', 'map_view', true),
    ('admin', 'user_accounts', true),
    ('admin', 'role_access', true),
    ('admin', 'security_policy', true),
    ('admin', 'operations_log', true),
    ('coordinador', 'sample_registry', true),
    ('coordinador', 'results_view', true),
    ('coordinador', 'map_view', true),
    ('coordinador', 'operations_log', true),
    ('geologo', 'sample_registry', true),
    ('geologo', 'results_view', true),
    ('geologo', 'map_view', true),
    ('operador_campo', 'sample_registry', true),
    ('operador_campo', 'map_view', true),
    ('tecnico_lab', 'sample_registry', true),
    ('tecnico_lab', 'results_view', true)
on conflict (role_name, feature_key) do update
set enabled = excluded.enabled;

-- Consulta util para el frontend o backend:
-- select feature_key
-- from public.role_features
-- where role_name = 'admin' and enabled = true;
