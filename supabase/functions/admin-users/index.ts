// Supabase Edge Function: admin-users
// Operaciones administrativas sobre auth.users + public.usuarios

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const ROLE_VALUES = new Set(['admin', 'coordinador', 'geologo', 'operador_campo', 'tecnico_lab']);
const TEMP_PASSWORD_LENGTH = 18;
const DEFAULT_VIEW_NAME = 'dashboard.html';
const AUDIT_MODULE = 'user_accounts';

type SupabaseClient = ReturnType<typeof createClient>;

type CallerProfile = {
  id: string;
  rol: string;
  activo: boolean;
  nombre?: string | null;
  correo?: string | null;
  institucion?: string | null;
};

type AuditPayload = {
  action: string;
  entityId?: string | null;
  entityLabel?: string | null;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  status?: 'success' | 'warning' | 'error';
  viewName?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint32Array(TEMP_PASSWORD_LENGTH));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

function normalizeProjects(projects: unknown) {
  if (!Array.isArray(projects)) {
    return [];
  }

  return projects
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function sanitizeProfileForAudit(profile: Record<string, unknown> | null | undefined) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id ?? null,
    correo: profile.correo ?? null,
    nombre: profile.nombre ?? null,
    rol: profile.rol ?? null,
    institucion: profile.institucion ?? null,
    proyectos: Array.isArray(profile.proyectos) ? profile.proyectos : [],
    activo: profile.activo ?? null
  };
}

async function insertAuditLog(
  adminClient: SupabaseClient,
  callerUser: { id: string; email?: string | null },
  callerProfile: CallerProfile,
  payload: AuditPayload
) {
  const actorName = callerProfile.nombre || callerUser.email || 'Usuario SIIL';

  const { error } = await adminClient
    .from('audit_log')
    .insert({
      user_id: callerUser.id,
      user_name: actorName,
      user_role: callerProfile.rol,
      module: AUDIT_MODULE,
      action: payload.action,
      entity_type: 'usuario',
      entity_id: payload.entityId || null,
      entity_label: payload.entityLabel || null,
      view_name: payload.viewName || DEFAULT_VIEW_NAME,
      before_data: payload.beforeData || null,
      after_data: payload.afterData || null,
      status: payload.status || 'success',
      metadata: payload.metadata || null
    });

  if (error) {
    console.error('Audit log insert failed:', error.message);
  }
}

async function getAdminContext(request: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const anonKey = Deno.env.get('SIIL_SUPABASE_ANON_KEY') || '';
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    throw new Error('Faltan variables SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY o SIIL_SUPABASE_ANON_KEY en la funcion.');
  }

  if (!token) {
    return { error: jsonResponse({ error: 'No autorizado.' }, 401) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false }
  });

  const callerClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });

  const {
    data: { user },
    error: authError
  } = await callerClient.auth.getUser();

  if (authError || !user) {
    return { error: jsonResponse({ error: 'Sesion invalida.' }, 401) };
  }

  const { data: callerProfile, error: profileError } = await adminClient
    .from('usuarios')
    .select('id, rol, activo, nombre, correo, institucion')
    .eq('id', user.id)
    .maybeSingle<CallerProfile>();

  if (profileError || !callerProfile || callerProfile.rol !== 'admin' || callerProfile.activo === false) {
    return { error: jsonResponse({ error: 'No tiene permisos para administrar cuentas.' }, 403) };
  }

  return { adminClient, publicClient, callerUser: user, callerProfile };
}

async function sendRecoveryEmail(
  publicClient: SupabaseClient,
  email: string,
  redirectTo: string
) {
  const { error } = await publicClient.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    throw error;
  }
}

async function sendInviteEmail(
  adminClient: SupabaseClient,
  email: string,
  redirectTo: string,
  metadata: Record<string, unknown>
) {
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: metadata
  });

  if (error) {
    throw error;
  }

  return data;
}

async function createAccount(
  adminClient: SupabaseClient,
  publicClient: SupabaseClient,
  callerUser: { id: string; email?: string | null },
  callerProfile: CallerProfile,
  payload: Record<string, unknown>
) {
  const correo = String(payload.correo || '').trim().toLowerCase();
  const nombre = String(payload.nombre || '').trim();
  const rol = String(payload.rol || '').trim();
  const institucion = String(payload.institucion || '').trim();
  const activo = payload.activo !== false;
  const proyectos = normalizeProjects(payload.proyectos);
  const redirectTo = String(payload.redirectTo || '').trim();
  const viewName = String(payload.viewName || DEFAULT_VIEW_NAME).trim() || DEFAULT_VIEW_NAME;

  if (!correo || !nombre || !ROLE_VALUES.has(rol) || !redirectTo) {
    return jsonResponse({ error: 'Correo, nombre, rol valido y redirectTo son obligatorios.' }, 400);
  }

  const invitedUser = await sendInviteEmail(adminClient, correo, redirectTo, {
    nombre,
    rol
  });

  if (!invitedUser?.user) {
    return jsonResponse({ error: 'No fue posible crear la invitacion en auth.users.' }, 400);
  }

  const profilePayload = {
    id: invitedUser.user.id,
    correo,
    nombre,
    rol,
    institucion,
    proyectos,
    activo
  };

  const { data: profile, error: profileError } = await adminClient
    .from('usuarios')
    .insert(profilePayload)
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .single();

  if (profileError) {
    await adminClient.auth.admin.deleteUser(invitedUser.user.id);
    return jsonResponse({ error: profileError.message || 'No fue posible crear el perfil del usuario.' }, 400);
  }

  let status: 'success' | 'warning' = 'success';
  let message = activo
    ? 'Cuenta creada e invitacion enviada para definir contraseña.'
    : 'Cuenta creada en estado inactivo. No se envio invitacion inicial.';
  let errorMessage = '';

  if (!activo) {
    status = 'warning';
  }

  await insertAuditLog(adminClient, callerUser, callerProfile, {
    action: 'create',
    entityId: profile.id,
    entityLabel: `${profile.nombre} <${profile.correo}>`,
    beforeData: null,
    afterData: sanitizeProfileForAudit(profile),
    status,
    viewName,
    metadata: {
      access_email_sent: activo
    }
  });

  if (status === 'warning') {
    return jsonResponse({
      user: profile,
      warning: true,
      message,
      error: errorMessage
    }, 207);
  }

  return jsonResponse({
    user: profile,
    message
  });
}

async function updateAccount(
  adminClient: SupabaseClient,
  callerUser: { id: string; email?: string | null },
  callerProfile: CallerProfile,
  payload: Record<string, unknown>
) {
  const id = String(payload.id || '').trim();
  const correo = String(payload.correo || '').trim().toLowerCase();
  const nombre = String(payload.nombre || '').trim();
  const rol = String(payload.rol || '').trim();
  const institucion = String(payload.institucion || '').trim();
  const activo = payload.activo !== false;
  const proyectos = normalizeProjects(payload.proyectos);
  const viewName = String(payload.viewName || DEFAULT_VIEW_NAME).trim() || DEFAULT_VIEW_NAME;

  if (!id || !correo || !nombre || !ROLE_VALUES.has(rol)) {
    return jsonResponse({ error: 'ID, correo, nombre y rol validos son obligatorios.' }, 400);
  }

  const { data: previousProfile } = await adminClient
    .from('usuarios')
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .eq('id', id)
    .maybeSingle();

  const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(id, {
    email: correo,
    user_metadata: {
      nombre,
      rol
    }
  });

  if (authUpdateError) {
    return jsonResponse({ error: authUpdateError.message || 'No fue posible actualizar auth.users.' }, 400);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('usuarios')
    .update({
      correo,
      nombre,
      rol,
      institucion,
      proyectos,
      activo
    })
    .eq('id', id)
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .single();

  if (profileError) {
    return jsonResponse({ error: profileError.message || 'No fue posible actualizar el perfil del usuario.' }, 400);
  }

  await insertAuditLog(adminClient, callerUser, callerProfile, {
    action: 'update',
    entityId: profile.id,
    entityLabel: `${profile.nombre} <${profile.correo}>`,
    beforeData: sanitizeProfileForAudit(previousProfile),
    afterData: sanitizeProfileForAudit(profile),
    status: 'success',
    viewName
  });

  return jsonResponse({ user: profile, message: 'Cuenta actualizada.' });
}

async function toggleAccount(
  adminClient: SupabaseClient,
  publicClient: SupabaseClient,
  callerUser: { id: string; email?: string | null },
  callerProfile: CallerProfile,
  payload: Record<string, unknown>
) {
  const id = String(payload.id || '').trim();
  const activo = payload.activo === true;
  const redirectTo = String(payload.redirectTo || '').trim();
  const viewName = String(payload.viewName || DEFAULT_VIEW_NAME).trim() || DEFAULT_VIEW_NAME;

  if (!id) {
    return jsonResponse({ error: 'ID de usuario obligatorio.' }, 400);
  }

  const { data: previousProfile } = await adminClient
    .from('usuarios')
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .eq('id', id)
    .maybeSingle();

  const { data: profile, error: profileError } = await adminClient
    .from('usuarios')
    .update({ activo })
    .eq('id', id)
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .single();

  if (profileError) {
    return jsonResponse({ error: profileError.message || 'No fue posible actualizar el estado del usuario.' }, 400);
  }

  if (!activo) {
    await insertAuditLog(adminClient, callerUser, callerProfile, {
      action: 'deactivate',
      entityId: profile.id,
      entityLabel: `${profile.nombre} <${profile.correo}>`,
      beforeData: sanitizeProfileForAudit(previousProfile),
      afterData: sanitizeProfileForAudit(profile),
      status: 'success',
      viewName
    });

    return jsonResponse({ user: profile, message: 'Cuenta desactivada.' });
  }

  let status: 'success' | 'warning' = 'success';
  let message = 'Cuenta activada y correo de acceso enviado.';
  let errorMessage = '';

  if (!redirectTo) {
    message = 'Cuenta activada.';
  } else {
    try {
      await sendRecoveryEmail(publicClient, profile.correo, redirectTo);
    } catch (error) {
      status = 'warning';
      message = 'Cuenta activada, pero no fue posible enviar el correo de acceso.';
      errorMessage = error instanceof Error ? error.message : 'No fue posible enviar el correo de acceso.';
    }
  }

  await insertAuditLog(adminClient, callerUser, callerProfile, {
    action: 'activate',
    entityId: profile.id,
    entityLabel: `${profile.nombre} <${profile.correo}>`,
    beforeData: sanitizeProfileForAudit(previousProfile),
    afterData: sanitizeProfileForAudit(profile),
    status,
    viewName,
    metadata: {
      recovery_email_sent: status === 'success' && Boolean(redirectTo)
    }
  });

  if (status === 'warning') {
    return jsonResponse({
      user: profile,
      warning: true,
      message,
      error: errorMessage
    }, 207);
  }

  return jsonResponse({ user: profile, message });
}

async function resetPassword(
  adminClient: SupabaseClient,
  publicClient: SupabaseClient,
  callerUser: { id: string; email?: string | null },
  callerProfile: CallerProfile,
  payload: Record<string, unknown>
) {
  const userId = String(payload.id || '').trim();
  const redirectTo = String(payload.redirectTo || '').trim();
  const viewName = String(payload.viewName || DEFAULT_VIEW_NAME).trim() || DEFAULT_VIEW_NAME;

  if (!userId || !redirectTo) {
    return jsonResponse({ error: 'ID y redirectTo son obligatorios para reset_password.' }, 400);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('usuarios')
    .select('id, correo, nombre, rol, institucion, proyectos, activo')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile?.correo) {
    return jsonResponse({ error: 'No fue posible localizar el correo del usuario.' }, 404);
  }

  try {
    await sendRecoveryEmail(publicClient, profile.correo, redirectTo);
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'No fue posible generar el correo de recuperacion.'
    }, 400);
  }

  await insertAuditLog(adminClient, callerUser, callerProfile, {
    action: 'reset_password',
    entityId: profile.id,
    entityLabel: `${profile.nombre} <${profile.correo}>`,
    beforeData: null,
    afterData: null,
    status: 'success',
    viewName,
    metadata: {
      recovery_email_sent: true
    }
  });

  return jsonResponse({ message: 'Correo de recuperacion generado.' });
}

Deno.serve(async (request) => {
  try {
    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Metodo no permitido.' }, 405);
    }

    const context = await getAdminContext(request);
    if ('error' in context) {
      return context.error;
    }

    const payload = await request.json();
    const action = String(payload.action || '').trim();

    switch (action) {
      case 'create':
        return await createAccount(context.adminClient, context.publicClient, context.callerUser, context.callerProfile, payload);
      case 'update':
        return await updateAccount(context.adminClient, context.callerUser, context.callerProfile, payload);
      case 'toggle':
        return await toggleAccount(context.adminClient, context.publicClient, context.callerUser, context.callerProfile, payload);
      case 'reset_password':
        return await resetPassword(context.adminClient, context.publicClient, context.callerUser, context.callerProfile, payload);
      default:
        return jsonResponse({ error: 'Accion no soportada.' }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno de la funcion.';
    return jsonResponse({ error: message }, 500);
  }
});




