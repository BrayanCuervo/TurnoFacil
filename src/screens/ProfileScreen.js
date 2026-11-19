import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BARBERSHOP, colors, fonts, ROLE_LABEL } from '../theme';
import { errorMessage, supabase } from '../lib/supabase';
import { ChevronRightIcon, HelpIcon, LockIcon, LogoutIcon, PhoneIcon, UserIcon } from '../components/Icons';
import { FadeInView, Field, PrimaryButton, Screen, Sheet, shared } from '../components/UI';

function Row({ icon: Icon, label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={styles.rowIcon}>
        <Icon size={19} color={colors.gold} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <ChevronRightIcon size={18} color="#6E6E6E" />
    </Pressable>
  );
}

export default function ProfileScreen({ profile, onLogout, onProfileChange }) {
  const [editing, setEditing] = useState(null); // 'data' | 'password'
  const [name, setName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = (profile.full_name || profile.email)
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: onLogout },
    ]);

  const saveData = async () => {
    setError('');
    if (name.trim().length < 3) return setError('Escribe tu nombre completo.');
    if (phone.trim() && !/^[0-9+ ]{7,15}$/.test(phone.trim())) return setError('El teléfono no es válido.');
    setSaving(true);
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq('id', profile.id);
    setSaving(false);
    if (err) return setError(errorMessage(err));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setEditing(null);
    onProfileChange();
  };

  const savePassword = async () => {
    setError('');
    if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass))
      return setError('La contraseña debe tener al menos 8 caracteres, con letras y números.');
    if (pass !== pass2) return setError('Las contraseñas no coinciden.');
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    setSaving(false);
    if (err) return setError(/different|same/i.test(err.message) ? 'Debe ser distinta a la actual.' : errorMessage(err));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setPass('');
    setPass2('');
    setEditing(null);
    Alert.alert('Listo', 'Tu contraseña fue actualizada.');
  };

  return (
    <Screen title="Perfil">
      <FadeInView style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={styles.name}>{profile.full_name || 'Sin nombre'}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{ROLE_LABEL[profile.role]}</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={100} style={styles.group}>
        <Row icon={UserIcon} label="Mis datos" onPress={() => { setError(''); setEditing('data'); }} />
        <Row icon={PhoneIcon} label="Teléfono" value={profile.phone || '—'} onPress={() => { setError(''); setEditing('data'); }} />
        <Row icon={LockIcon} label="Cambiar contraseña" onPress={() => { setError(''); setEditing('password'); }} />
        <Row
          icon={HelpIcon}
          label="Ayuda"
          onPress={() => Alert.alert('Ayuda', `${BARBERSHOP.name}\n${BARBERSHOP.address}\n${BARBERSHOP.hours}\n\nEscríbenos a turnofacil70@gmail.com`)}
        />
      </FadeInView>

      <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
        <LogoutIcon size={19} color={colors.gold} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={styles.version}>TurnoFácil v2.0.0 · La sesión se cierra tras 30 min sin uso</Text>

      <Sheet visible={editing === 'data'} title="Mis datos" onClose={() => setEditing(null)}>
        <Field label="Nombre completo" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ marginTop: 14 }} />
        {error ? <Text style={shared.error}>{error}</Text> : null}
        <PrimaryButton title="Guardar" onPress={saveData} loading={saving} height={52} style={{ marginTop: 20 }} />
      </Sheet>

      <Sheet visible={editing === 'password'} title="Cambiar contraseña" onClose={() => setEditing(null)}>
        <Field label="Nueva contraseña" value={pass} onChangeText={setPass} secureTextEntry autoCapitalize="none" />
        <Field label="Confirmar contraseña" value={pass2} onChangeText={setPass2} secureTextEntry autoCapitalize="none" style={{ marginTop: 14 }} />
        {error ? <Text style={shared.error}>{error}</Text> : null}
        <PrimaryButton title="Actualizar contraseña" onPress={savePassword} loading={saving} height={52} style={{ marginTop: 20 }} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, padding: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.semibold, fontSize: 20, color: '#1A1A1A' },
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.white },
  email: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  roleTag: { alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.goldSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  roleText: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.gold },
  group: { marginTop: 18, backgroundColor: colors.card, borderRadius: 18, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 58 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, marginLeft: 12, fontFamily: fonts.regular, fontSize: 14.5, color: colors.white },
  rowValue: { marginRight: 8, fontFamily: fonts.medium, fontSize: 13.5, color: colors.gold },
  logout: {
    marginTop: 22,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { marginLeft: 10, fontFamily: fonts.semibold, fontSize: 15, color: colors.gold },
  version: { marginTop: 18, textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: '#5E5E5E' },
});
