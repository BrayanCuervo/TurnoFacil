import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme';
import { errorMessage, supabase } from '../lib/supabase';
import { formatDate, formatTime, isoDate } from '../lib/time';
import { CalendarIcon, ClockIcon, PhoneIcon, ScissorsIcon, UserIcon } from '../components/Icons';
import { Chip, EmptyState, FadeInView, Field, Loading, PrimaryButton, Screen, Sheet, SmallButton, StatusBadge, shared } from '../components/UI';
import { APPT_SELECT } from './AppointmentsScreen';

// El barbero solo VE sus citas. Puede marcarlas como Atendida / No atendida
// y pedirle al administrador un cambio, pero no puede modificarlas directamente.
export default function BarberAgendaScreen({ profile }) {
  const [list, setList] = useState(null);
  const [requests, setRequests] = useState([]);
  const [view, setView] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  const [reqFor, setReqFor] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [{ data, error: e1 }, { data: reqs }] = await Promise.all([
      supabase.from('appointments').select(APPT_SELECT).eq('barber_id', profile.id).order('starts_at'),
      supabase.from('change_requests').select('appointment_id, status, admin_note').eq('barber_id', profile.id),
    ]);
    if (e1) Alert.alert('Error', errorMessage(e1));
    setList(data || []);
    setRequests(reqs || []);
  }, [profile.id]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('barber-appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `barber_id=eq.${profile.id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests', filter: `barber_id=eq.${profile.id}` }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const mark = (a, status) => {
    const label = status === 'attended' ? 'Atendida' : 'No atendida';
    Alert.alert(`Marcar como ${label}`, `${a.client?.full_name} · ${a.service?.name}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          const { error: err } = await supabase.rpc('mark_appointment', { p_id: a.id, p_status: status });
          if (err) return Alert.alert('No se pudo marcar', errorMessage(err));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          load();
        },
      },
    ]);
  };

  const sendRequest = async () => {
    setError('');
    if (message.trim().length < 3) return setError('Escribe el motivo del cambio.');
    setSending(true);
    const { error: err } = await supabase.rpc('request_change', { p_appointment_id: reqFor.id, p_message: message.trim() });
    setSending(false);
    if (err) return setError(errorMessage(err));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setReqFor(null);
    setMessage('');
    Alert.alert('Solicitud enviada', 'El administrador revisará tu solicitud y te avisará por correo.');
    load();
  };

  const today = isoDate(Date.now());
  const now = Date.now();
  const all = list || [];
  const groups = {
    today: all.filter((a) => isoDate(a.starts_at) === today && a.status !== 'cancelled'),
    upcoming: all.filter((a) => isoDate(a.starts_at) > today && a.status === 'scheduled'),
    history: all.filter((a) => isoDate(a.starts_at) < today || a.status === 'cancelled').reverse(),
  };
  const shown = groups[view];
  const pendingFor = (id) => requests.find((r) => r.appointment_id === id && r.status === 'pending');
  const lastFor = (id) => requests.filter((r) => r.appointment_id === id && r.status !== 'pending').pop();

  return (
    <Screen title="Mi agenda" subtitle={`Hola, ${profile.full_name.split(' ')[0]}. Estas son tus citas.`} onRefresh={refresh} refreshing={refreshing}>
      <View style={[shared.row, { marginBottom: 14 }]}>
        <Chip label={`Hoy (${groups.today.length})`} active={view === 'today'} onPress={() => setView('today')} />
        <Chip label={`Próximas (${groups.upcoming.length})`} active={view === 'upcoming'} onPress={() => setView('upcoming')} />
        <Chip label="Historial" active={view === 'history'} onPress={() => setView('history')} />
      </View>

      {list === null ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState icon={CalendarIcon} title="No hay citas aquí" text="Cuando un cliente agende contigo, la verás en esta lista." />
      ) : (
        shown.map((a, i) => {
          const pending = pendingFor(a.id);
          const last = lastFor(a.id);
          const started = new Date(a.starts_at).getTime() <= now;
          return (
            <FadeInView key={a.id} delay={i * 50} style={shared.card}>
              <View style={shared.row}>
                <View style={{ flex: 1 }}>
                  <Text style={shared.name}>{a.client?.full_name || 'Cliente'}</Text>
                  <View style={[shared.row, { marginTop: 4 }]}>
                    <ScissorsIcon size={14} color={colors.gold} />
                    <Text style={styles.detail}>{a.service?.name}</Text>
                  </View>
                </View>
                <StatusBadge status={a.status} />
              </View>
              <View style={shared.divider} />
              <View style={shared.row}>
                <CalendarIcon size={16} color={colors.muted} />
                <Text style={styles.detail}>{formatDate(a.starts_at)}</Text>
                <View style={{ width: 14 }} />
                <ClockIcon size={15} color={colors.muted} />
                <Text style={styles.detail}>{formatTime(a.starts_at)} – {formatTime(a.ends_at)}</Text>
              </View>
              {a.client?.phone ? (
                <View style={[shared.row, { marginTop: 8 }]}>
                  <PhoneIcon size={16} color={colors.muted} />
                  <Text style={[styles.detail, { color: colors.gold }]} onPress={() => Linking.openURL(`tel:${a.client.phone}`)}>
                    {a.client.phone}
                  </Text>
                </View>
              ) : null}
              {a.status === 'cancelled' && a.cancel_reason ? <Text style={[shared.muted, { marginTop: 8 }]}>Motivo: {a.cancel_reason}</Text> : null}
              {pending ? <Text style={styles.pending}>⏳ Solicitud de cambio pendiente</Text> : null}
              {!pending && last ? (
                <Text style={[shared.muted, { marginTop: 8 }]}>
                  Última solicitud: {last.status === 'approved' ? 'aprobada' : 'rechazada'}
                  {last.admin_note ? ` · ${last.admin_note}` : ''}
                </Text>
              ) : null}

              {a.status === 'scheduled' ? (
                <View style={[shared.row, { marginTop: 14, justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8 }]}>
                  {!pending ? <SmallButton title="Pedir cambio" color={colors.muted} onPress={() => { setError(''); setReqFor(a); }} /> : null}
                  {started ? (
                    <>
                      <SmallButton title="No atendida" color="#E5A04B" onPress={() => mark(a, 'no_show')} />
                      <SmallButton title="Atendida" filled onPress={() => mark(a, 'attended')} />
                    </>
                  ) : null}
                </View>
              ) : null}
            </FadeInView>
          );
        })
      )}

      <Sheet visible={!!reqFor} title="Pedir cambio al administrador" onClose={() => setReqFor(null)}>
        {reqFor ? (
          <View style={[shared.row, { marginBottom: 14 }]}>
            <UserIcon size={16} color={colors.gold} />
            <Text style={styles.detail}>
              {reqFor.client?.full_name} · {formatDate(reqFor.starts_at)} {formatTime(reqFor.starts_at)}
            </Text>
          </View>
        ) : null}
        <Field
          label="¿Qué necesitas cambiar y por qué?"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          placeholder="Ej. Tengo una cita médica a esa hora, necesito que se reprograme."
        />
        {error ? <Text style={shared.error}>{error}</Text> : null}
        <PrimaryButton title="Enviar solicitud" onPress={sendRequest} loading={sending} height={52} style={{ marginTop: 18 }} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  detail: { marginLeft: 7, fontFamily: fonts.regular, fontSize: 13, color: '#D0D0D0', flexShrink: 1 },
  pending: { marginTop: 10, fontFamily: fonts.medium, fontSize: 12.5, color: '#E5A04B' },
});
