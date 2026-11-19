import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../../theme';
import { errorMessage, supabase } from '../../lib/supabase';
import { formatDate, formatPrice, formatTime, isoDate } from '../../lib/time';
import { CalendarIcon, ClockIcon, ScissorsIcon, UserIcon } from '../../components/Icons';
import { Chip, EmptyState, FadeInView, Loading, Screen, SmallButton, StatusBadge, shared } from '../../components/UI';
import { APPT_SELECT } from '../AppointmentsScreen';

function Stat({ label, value, delay }) {
  return (
    <FadeInView delay={delay} style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </FadeInView>
  );
}

export default function AdminAppointmentsScreen() {
  const [list, setList] = useState(null);
  const [view, setView] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('appointments').select(APPT_SELECT).order('starts_at', { ascending: true }).limit(500);
    if (error) Alert.alert('Error', errorMessage(error));
    setList(data || []);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const cancel = (a) =>
    Alert.alert('Cancelar cita', `Se avisará por correo a ${a.client?.full_name} y a ${a.barber?.full_name}.`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.rpc('cancel_appointment', { p_id: a.id, p_reason: 'Cancelada por la barbería' });
          if (error) return Alert.alert('No se pudo cancelar', errorMessage(error));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          load();
        },
      },
    ]);

  const all = list || [];
  const today = isoDate(Date.now());
  const month = today.slice(0, 7);
  const now = Date.now();
  const groups = {
    upcoming: all.filter((a) => a.status === 'scheduled' && new Date(a.ends_at).getTime() > now),
    today: all.filter((a) => isoDate(a.starts_at) === today),
    done: all.filter((a) => a.status === 'attended' || a.status === 'no_show' || (a.status === 'scheduled' && new Date(a.ends_at).getTime() <= now)).reverse(),
    cancelled: all.filter((a) => a.status === 'cancelled').reverse(),
  };
  const income = all
    .filter((a) => a.status === 'attended' && isoDate(a.starts_at).startsWith(month))
    .reduce((s, a) => s + a.price, 0);
  const shown = groups[view];

  return (
    <Screen title="Citas" subtitle="Todas las citas de la barbería." onRefresh={refresh} refreshing={refreshing}>
      <View style={styles.stats}>
        <Stat label="Hoy" value={groups.today.filter((a) => a.status !== 'cancelled').length} delay={0} />
        <Stat label="Próximas" value={groups.upcoming.length} delay={80} />
        <Stat label="Ingresos mes" value={formatPrice(income)} delay={160} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14, flexGrow: 0 }}>
        <Chip label="Próximas" active={view === 'upcoming'} onPress={() => setView('upcoming')} />
        <Chip label="Hoy" active={view === 'today'} onPress={() => setView('today')} />
        <Chip label="Pasadas" active={view === 'done'} onPress={() => setView('done')} />
        <Chip label={`Canceladas (${groups.cancelled.length})`} active={view === 'cancelled'} onPress={() => setView('cancelled')} />
      </ScrollView>

      {list === null ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState icon={CalendarIcon} title="No hay citas aquí" />
      ) : (
        shown.map((a, i) => (
          <FadeInView key={a.id} delay={Math.min(i, 8) * 40} style={shared.card}>
            <View style={shared.row}>
              <View style={{ flex: 1 }}>
                <Text style={shared.name}>{a.service?.name}</Text>
                <Text style={shared.gold}>{formatPrice(a.price)}</Text>
              </View>
              <StatusBadge status={a.status} />
            </View>
            <View style={shared.divider} />
            <View style={shared.row}>
              <CalendarIcon size={16} color={colors.muted} />
              <Text style={styles.detail}>{formatDate(a.starts_at)}</Text>
              <View style={{ width: 14 }} />
              <ClockIcon size={15} color={colors.muted} />
              <Text style={styles.detail}>{formatTime(a.starts_at)}</Text>
            </View>
            <View style={[shared.row, { marginTop: 8 }]}>
              <UserIcon size={16} color={colors.muted} />
              <Text style={styles.detail}>Cliente: {a.client?.full_name} {a.client?.phone ? `· ${a.client.phone}` : ''}</Text>
            </View>
            <View style={[shared.row, { marginTop: 8 }]}>
              <ScissorsIcon size={15} color={colors.muted} />
              <Text style={styles.detail}>Barbero: {a.barber?.full_name}</Text>
            </View>
            {a.status === 'cancelled' ? (
              <Text style={[shared.muted, { marginTop: 8 }]}>
                {a.cancel_reason || 'Cancelada'}
                {a.cancelled_at ? ` · ${formatDate(a.cancelled_at)} ${formatTime(a.cancelled_at)}` : ''}
              </Text>
            ) : null}
            {view === 'upcoming' ? (
              <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
                <SmallButton title="Cancelar cita" color={colors.error} onPress={() => cancel(a)} />
              </View>
            ) : null}
          </FadeInView>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 12 },
  statValue: { fontFamily: fonts.semibold, fontSize: 18, color: colors.gold },
  statLabel: { marginTop: 2, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  detail: { marginLeft: 7, fontFamily: fonts.regular, fontSize: 13, color: '#D0D0D0', flexShrink: 1 },
});
