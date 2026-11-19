import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { CalendarIcon, HomeIcon, ScissorsIcon, UserIcon } from '../components/Icons';
import HomeScreen from './HomeScreen';
import ServicesScreen from './ServicesScreen';
import AppointmentsScreen from './AppointmentsScreen';
import ProfileScreen from './ProfileScreen';

const TABS = [
  { key: 'home', label: 'Inicio', Icon: HomeIcon },
  { key: 'services', label: 'Servicios', Icon: ScissorsIcon },
  { key: 'appointments', label: 'Mis citas', Icon: CalendarIcon },
  { key: 'profile', label: 'Perfil', Icon: UserIcon },
];

const TIMES = ['10:00 a. m.', '3:00 p. m.', '6:00 p. m.'];

function tomorrowLabel() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

export default function MainTabs({ onLogout }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');
  const [appointments, setAppointments] = useState([]);

  const go = (key) => {
    if (key !== tab) Haptics.selectionAsync().catch(() => {});
    setTab(key);
  };

  const book = (service) => {
    const date = tomorrowLabel();
    Alert.alert(`Reservar ${service.name}`, `${service.price} · ${service.duration}\nElige un horario para mañana (${date}):`, [
      ...TIMES.map((time) => ({
        text: time,
        onPress: () => {
          setAppointments((prev) => [{ id: `${Date.now()}`, service, date, time }, ...prev]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setTab('appointments');
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  let screen = null;
  if (tab === 'home') screen = <HomeScreen onOpenServices={() => go('services')} onBook={book} />;
  if (tab === 'services') screen = <ServicesScreen onBook={book} />;
  if (tab === 'appointments')
    screen = (
      <AppointmentsScreen
        appointments={appointments}
        onCancel={(id) => setAppointments((prev) => prev.filter((a) => a.id !== id))}
        onOpenServices={() => go('services')}
      />
    );
  if (tab === 'profile') screen = <ProfileScreen appointmentsCount={appointments.length} onLogout={onLogout} />;

  return (
    <View style={styles.fill}>
      <View style={styles.fill}>{screen}</View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          const color = active ? colors.gold : '#8E8E8E';
          return (
            <Pressable key={key} onPress={() => go(key)} style={styles.tab} hitSlop={4}>
              <Icon size={25} color={color} />
              <Text style={[styles.tabLabel, { color, fontFamily: active ? fonts.semibold : fonts.regular }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 12,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabLabel: { marginTop: 5, fontSize: 12 },
});
