import React, { useRef, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, TEST_USER } from '../theme';
import { BrandName, LogoMark, PrimaryButton } from '../components/UI';
import { AppleIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon } from '../components/Icons';

const soon = () => Alert.alert('Próximamente', 'Esta opción estará disponible en la próxima versión.');

function Field({ label, icon: Icon, focused, children, right, style }) {
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <Icon size={20} color={focused ? colors.gold : '#8C8C8C'} />
        {children}
        {right}
      </View>
    </View>
  );
}

export default function LoginScreen({ onSuccess, onBack }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focus, setFocus] = useState(null);
  const [hidden, setHidden] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const passRef = useRef(null);

  const submit = () => {
    setError('');
    const ok =
      email.trim().toLowerCase() === TEST_USER.email && password === TEST_USER.password;
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y contraseña.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    if (!ok) {
      setError('Correo o contraseña incorrectos.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 600);
  };

  return (
    <View style={styles.fill}>
      <ImageBackground
        source={require('../../assets/images/welcome-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        blurRadius={18}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(16,16,16,0.72)' }]} />
      </ImageBackground>

      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 28 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onBack} style={styles.brandRow} hitSlop={10}>
            <LogoMark size={40} />
            <BrandName size={18} style={{ marginLeft: 12 }} />
          </Pressable>

          <Text style={styles.title}>Inicia sesión</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta para gestionar tus citas y mucho más.</Text>

          <Field label="Correo electrónico" icon={MailIcon} focused={focus === 'email'} style={{ marginTop: 30 }}>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError('');
              }}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus(null)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
              selectionColor={colors.gold}
              keyboardAppearance="dark"
            />
          </Field>

          <Field
            label="Contraseña"
            icon={LockIcon}
            focused={focus === 'password'}
            style={{ marginTop: 22 }}
            right={
              <Pressable onPress={() => setHidden((h) => !h)} hitSlop={12}>
                {hidden ? <EyeOffIcon size={21} color="#8C8C8C" /> : <EyeIcon size={21} color="#8C8C8C" />}
              </Pressable>
            }
          >
            <TextInput
              ref={passRef}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
              style={styles.input}
              secureTextEntry={hidden}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              selectionColor={colors.gold}
              keyboardAppearance="dark"
            />
          </Field>

          <View style={styles.forgotRow}>
            {error ? <Text style={styles.error}>{error}</Text> : <View />}
            <Pressable onPress={soon} hitSlop={8}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <PrimaryButton
            title="Iniciar sesión"
            onPress={submit}
            disabled={loading}
            loading={loading}
            style={{ marginTop: 22 }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable onPress={soon} style={({ pressed }) => [styles.social, pressed && { opacity: 0.7 }]}>
              <GoogleIcon size={17} />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <View style={{ width: 13 }} />
            <Pressable onPress={soon} style={({ pressed }) => [styles.social, pressed && { opacity: 0.7 }]}>
              <AppleIcon size={18} />
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <Pressable onPress={soon} hitSlop={8}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, paddingHorizontal: 30 },
  brandRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  title: {
    marginTop: 38,
    fontFamily: fonts.semibold,
    fontSize: 31,
    letterSpacing: -0.5,
    color: colors.white,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 23,
    color: '#A3A3A3',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    color: '#E8E8E8',
    marginBottom: 10,
  },
  inputBox: {
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  inputBoxFocused: {
    borderColor: 'rgba(212,175,55,0.65)',
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 14,
    marginRight: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    paddingVertical: 0,
  },
  forgotRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgot: { fontFamily: fonts.medium, fontSize: 13, color: colors.gold },
  error: { flex: 1, fontFamily: fonts.regular, fontSize: 12.5, color: colors.error, marginRight: 8 },
  dividerRow: { marginTop: 32, flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.18)' },
  dividerText: {
    marginHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#8F8F8F',
  },
  socialRow: { marginTop: 30, flexDirection: 'row' },
  social: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(48,48,48,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: { marginLeft: 9, fontFamily: fonts.semibold, fontSize: 14.5, color: colors.white },
  registerRow: { marginTop: 36, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontFamily: fonts.regular, fontSize: 14, color: '#A3A3A3' },
  registerLink: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold },
});
