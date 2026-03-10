alter table public.barrenos
    add column if not exists subregion_sigla text,
    add column if not exists perforista text,
    add column if not exists responsable_descripcion text,
    add column if not exists localidad text,
    add column if not exists descripcion_local text,
    add column if not exists litologia_local text,
    add column if not exists estructura_aledana text,
    add column if not exists anomalia_gravimetrica numeric(12, 4),
    add column if not exists anomalia_1 text,
    add column if not exists anomalia_2 text,
    add column if not exists anomalia_3 text,
    add column if not exists accesibilidad text,
    add column if not exists tipo_terreno text,
    add column if not exists latitud numeric(12, 7),
    add column if not exists longitud numeric(12, 7),
    add column if not exists altitud numeric(12, 2),
    add column if not exists azimut integer,
    add column if not exists inclinacion integer,
    add column if not exists tipo_barrenacion text,
    add column if not exists fecha_inicio date,
    add column if not exists fecha_fin date,
    add column if not exists longitud_recuperada numeric(12, 2),
    add column if not exists diametro_mm integer,
    add column if not exists numero_cajas integer,
    add column if not exists nombre_cajas text,
    add column if not exists rqd text,
    add column if not exists tcr numeric(8, 4),
    add column if not exists intervalos_interes text,
    add column if not exists archivo_descripcion_nucleo text,
    add column if not exists observaciones text;

alter table public.muestras
    add column if not exists notas text,
    add column if not exists salmuera_conductividad numeric(14, 4),
    add column if not exists salmuera_oxigeno_disuelto numeric(14, 4),
    add column if not exists arcilla_estructuras text;

update public.barrenos
set subregion_sigla = coalesce(subregion_sigla, 'SUBREG')
where subregion_sigla is null;

update public.barrenos
set perforista = coalesce(perforista, responsable)
where perforista is null;

update public.muestras
set notas = coalesce(notas, arcilla_notas)
where notas is null and arcilla_notas is not null;
