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
    .select('id, rol, activo')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !callerProfile || callerProfile.rol !== 'admin' || callerProfile.activo === false) {
    return { error: jsonResponse({ error: 'No tiene permisos para administrar cuentas.' }, 403) };
  }

  return { adminClient, publicClient, callerUser: user };
}

async function sendRecoveryEmail(
  publicClient: ReturnType<typeof createClient>,
  email: string,
  redirectTo: string
) {
  const { error } = await publicClient.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    throw error;
  }
}

async function createAccount(
  adminClient: ReturnType<typeof createClient>,
  publicClient: ReturnType<typeof createClient>,
  payload: Record<string, unknown>
) {
  const correo = String(payload.correo || '').trim().toLowerCase();
  const nombre = String(payload.nombre || '').trim();
  const rol = String(payload.rol || '').trim();
  const institucion = String(payload.institucion || '').trim();
  const activo = payload.activo !== false;
  const proyectos = normalizeProjects(payload.proyectos);
  const redirectTo = String(payload.redirectTo || '').trim();

  if (!correo || !nombre || !ROLE_VALUES.has(rol) || !redirectTo) {
    return jsonResponse({ error: 'Correo, nombre, rol valido y redirectTo son obligatorios.' }, 400);
  }

  const temporaryPassword = generateTemporaryPassword();
  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email: correo,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      nombre,
      rol
    }
  });

  if (createError || !createdUser.user) {
    return jsonResponse({ error: createError?.message || 'No fue posible crear la cuenta en auth.users.' }, 400);
  }

  const profilePayload = {
    id: createdUser.user.id,
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
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    return jsonResponse({ error: profileError.message || 'No fue posible crear el perfil del usuario.' }, 400);
  }

  try {
    await sendRecoveryEmail(publicClient, correo, redirectTo);
  } catch (error) {
    return jsonResponse({
      user: profile,
      warning: true,
      message: 'Cuenta creada, pero no fue posible enviar el correo de acceso.',
      error: error instanceof Error ? error.message : 'No fue posible enviar el correo de acceso.'
    }, 207);
  }

  return jsonResponse({
    user: profile,
    message: 'Cuenta creada y correo de acceso enviado.'
  });
}

async function updateAccount(adminClient: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const id = String(payload.id || '').trim();
  const correo = String(payload.correo || '').trim().toLowerCase();
  const nombre = String(payload.nombre || '').trim();
  const rol = String(payload.rol || '').trim();
  const institucion = String(payload.institucion || '').trim();
  const activo = payload.activo !== false;
  const proyectos = normalizeProjects(payload.proyectos);

  if (!id || !correo || !nombre || !ROLE_VALUES.has(rol)) {
    return jsonResponse({ error: 'ID, correo, nombre y rol validos son obligatorios.' }, 400);
  }

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

  return jsonResponse({ user: profile, message: 'Cuenta actualizada.' });
}

async function toggleAccount(
  adminClient: ReturnType<typeof createClient>,
  publicClient: ReturnType<typeof createClient>,
  payload: Record<string, unknown>
) {
  const id = String(payload.id || '').trim();
  const activo = payload.activo === true;
  const redirectTo = String(payload.redirectTo || '').trim();

  if (!id) {
    return jsonResponse({ error: 'ID de usuario obligatorio.' }, 400);
  }

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
    return jsonResponse({ user: profile, message: 'Cuenta desactivada.' });
  }

  if (!redirectTo) {
    return jsonResponse({ user: profile, message: 'Cuenta activada.' });
  }

  try {
    await sendRecoveryEmail(publicClient, profile.correo, redirectTo);
  } catch (error) {
    return jsonResponse({
      user: profile,
      warning: true,
      message: 'Cuenta activada, pero no fue posible enviar el correo de acceso.',
      error: error instanceof Error ? error.message : 'No fue posible enviar el correo de acceso.'
    }, 207);
  }

  return jsonResponse({ user: profile, message: 'Cuenta activada y correo de acceso enviado.' });
}

async function resetPassword(
  adminClient: ReturnType<typeof createClient>,
  publicClient: ReturnType<typeof createClient>,
  payload: Record<string, unknown>
) {
  const userId = String(payload.id || '').trim();
  const redirectTo = String(payload.redirectTo || '').trim();

  if (!userId || !redirectTo) {
    return jsonResponse({ error: 'ID y redirectTo son obligatorios para reset_password.' }, 400);
  }

  const { data: profile, error: profileError } = await adminClient
    .from('usuarios')
    .select('correo')
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
        return await createAccount(context.adminClient, context.publicClient, payload);
      case 'update':
        return await updateAccount(context.adminClient, payload);
      case 'toggle':
        return await toggleAccount(context.adminClient, context.publicClient, payload);
      case 'reset_password':
        return await resetPassword(context.adminClient, context.publicClient, payload);
      default:
        return jsonResponse({ error: 'Accion no soportada.' }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno de la funcion.';
    return jsonResponse({ error: message }, 500);
  }
});


