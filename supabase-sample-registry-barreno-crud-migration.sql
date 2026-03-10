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
