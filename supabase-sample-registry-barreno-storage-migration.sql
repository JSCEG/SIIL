alter table public.barrenos
    add column if not exists archivo_descripcion_bucket text,
    add column if not exists archivo_descripcion_path text;

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
