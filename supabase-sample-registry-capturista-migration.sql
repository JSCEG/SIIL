-- SIIL - Migracion para separar capturista del dato documental de la muestra
-- Ejecutar sobre proyectos que ya corrieron supabase-sample-registry.sql

alter table public.muestras
    add column if not exists capturista_correo text,
    add column if not exists capturista_nombre text,
    add column if not exists capturista_institucion text;

update public.muestras
set
    capturista_correo = coalesce(capturista_correo, correo),
    capturista_nombre = coalesce(capturista_nombre, nombre_registro),
    capturista_institucion = coalesce(capturista_institucion, institucion)
where
    capturista_correo is null
    or capturista_nombre is null
    or capturista_institucion is null;
