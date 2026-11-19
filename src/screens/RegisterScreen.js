import React, { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { callFunction, errorMessage, supabase } from '../lib/supabase';
import { BrandName, FadeInView, Field, LogoMark, PrimaryButton, shared } from '../components/UI';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from '../components/Icons';

// Solo los clientes se registran. Barberos los crea el administrador.
export default function RegisterScreen({ onBack, onLogin }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [hidden, setHidden] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (error) setError('');
  };

  const submit = async () => {
    const email = form.email.trim().toLowerCase();
    let msg = '';
    if (form.full_name.trim().length < 3) msg = 'Escribe tu nombre completo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) msg = 'El correo no es válido.';
    else if (!/^[0-9+ ]{7,15}$/.test(form.phone.trim())) msg = 'Escribe un teléfono válido.';
    else if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      msg = 'La contraseña debe tener al menos 8 caracteres, con letras y números.';
    else if (form.password !== form.confirm) msg = 'Las contraseñas no coinciden.';
    if (msg) {
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    setLoading(true);
    const { error: err } = await callFunction('auth-public', {
      action: 'register_client',
      full_name: form.full_name.trim(),
      email,
      phone: form.phone.trim(),
      password: form.password,
    });
    if (err) {
      setLoading(false);
      setError(errorMessage(err));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password: form.password });
    setLoading(false);
    if (loginErr) onLogin();
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
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onBack} style={styles.brandRow} hitSlop={10}>
            <LogoMark size={40} />
            <BrandName size={18} style={{ marginLeft: 12 }} />
          </Pressable>
          <FadeInView>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Regístrate como cliente para agendar tus citas.</Text>
          </FadeInView>

          <FadeInView delay={100}>
            <Field label="Nombre completo" icon={UserIcon} value={form.full_name} onChangeText={set('full_name')} autoCapitalize="words" style={styles.mt} />
            <Field label="Correo electrónico" icon={MailIcon} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" style={styles.mt} />
            <Field label="Teléfono" icon={PhoneIcon} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" style={styles.mt} />
            <Field
              label="Contraseña"
              icon={LockIcon}
              value={form.password}
              onChangeText={set('password')}
              secureTextEntry={hidden}
              autoCapitalize="none"
              placeholder="Mínimo 8, con letras y números"
              style={styles.mt}
              right={
                <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12}>
                  {hidden ? <EyeOffIcon size={21} color="#8C8C8C" /> : <EyeIcon size={21} color="#8C8C8C" />}
                </Pressable>
              }
            />
            <Field label="Confirmar contraseña" icon={LockIcon} value={form.confirm} onChangeText={set('confirm')} secureTextEntry={hidden} autoCapitalize="none" style={styles.mt} />
          </FadeInView>

          {error ? <Text style={shared.error}>{error}</Text> : null}
          <PrimaryButton title="Crear cuenta" onPress={submit} loading={loading} style={{ marginTop: 24 }} />

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={onLogin} hitSlop={8}>
              <Text style={styles.link}>Inicia sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  brandRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  title: { marginTop: 30, fontFamily: fonts.semibold, fontSize: 30, letterSpacing: -0.5, color: colors.white },
  subtitle: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 22, color: '#A3A3A3' },
  mt: { marginTop: 16 },
  bottomRow: { marginTop: 28, flexDirection: 'row', justifyContent: 'center' },
  bottomText: { fontFamily: fonts.regular, fontSize: 14, color: '#A3A3A3' },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold },
});
