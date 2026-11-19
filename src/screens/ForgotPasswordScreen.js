import React, { useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { callFunction, errorMessage, supabase } from '../lib/supabase';
import { BrandName, FadeInView, Field, LogoMark, PrimaryButton, shared } from '../components/UI';
import { LockIcon, MailIcon } from '../components/Icons';

// Recuperar contrasena: se envia un codigo al correo y con el se crea una nueva
export default function ForgotPasswordScreen({ onBack, onRecovering }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fail = (msg) => {
    setError(msg);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const sendCode = async () => {
    setError('');
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return fail('Escribe un correo válido.');
    setLoading(true);
    const { error: err } = await callFunction('auth-public', { action: 'password_reset', email: e });
    setLoading(false);
    if (err) return fail(errorMessage(err));
    setStep(2);
  };

  const changePassword = async () => {
    setError('');
    if (!/^\d{6,10}$/.test(code.trim())) return fail('Escribe el código que te llegó al correo.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      return fail('La contraseña debe tener al menos 8 caracteres, con letras y números.');
    if (password !== confirm) return fail('Las contraseñas no coinciden.');
    setLoading(true);
    onRecovering(true);
    const { error: vErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: 'recovery',
    });
    if (vErr) {
      onRecovering(false);
      setLoading(false);
      return fail(errorMessage(vErr));
    }
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (uErr) {
      await supabase.auth.signOut();
      onRecovering(false);
      return fail(/different|same/i.test(uErr.message) ? 'La nueva contraseña debe ser distinta a la anterior.' : errorMessage(uErr));
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.');
    onRecovering(false); // entra a la app con la sesion iniciada
  };

  return (
    <View style={styles.fill}>
      <ImageBackground source={require('../../assets/images/welcome-bg.jpg')} style={StyleSheet.absoluteFill} blurRadius={18}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(16,16,16,0.78)' }]} />
      </ImageBackground>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 30, paddingTop: insets.top + 26, paddingBottom: insets.bottom + 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={onBack} style={styles.brandRow} hitSlop={10}>
            <LogoMark size={40} />
            <BrandName size={18} style={{ marginLeft: 12 }} />
          </Pressable>

          {step === 1 ? (
            <FadeInView key="s1">
              <Text style={styles.title}>Recupera tu contraseña</Text>
              <Text style={styles.subtitle}>Te enviaremos un código a tu correo para crear una contraseña nueva.</Text>
              <Field label="Correo electrónico" icon={MailIcon} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={{ marginTop: 26 }} />
              {error ? <Text style={shared.error}>{error}</Text> : null}
              <PrimaryButton title="Enviar código" onPress={sendCode} loading={loading} style={{ marginTop: 24 }} />
            </FadeInView>
          ) : (
            <FadeInView key="s2">
              <Text style={styles.title}>Crea tu nueva contraseña</Text>
              <Text style={styles.subtitle}>
                Si {email.trim()} tiene cuenta, te llegó un código. Revisa también la carpeta de spam.
              </Text>
              <Field label="Código" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={10} placeholder="Ej. 123456" style={{ marginTop: 26 }} />
              <Field label="Nueva contraseña" icon={LockIcon} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" style={{ marginTop: 16 }} />
              <Field label="Confirmar contraseña" icon={LockIcon} value={confirm} onChangeText={setConfirm} secureTextEntry autoCapitalize="none" style={{ marginTop: 16 }} />
              {error ? <Text style={shared.error}>{error}</Text> : null}
              <PrimaryButton title="Cambiar contraseña" onPress={changePassword} loading={loading} style={{ marginTop: 24 }} />
              <Pressable onPress={() => setStep(1)} style={{ marginTop: 18, alignSelf: 'center' }} hitSlop={8}>
                <Text style={styles.link}>Volver a enviar el código</Text>
              </Pressable>
            </FadeInView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  brandRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  title: { marginTop: 30, fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.5, color: colors.white },
  subtitle: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: '#A3A3A3' },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold },
});
