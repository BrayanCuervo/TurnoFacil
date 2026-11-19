import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { supabase } from './src/lib/supabase';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MainTabs from './src/screens/MainTabs';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutos sin usar la app => cierra sesion
const LAST_ACTIVITY_KEY = 'turnofacil_last_activity';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });
  const [session, setSession] = useState(undefined); // undefined = cargando
  const [profile, setProfile] = useState(null);
  const [route, setRoute] = useState('welcome'); // welcome | login | register | forgot
  const [recovering, setRecovering] = useState(false); // cambiando contrasena con codigo
  const lastActivity = useRef(Date.now());
  const lastHaptic = useRef(0);

  // ---------- Perfil y rol del usuario ----------
  const loadProfile = useCallback(async (s) => {
    if (!s) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', s.user.id).single();
    if (error || !data) {
      setProfile(null);
      Alert.alert('No pudimos cargar tu cuenta', 'Revisa tu conexión e inicia sesión de nuevo.');
      await supabase.auth.signOut();
      return;
    }
    if (!data.active) {
      Alert.alert('Cuenta desactivada', 'Tu cuenta está desactivada. Habla con el administrador.');
      await supabase.auth.signOut();
      return;
    }
    setProfile(data);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      let s = data.session;
      // Si la app estuvo cerrada mas de 30 minutos, se cierra la sesion
      if (s) {
        const last = Number(await AsyncStorage.getItem(LAST_ACTIVITY_KEY).catch(() => 0)) || 0;
        if (last && Date.now() - last > INACTIVITY_MS) {
          await supabase.auth.signOut();
          s = null;
        }
      }
      await loadProfile(s);
      setSession(s);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'INITIAL_SESSION' || event === 'PASSWORD_RECOVERY') return;
      setSession(s);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        // setTimeout evita llamar a Supabase dentro del propio callback de auth
        setTimeout(() => loadProfile(s), 0);
      }
      if (event === 'SIGNED_IN') touch();
      if (event === 'SIGNED_OUT') setRoute('welcome');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---------- Inactividad: 30 minutos ----------
  const touch = () => {
    lastActivity.current = Date.now();
    AsyncStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity.current)).catch(() => {});
  };

  const checkInactivity = useCallback(async () => {
    if (!session) return;
    if (Date.now() - lastActivity.current > INACTIVITY_MS) {
      await supabase.auth.signOut();
      Alert.alert('Sesión cerrada', 'Cerramos tu sesión por 30 minutos de inactividad.');
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(checkInactivity, 30 * 1000);
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') checkInactivity();
      else AsyncStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity.current)).catch(() => {});
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [session, checkInactivity]);

  // SENSOR: cada toque en la pantalla produce una vibracion suave (motor haptico)
  const onAnyTouch = () => {
    const now = Date.now();
    if (now - lastHaptic.current > 90) {
      lastHaptic.current = now;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (now - lastActivity.current > 5000) touch();
    else lastActivity.current = now;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const ready = fontsLoaded && session !== undefined && (!session || profile || recovering);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bg }} onTouchStart={onAnyTouch}>
        {!ready ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : session && profile && !recovering ? (
          <MainTabs profile={profile} onLogout={logout} onProfileChange={() => loadProfile(session)} />
        ) : route === 'login' ? (
          <LoginScreen onBack={() => setRoute('welcome')} onRegister={() => setRoute('register')} onForgot={() => setRoute('forgot')} />
        ) : route === 'register' ? (
          <RegisterScreen onBack={() => setRoute('welcome')} onLogin={() => setRoute('login')} />
        ) : route === 'forgot' ? (
          <ForgotPasswordScreen
            onBack={() => setRoute('login')}
            onRecovering={setRecovering}
          />
        ) : (
          <WelcomeScreen onLogin={() => setRoute('login')} onRegister={() => setRoute('register')} />
        )}
      </View>
    </SafeAreaProvider>
  );
}
