import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { supabase } from '../lib/supabase';
import { CalendarIcon, HomeIcon, InboxIcon, MapIcon, ScissorsIcon, UserIcon, UsersIcon } from '../components/Icons';
import { FadeInView, SuccessOverlay } from '../components/UI';
import BookingSheet from '../components/BookingSheet';
import HomeScreen from './HomeScreen';
import ServicesScreen from './ServicesScreen';
import AppointmentsScreen from './AppointmentsScreen';
import MapScreen from './MapScreen';
import ProfileScreen from './ProfileScreen';
import BarberAgendaScreen from './BarberAgendaScreen';
import AdminAppointmentsScreen from './admin/AdminAppointmentsScreen';
import AdminServicesScreen from './admin/AdminServicesScreen';
import AdminUsersScreen from './admin/AdminUsersScreen';
import AdminRequestsScreen from './admin/AdminRequestsScreen';

// Pestanas que ve cada rol
const TABS = {
  client: [
    { key: 'home', label: 'Inicio', Icon: HomeIcon },
    { key: 'services', label: 'Servicios', Icon: ScissorsIcon },
    { key: 'appointments', label: 'Mis citas', Icon: CalendarIcon },
    { key: 'map', label: 'Ubicación', Icon: MapIcon },
    { key: 'profile', label: 'Perfil', Icon: UserIcon },
  ],
  barber: [
    { key: 'agenda', label: 'Agenda', Icon: CalendarIcon },
    { key: 'map', label: 'Ubicación', Icon: MapIcon },
    { key: 'profile', label: 'Perfil', Icon: UserIcon },
  ],
  admin: [
    { key: 'admin-appts', label: 'Citas', Icon: CalendarIcon },
    { key: 'admin-services', label: 'Servicios', Icon: ScissorsIcon },
    { key: 'admin-users', label: 'Usuarios', Icon: UsersIcon },
    { key: 'admin-requests', label: 'Solicitudes', Icon: InboxIcon },
    { key: 'profile', label: 'Perfil', Icon: UserIcon },
  ],
};

export default function MainTabs({ profile, onLogout, onProfileChange }) {
  const insets = useSafeAreaInsets();
  const tabs = TABS[profile.role] || TABS.client;
  const [tab, setTab] = useState(tabs[0].key);
  const [services, setServices] = useState([]);
  const [booking, setBooking] = useState(null);
  const [success, setSuccess] = useState(false);
  const [apptKey, setApptKey] = useState(0);
  const [pending, setPending] = useState(0);

  const loadServices = useCallback(async () => {
    const { data } = await supabase.from('services').select('*').eq('active', true).order('price');
    setServices(data || []);
  }, []);

  useEffect(() => {
    if (profile.role === 'client') loadServices();
    if (profile.role === 'admin') {
      supabase
        .from('change_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .then(({ count }) => setPending(count || 0));
    }
  }, [profile.role]);

  const go = (key) => {
    if (key !== tab) Haptics.selectionAsync().catch(() => {});
    setTab(key);
    if (key === 'home' || key === 'services') loadServices();
  };

  let screen = null;
  switch (tab) {
    case 'home':
      screen = <HomeScreen services={services} profile={profile} onOpenServices={() => go('services')} onBook={setBooking} />;
      break;
    case 'services':
      screen = <ServicesScreen services={services} onBook={setBooking} />;
      break;
    case 'appointments':
      screen = <AppointmentsScreen profile={profile} refreshKey={apptKey} onOpenServices={() => go('services')} />;
      break;
    case 'map':
      screen = <MapScreen />;
      break;
    case 'agenda':
      screen = <BarberAgendaScreen profile={profile} />;
      break;
    case 'admin-appts':
      screen = <AdminAppointmentsScreen />;
      break;
    case 'admin-services':
      screen = <AdminServicesScreen />;
      break;
    case 'admin-users':
      screen = <AdminUsersScreen profile={profile} />;
      break;
    case 'admin-requests':
      screen = <AdminRequestsScreen onPendingCount={setPending} />;
      break;
    default:
      screen = <ProfileScreen profile={profile} onLogout={onLogout} onProfileChange={onProfileChange} />;
  }

  return (
    <View style={styles.fill}>
      {/* Cada cambio de pestana entra con una animacion suave */}
      <FadeInView key={tab} distance={10} style={styles.fill}>
        {screen}
      </FadeInView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {tabs.map(({ key, label, Icon }) => {
          const active = tab === key;
          const color = active ? colors.gold : '#8E8E8E';
          return (
            <Pressable key={key} onPress={() => go(key)} style={styles.tab} hitSlop={4}>
              <View>
                <Icon size={24} color={color} />
                {key === 'admin-requests' && pending > 0 ? (
                  <View style={styles.dot}>
                    <Text style={styles.dotText}>{pending}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.tabLabel, { color, fontFamily: active ? fonts.semibold : fonts.regular }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {booking ? (
        <BookingSheet
          service={booking}
          onClose={() => setBooking(null)}
          onBooked={() => {
            setBooking(null);
            setSuccess(true);
          }}
        />
      ) : null}

      <SuccessOverlay
        visible={success}
        title="¡Cita agendada!"
        subtitle="Te enviamos la confirmación por correo y te recordaremos 24 horas antes."
        onDone={() => {
          setSuccess(false);
          setApptKey((k) => k + 1);
          setTab('appointments');
        }}
      />
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
  tabLabel: { marginTop: 5, fontSize: 11 },
  dot: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dotText: { fontFamily: fonts.semibold, fontSize: 10, color: '#fff' },
});
