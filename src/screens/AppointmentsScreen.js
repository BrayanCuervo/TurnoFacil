import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, imageFor, BARBERSHOP } from '../theme';
import { errorMessage, supabase } from '../lib/supabase';
import { formatDate, formatPrice, formatTime, hoursUntil } from '../lib/time';
import { CalendarIcon, ClockIcon, PinIcon, UserIcon } from '../components/Icons';
import { Chip, EmptyState, FadeInView, Loading, PrimaryButton, Screen, StatusBadge, shared } from '../components/UI';

export const APPT_SELECT =
  '*, service:services(name, image_key), barber:profiles!appointments_barber_id_fkey(full_name), client:profiles!appointments_client_id_fkey(full_name, email, phone)';

export default function AppointmentsScreen({ profile, onOpenServices, refreshKey }) {
  const [list, setList] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('upcoming');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPT_SELECT)
      .eq('client_id', profile.id)
      .order('starts_at', { ascending: false });
    if (error) Alert.alert('Error', errorMessage(error));
    setList(data || []);
  }, [profile.id]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // Si el barbero marca la cita o el admin la cancela, se actualiza solo
  useEffect(() => {
    const ch = supabase
      .channel('client-appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `client_id=eq.${profile.id}` }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [profile.id, load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const cancel = (a) => {
    if (hoursUntil(a.starts_at) < 12) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert('No se puede cancelar', 'Solo puedes cancelar hasta 12 horas antes de la cita.');
      return;
    }
    Alert.alert('Cancelar cita', `¿Deseas cancelar tu cita de ${a.service?.name}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('cancel_appointment', { p_id: a.id });
          if (error) return Alert.alert('No se pudo cancelar', errorMessage(error));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          load();
        },
      },
    ]);
  };

  const now = Date.now();
  const upcoming = (list || [])
    .filter((a) => a.status === 'scheduled' && new Date(a.ends_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const history = (list || []).filter((a) => !upcoming.includes(a));
  const shown = view === 'upcoming' ? upcoming : history;

  return (
    <Screen title="Mis citas" subtitle="Tus reservas en TurnoFácil." onRefresh={refresh} refreshing={refreshing}>
      <View style={[shared.row, { marginBottom: 14 }]}>
        <Chip label={`Próximas (${upcoming.length})`} active={view === 'upcoming'} onPress={() => setView('upcoming')} />
        <Chip label={`Historial (${history.length})`} active={view === 'history'} onPress={() => setView('history')} />
      </View>

      {list === null ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={view === 'upcoming' ? 'No tienes citas próximas' : 'Aún no hay historial'}
          text={view === 'upcoming' ? 'Reserva tu próximo corte y aparecerá aquí.' : 'Aquí verás tus citas pasadas y canceladas.'}
        >
          {view === 'upcoming' ? (
            <PrimaryButton title="Reservar ahora" height={52} onPress={onOpenServices} style={{ alignSelf: 'stretch', marginTop: 24 }} />
          ) : null}
        </EmptyState>
      ) : (
        shown.map((a, i) => (
          <FadeInView key={a.id} delay={i * 60} style={shared.card}>
            <View style={shared.row}>
              <Image source={imageFor(a.service?.image_key)} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={shared.name}>{a.service?.name || 'Servicio'}</Text>
                <Text style={shared.gold}>{formatPrice(a.price)}</Text>
              </View>
              <StatusBadge status={a.status} />
            </View>
            <View style={shared.divider} />
            <View style={shared.row}>
              <CalendarIcon size={16} color={colors.muted} />
              <Text style={styles.detail}>{formatDate(a.starts_at)}</Text>
              <View style={{ width: 16 }} />
              <ClockIcon size={15} color={colors.muted} />
              <Text style={styles.detail}>{formatTime(a.starts_at)}</Text>
            </View>
            <View style={[shared.row, { marginTop: 8 }]}>
              <UserIcon size={16} color={colors.muted} />
              <Text style={styles.detail}>Barbero: {a.barber?.full_name || '—'}</Text>
            </View>
            <View style={[shared.row, { marginTop: 8 }]}>
              <PinIcon size={16} color={colors.muted} />
              <Text style={styles.detail}>{BARBERSHOP.address}</Text>
            </View>
            {a.status === 'cancelled' && a.cancel_reason ? (
              <Text style={[shared.muted, { marginTop: 8 }]}>Motivo: {a.cancel_reason}</Text>
            ) : null}
            {view === 'upcoming' ? (
              <Pressable onPress={() => cancel(a)} style={styles.cancel} hitSlop={6}>
                <Text style={[styles.cancelText, hoursUntil(a.starts_at) < 12 && { color: colors.mutedDark }]}>
                  {hoursUntil(a.starts_at) < 12 ? 'Ya no se puede cancelar (menos de 12 h)' : 'Cancelar cita'}
                </Text>
              </Pressable>
            ) : null}
          </FadeInView>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 54, height: 54, borderRadius: 12 },
  detail: { marginLeft: 7, fontFamily: fonts.regular, fontSize: 13, color: '#D0D0D0', flexShrink: 1 },
  cancel: { marginTop: 14, alignSelf: 'flex-end' },
  cancelText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});
