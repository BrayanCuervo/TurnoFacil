import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, TEST_USER } from '../theme';
import { BellIcon, CalendarIcon, ChevronRightIcon, HelpIcon, LogoutIcon, UserIcon } from '../components/Icons';

const soon = () => Alert.alert('Próximamente', 'Esta sección estará disponible en la próxima versión.');

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

export default function ProfileScreen({ appointmentsCount, onLogout }) {
  const insets = useSafeAreaInsets();
  const initials = TEST_USER.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  const confirmLogout = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: onLogout },
    ]);

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text style={styles.name}>{TEST_USER.name}</Text>
          <Text style={styles.email}>{TEST_USER.email}</Text>
        </View>
      </View>

      <View style={styles.group}>
        <Row icon={UserIcon} label="Mis datos" onPress={soon} />
        <Row icon={CalendarIcon} label="Historial de citas" value={String(appointmentsCount)} onPress={soon} />
        <Row icon={BellIcon} label="Notificaciones" onPress={soon} />
        <Row icon={HelpIcon} label="Ayuda" onPress={soon} />
      </View>

      <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
        <LogoutIcon size={19} color={colors.gold} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={styles.version}>TurnoFácil MVP v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.semibold, fontSize: 28, color: colors.white, letterSpacing: -0.5 },
  header: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.semibold, fontSize: 20, color: '#1A1A1A' },
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.white },
  email: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  group: { marginTop: 18, backgroundColor: colors.card, borderRadius: 18, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 58 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
