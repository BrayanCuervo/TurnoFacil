import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

export const SUPABASE_URL = 'https://khlhlrgcjkelnclxdady.supabase.co';
// Clave publica (segura para la app). La seguridad la dan las reglas RLS de la base de datos.
const SUPABASE_KEY = 'sb_publishable_U7fS3sTWd9NAKR71SfEYPA_JSBpTJZv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Refresca el token solo con la app en primer plano
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

// Convierte errores de Supabase en mensajes claros en espanol
export function errorMessage(error, fallback = 'Ocurrió un error. Intenta de nuevo.') {
  if (!error) return fallback;
  const msg = error.message || String(error);
  if (/Invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.';
  if (/banned/i.test(msg)) return 'Tu cuenta está desactivada. Habla con el administrador.';
  if (/Network request failed|fetch/i.test(msg)) return 'Sin conexión a internet.';
  if (/expired|invalid.*(otp|token)/i.test(msg)) return 'El código no es válido o ya venció.';
  if (/rate limit/i.test(msg)) return 'Demasiados intentos. Espera un momento.';
  return msg || fallback;
}

// Llama a una Edge Function y devuelve { data, error } con el mensaje del servidor
export async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let msg = error.message;
    try {
      const j = await error.context?.json?.();
      if (j?.error) msg = j.error;
    } catch {}
    return { data: null, error: { message: msg } };
  }
  if (data?.error) return { data: null, error: { message: data.error } };
  return { data, error: null };
}
