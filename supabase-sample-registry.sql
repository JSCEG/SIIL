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

create or replace function public.current_user_can_manage_owned_registry(owner_user_id uuid)
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.usuarios
        where id = auth.uid()
          and activo = true
          and (rol = 'admin' or id = owner_user_id)
    );
$$;


create table if not exists public.barrenos (
    id text primary key,
    proyecto text not null,
    subregion_sigla text not null,
    perforista text not null,
    responsable text not null,
    responsable_descripcion text,
    estado text not null,
    estado_cve text,
    municipio text not null,
    municipio_cve text,
    localidad text,
    descripcion_local text,
    litologia_local text,
    estructura_aledana text,
    anomalia_gravimetrica numeric(12, 4),
    anomalia_1 text,
    anomalia_2 text,
    anomalia_3 text,
    accesibilidad text,
    tipo_terreno text,
    latitud numeric(12, 7) not null,
    longitud numeric(12, 7) not null,
    altitud numeric(12, 2) not null check (altitud > 0),
    azimut integer not null check (azimut >= 0 and azimut <= 360),
    inclinacion integer not null check (inclinacion >= -90 and inclinacion <= 0),
    tipo_barrenacion text not null,
    fecha_inicio date not null,
    fecha_fin date not null,
    longitud_perforada numeric(12, 2) not null check (longitud_perforada > 0),
    longitud_recuperada numeric(12, 2) not null check (longitud_recuperada > 0),
    diametro_mm integer not null check (diametro_mm > 0),
    numero_cajas integer not null check (numero_cajas > 0),
    nombre_cajas text not null,
    rqd text,
    tcr numeric(8, 4),
    intervalos_interes text,
    archivo_descripcion_nucleo text,
    archivo_descripcion_bucket text,
    archivo_descripcion_path text,
    observaciones text,
    constraint barrenos_fecha_valida check (fecha_fin >= fecha_inicio),
    constraint barrenos_latitud_range check (latitud >= 14.0 and latitud <= 33.0),
    constraint barrenos_longitud_range check (longitud >= -118.5 and longitud <= -86.0),
    constraint barrenos_tcr_range check (tcr is null or (tcr >= 0 and tcr <= 1)),
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
    capturista_correo text,
    capturista_nombre text,
    capturista_institucion text,
    proyecto text not null,
    responsable text not null,
    estado text not null,
    estado_cve text,
    municipio text not null,
    municipio_cve text,
    localidad text,
    notas text,
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
    salmuera_conductividad numeric(14, 4),
    salmuera_oxigeno_disuelto numeric(14, 4),
    arcilla_notas text,
    arcilla_procedencia text,
    arcilla_latitud numeric(12, 7),
    arcilla_longitud numeric(12, 7),
    arcilla_altitud numeric(12, 2),
    arcilla_desde numeric(12, 2),
    arcilla_hasta numeric(12, 2),
    arcilla_estructuras text,
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

do $$
begin
    if to_regclass('public.audit_log') is not null then
        execute 'alter table public.audit_log enable row level security';
        execute 'drop policy if exists "audit_log_registry_insert" on public.audit_log';
        execute $policy$
            create policy "audit_log_registry_insert"
            on public.audit_log
            for insert
            to authenticated
            with check (
                public.current_user_can_use_sample_registry()
                and module = 'sample_registry'
                and action in ('create', 'update', 'delete')
            )
        $policy$;
    end if;
end $$;

insert into storage.buckets (id, name, public)
values ('barreno-anexos', 'barreno-anexos', false)
on conflict (id) do nothing;

drop policy if exists "barreno_anexos_select" on storage.objects;
drop policy if exists "barreno_anexos_insert" on storage.objects;
drop policy if exists "barreno_anexos_update" on storage.objects;
drop policy if exists "barreno_anexos_delete" on storage.objects;

create policy "barreno_anexos_select"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'barreno-anexos'
    and public.current_user_can_use_sample_registry()
);

create policy "barreno_anexos_insert"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'barreno-anexos'
    and public.current_user_can_use_sample_registry()
);

create policy "barreno_anexos_update"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'barreno-anexos'
    and public.current_user_can_use_sample_registry()
)
with check (
    bucket_id = 'barreno-anexos'
    and public.current_user_can_use_sample_registry()
);

create policy "barreno_anexos_delete"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'barreno-anexos'
    and public.current_user_can_use_sample_registry()
);

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
using (public.current_user_can_manage_owned_registry(created_by))
with check (public.current_user_can_use_sample_registry());

drop policy if exists "barrenos_delete_registry_users" on public.barrenos;
create policy "barrenos_delete_registry_users"
on public.barrenos
for delete
to authenticated
using (public.current_user_can_manage_owned_registry(created_by));

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
using (public.current_user_can_manage_owned_registry(created_by))
with check (public.current_user_can_use_sample_registry());

drop policy if exists "barreno_intervalos_delete_registry_users" on public.barreno_intervalos;
create policy "barreno_intervalos_delete_registry_users"
on public.barreno_intervalos
for delete
to authenticated
using (public.current_user_can_manage_owned_registry(created_by));

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






