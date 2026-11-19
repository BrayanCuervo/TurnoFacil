import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/screens/MainTabs';

const SESSION_KEY = 'turnofacil_session';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });
  const [route, setRoute] = useState(null); // 'welcome' | 'login' | 'main'

  // Restaura la sesion del usuario de prueba si ya habia iniciado sesion
  useEffect(() => {
    SecureStore.getItemAsync(SESSION_KEY)
      .then((v) => setRoute(v ? 'main' : 'welcome'))
      .catch(() => setRoute('welcome'));
  }, []);

  const login = () => {
    SecureStore.setItemAsync(SESSION_KEY, '1').catch(() => {});
    setRoute('main');
  };

  const logout = () => {
    SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
    setRoute('welcome');
  };

  if (!fontsLoaded || !route) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {route === 'welcome' && <WelcomeScreen onLogin={() => setRoute('login')} />}
        {route === 'login' && <LoginScreen onSuccess={login} onBack={() => setRoute('welcome')} />}
        {route === 'main' && <MainTabs onLogout={logout} />}
      </View>
    </SafeAreaProvider>
  );
}
