import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../../theme';
import { callFunction, errorMessage, supabase } from '../../lib/supabase';
import { formatDate } from '../../lib/time';
import { LockIcon, MailIcon, PhoneIcon, PlusIcon, UserIcon, UsersIcon } from '../../components/Icons';
import { Chip, EmptyState, FadeInView, Field, Loading, PrimaryButton, Screen, Sheet, SmallButton, shared } from '../../components/UI';

function makePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  let p = '';
  for (let i = 0; i < 6; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p + Math.floor(10 + Math.random() * 89);
}

// El admin ve barberos y clientes, crea barberos (usuario y contrasena) y los activa/desactiva
export default function AdminUsersScreen({ profile }) {
  const [list, setList] = useState(null);
  const [view, setView] = useState('barber');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('profiles').select('*').order('full_name');
    if (err) Alert.alert('Error', errorMessage(err));
    setList(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const create = async () => {
    setError('');
    if (form.full_name.trim().length < 3) return setError('Escribe el nombre completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError('El correo no es válido.');
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      return setError('La contraseña debe tener al menos 8 caracteres, con letras y números.');
    setSaving(true);
    const { error: err } = await callFunction('admin-users', {
      action: 'create_barber',
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setSaving(false);
    if (err) return setError(errorMessage(err));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Barbero creado', `Le enviamos a ${form.email.trim()} su usuario y contraseña por correo.`);
    setForm(null);
    load();
  };

  const toggle = (u) => {
    const next = !u.active;
    Alert.alert(
      next ? 'Activar usuario' : 'Desactivar usuario',
      next ? `${u.full_name} podrá volver a entrar.` : `${u.full_name} ya no podrá iniciar sesión. Sus datos se conservan.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: next ? 'Activar' : 'Desactivar',
          style: next ? 'default' : 'destructive',
          onPress: async () => {
            const { error: err } = await callFunction('admin-users', { action: 'set_active', user_id: u.id, active: next });
            if (err) return Alert.alert('Error', errorMessage(err));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            load();
          },
        },
      ]
    );
  };

  const all = list || [];
  const shown = all.filter((u) => u.role === view);
  const count = (r) => all.filter((u) => u.role === r).length;

  return (
    <Screen
      title="Usuarios"
      subtitle="Barberos, clientes y administradores."
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      refreshing={refreshing}
      right={
        view === 'barber' ? (
          <Pressable
            onPress={() => {
              setError('');
              setForm({ full_name: '', email: '', phone: '', password: makePassword() });
            }}
            style={styles.add}
            hitSlop={6}
          >
            <PlusIcon size={22} color="#1A1A1A" />
          </Pressable>
        ) : null
      }
    >
      <View style={[shared.row, { marginBottom: 14 }]}>
        <Chip label={`Barberos (${count('barber')})`} active={view === 'barber'} onPress={() => setView('barber')} />
        <Chip label={`Clientes (${count('client')})`} active={view === 'client'} onPress={() => setView('client')} />
        <Chip label="Admin" active={view === 'admin'} onPress={() => setView('admin')} />
      </View>

      {list === null ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={view === 'barber' ? 'Aún no hay barberos' : 'Sin usuarios'}
          text={view === 'barber' ? 'Crea el primero con el botón +.' : 'Los clientes aparecen aquí cuando se registran.'}
        />
      ) : (
        shown.map((u, i) => (
          <FadeInView key={u.id} delay={Math.min(i, 8) * 40} style={[shared.card, !u.active && { opacity: 0.55 }]}>
            <View style={shared.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(u.full_name || u.email).slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={shared.name}>{u.full_name || 'Sin nombre'}</Text>
                <Text style={shared.muted}>{u.email}</Text>
                <Text style={shared.muted}>
                  {u.phone || 'Sin teléfono'} · desde {formatDate(u.created_at)}
                </Text>
              </View>
              <Text style={[styles.state, { color: u.active ? colors.success : colors.error }]}>
                {u.active ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            {u.id !== profile.id && u.role !== 'admin' ? (
              <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                <SmallButton title={u.active ? 'Desactivar' : 'Activar'} color={u.active ? colors.error : colors.success} onPress={() => toggle(u)} />
              </View>
            ) : null}
          </FadeInView>
        ))
      )}

      <Sheet visible={!!form} title="Nuevo barbero" onClose={() => setForm(null)}>
        {form ? (
          <>
            <Field label="Nombre completo" icon={UserIcon} value={form.full_name} onChangeText={set('full_name')} autoCapitalize="words" />
            <Field label="Correo (será su usuario)" icon={MailIcon} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" style={{ marginTop: 14 }} />
            <Field label="Teléfono" icon={PhoneIcon} value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" style={{ marginTop: 14 }} />
            <Field
              label="Contraseña"
              icon={LockIcon}
              value={form.password}
              onChangeText={set('password')}
              autoCapitalize="none"
              style={{ marginTop: 14 }}
              right={
                <Pressable onPress={() => set('password')(makePassword())} hitSlop={8}>
                  <Text style={styles.gen}>Generar</Text>
                </Pressable>
              }
            />
            <Text style={[shared.muted, { marginTop: 10 }]}>Le enviaremos el usuario y la contraseña a su correo.</Text>
            {error ? <Text style={shared.error}>{error}</Text> : null}
            <PrimaryButton title="Crear barbero" onPress={create} loading={saving} height={52} style={{ marginTop: 18 }} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.semibold, fontSize: 17, color: colors.gold },
  state: { fontFamily: fonts.medium, fontSize: 12 },
  gen: { fontFamily: fonts.semibold, fontSize: 13, color: colors.gold },
});

