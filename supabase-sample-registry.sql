-- SIIL - Esquema base para registro de barrenos y muestras
-- Ejecutar despues de supabase-admin-setup.sql

create extension if not exists pgcrypto;

create or replace function public.current_user_can_use_sample_registry()
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.usuarios
        where id = auth.uid()
          and activo = true
          and rol in ('operador_campo', 'tecnico_lab', 'geologo', 'coordinador', 'admin')
    );
$$;

create table if not exists public.barrenos (
    id text primary key,
    proyecto text not null,
    responsable text not null,
    estado text not null,
    estado_cve text,
    municipio text not null,
    municipio_cve text,
    longitud_perforada numeric(12, 2) not null check (longitud_perforada > 0),
    created_by uuid references public.usuarios (id) on delete set null default auth.uid(),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.barreno_intervalos (
    id uuid primary key default gen_random_uuid(),
    barreno_id text not null references public.barrenos (id) on delete cascade,
    intervalo_id text not null,
    orden integer not null default 1 check (orden > 0),
    desde numeric(12, 2) not null,
    hasta numeric(12, 2) not null,
    created_by uuid references public.usuarios (id) on delete set null default auth.uid(),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint barreno_intervalos_unique unique (barreno_id, intervalo_id),
    constraint barreno_intervalos_rango check (hasta > desde)
);

create table if not exists public.muestras (
    id uuid primary key default gen_random_uuid(),
    id_muestra text not null unique,
    correo text not null,
    nombre_registro text not null,
    institucion text not null,
    institucion_otra text,
    proyecto text not null,
    responsable text not null,
    estado text not null,
    estado_cve text,
    municipio text not null,
    municipio_cve text,
    fuente text not null check (fuente in ('Arcillas', 'Salmueras')),
    origen_arcilla text check (origen_arcilla in ('Superficie', 'Profundidad (Nucleo)')),
    litologia text not null,
    color text not null,
    textura text not null,
    referencia_barreno_id text references public.barrenos (id) on delete set null,
    referencia_intervalo_id text,
    salmuera_campo text,
    salmuera_pozo text,
    salmuera_latitud numeric(12, 7),
    salmuera_longitud numeric(12, 7),
    salmuera_altitud numeric(12, 2),
    salmuera_profundidad numeric(12, 2),
    salmuera_intervalo_inicio numeric(12, 2),
    salmuera_intervalo_fin numeric(12, 2),
    salmuera_corte_agua numeric(8, 2),
    salmuera_presion numeric(14, 4),
    salmuera_temperatura numeric(8, 2),
    salmuera_ph numeric(6, 2),
    arcilla_notas text,
    arcilla_procedencia text,
    arcilla_latitud numeric(12, 7),
    arcilla_longitud numeric(12, 7),
    arcilla_altitud numeric(12, 2),
    arcilla_desde numeric(12, 2),
    arcilla_hasta numeric(12, 2),
    metadata jsonb not null default '{}'::jsonb,
    registro jsonb not null default '{}'::jsonb,
    created_by uuid references public.usuarios (id) on delete set null default auth.uid(),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint muestras_intervalo_ref
        foreign key (referencia_barreno_id, referencia_intervalo_id)
        references public.barreno_intervalos (barreno_id, intervalo_id)
        on delete set null,
    constraint muestras_arcilla_origen_required
        check (fuente <> 'Arcillas' or origen_arcilla is not null),
    constraint muestras_salmuera_intervalo
        check (
            salmuera_intervalo_fin is null
            or salmuera_intervalo_inicio is null
            or salmuera_intervalo_fin >= salmuera_intervalo_inicio
        ),
    constraint muestras_arcilla_intervalo
        check (
            arcilla_hasta is null
            or arcilla_desde is null
            or arcilla_hasta >= arcilla_desde
        )
);

create table if not exists public.muestra_fotos (
    id uuid primary key default gen_random_uuid(),
    muestra_id uuid not null references public.muestras (id) on delete cascade,
    nombre_archivo text not null,
    storage_bucket text,
    storage_path text,
    created_by uuid references public.usuarios (id) on delete set null default auth.uid(),
    created_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_barrenos_updated_at on public.barrenos;
create trigger trg_barrenos_updated_at
before update on public.barrenos
for each row
execute function public.set_updated_at();

drop trigger if exists trg_barreno_intervalos_updated_at on public.barreno_intervalos;
create trigger trg_barreno_intervalos_updated_at
before update on public.barreno_intervalos
for each row
execute function public.set_updated_at();

drop trigger if exists trg_muestras_updated_at on public.muestras;
create trigger trg_muestras_updated_at
before update on public.muestras
for each row
execute function public.set_updated_at();

create index if not exists idx_barrenos_estado_municipio on public.barrenos (estado, municipio);
create index if not exists idx_barreno_intervalos_barreno on public.barreno_intervalos (barreno_id, orden);
create index if not exists idx_muestras_fuente_origen on public.muestras (fuente, origen_arcilla);
create index if not exists idx_muestras_barreno on public.muestras (referencia_barreno_id, referencia_intervalo_id);
create index if not exists idx_muestra_fotos_muestra on public.muestra_fotos (muestra_id);

alter table public.barrenos enable row level security;
alter table public.barreno_intervalos enable row level security;
alter table public.muestras enable row level security;
alter table public.muestra_fotos enable row level security;

drop policy if exists "barrenos_select_registry_users" on public.barrenos;
create policy "barrenos_select_registry_users"
on public.barrenos
for select
to authenticated
using (public.current_user_can_use_sample_registry());

drop policy if exists "barrenos_insert_registry_users" on public.barrenos;
create policy "barrenos_insert_registry_users"
on public.barrenos
for insert
to authenticated
with check (public.current_user_can_use_sample_registry());

drop policy if exists "barrenos_update_registry_users" on public.barrenos;
create policy "barrenos_update_registry_users"
on public.barrenos
for update
to authenticated
using (public.current_user_can_use_sample_registry())
with check (public.current_user_can_use_sample_registry());

drop policy if exists "barreno_intervalos_select_registry_users" on public.barreno_intervalos;
create policy "barreno_intervalos_select_registry_users"
on public.barreno_intervalos
for select
to authenticated
using (public.current_user_can_use_sample_registry());

drop policy if exists "barreno_intervalos_insert_registry_users" on public.barreno_intervalos;
create policy "barreno_intervalos_insert_registry_users"
on public.barreno_intervalos
for insert
to authenticated
with check (public.current_user_can_use_sample_registry());

drop policy if exists "barreno_intervalos_update_registry_users" on public.barreno_intervalos;
create policy "barreno_intervalos_update_registry_users"
on public.barreno_intervalos
for update
to authenticated
using (public.current_user_can_use_sample_registry())
with check (public.current_user_can_use_sample_registry());

drop policy if exists "muestras_select_registry_users" on public.muestras;
create policy "muestras_select_registry_users"
on public.muestras
for select
to authenticated
using (public.current_user_can_use_sample_registry());

drop policy if exists "muestras_insert_registry_users" on public.muestras;
create policy "muestras_insert_registry_users"
on public.muestras
for insert
to authenticated
with check (public.current_user_can_use_sample_registry());

drop policy if exists "muestras_update_registry_users" on public.muestras;
create policy "muestras_update_registry_users"
on public.muestras
for update
to authenticated
using (public.current_user_can_use_sample_registry())
with check (public.current_user_can_use_sample_registry());

drop policy if exists "muestra_fotos_select_registry_users" on public.muestra_fotos;
create policy "muestra_fotos_select_registry_users"
on public.muestra_fotos
for select
to authenticated
using (public.current_user_can_use_sample_registry());

drop policy if exists "muestra_fotos_insert_registry_users" on public.muestra_fotos;
create policy "muestra_fotos_insert_registry_users"
on public.muestra_fotos
for insert
to authenticated
with check (public.current_user_can_use_sample_registry());
