-- SIIL - Habilitar bitácora de barrenos y muestras en audit_log
-- Requiere que public.audit_log exista previamente (supabase-audit-log.sql)

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

