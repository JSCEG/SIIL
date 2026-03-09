-- SIIL - Base inicial para autenticacion con Supabase
-- Ejecutar en el SQL Editor del proyecto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.usuarios (
    id uuid primary key references auth.users (id) on delete cascade,
    correo text not null unique,
    nombre text not null,
    rol text not null check (rol in ('operador_campo', 'tecnico_lab', 'geologo', 'coordinador', 'admin')),
    institucion text,
    proyectos text[] not null default '{}',
    activo boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists trg_usuarios_updated_at on public.usuarios;
create trigger trg_usuarios_updated_at
before update on public.usuarios
for each row
execute function public.set_updated_at();

alter table public.usuarios enable row level security;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.usuarios
        where id = auth.uid()
          and rol = 'admin'
          and activo = true
    );
$$;

drop policy if exists "usuarios_select_self_or_admin" on public.usuarios;
create policy "usuarios_select_self_or_admin"
on public.usuarios
for select
to authenticated
using (
    id = auth.uid()
    or public.current_user_is_admin()
);

drop policy if exists "usuarios_admin_insert" on public.usuarios;
create policy "usuarios_admin_insert"
on public.usuarios
for insert
to authenticated
with check (public.current_user_is_admin());

drop policy if exists "usuarios_admin_update" on public.usuarios;
create policy "usuarios_admin_update"
on public.usuarios
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "usuarios_admin_delete" on public.usuarios;
create policy "usuarios_admin_delete"
on public.usuarios
for delete
to authenticated
using (public.current_user_is_admin());

-- Paso manual posterior:
-- 1. Crear el usuario admin en Authentication > Users.
-- 2. Copiar su UUID.
-- 3. Insertar su perfil:
-- insert into public.usuarios (id, correo, nombre, rol, institucion, proyectos, activo)
-- values (
--   'UUID_DEL_USUARIO',
--   'admin@dominio.gob.mx',
--   'Administrador SIIL',
--   'admin',
--   'SENER',
--   '{}',
--   true
-- );
