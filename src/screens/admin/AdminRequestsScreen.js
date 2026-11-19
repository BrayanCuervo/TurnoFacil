import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../../theme';
import { errorMessage, supabase } from '../../lib/supabase';
import { formatDate, formatTime } from '../../lib/time';
import { InboxIcon } from '../../components/Icons';
import { Chip, EmptyState, FadeInView, Field, Loading, PrimaryButton, OutlineButton, Screen, Sheet, SmallButton, shared } from '../../components/UI';

const SELECT =
  '*, barber:profiles!change_requests_barber_id_fkey(full_name), appointment:appointments(starts_at, status, service:services(name), client:profiles!appointments_client_id_fkey(full_name))';

// Solicitudes de cambio que envian los barberos
export default function AdminRequestsScreen({ onPendingCount }) {
  const [list, setList] = useState(null);
  const [view, setView] = useState('pending');
  const [current, setCurrent] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('change_requests').select(SELECT).order('created_at', { ascending: false });
    if (error) Alert.alert('Error', errorMessage(error));
    setList(data || []);
    onPendingCount?.((data || []).filter((r) => r.status === 'pending').length);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-reqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [load]);

  const resolve = async (approve) => {
    setSaving(true);
    const { error } = await supabase.rpc('resolve_change_request', { p_id: current.id, p_approve: approve, p_note: note.trim() || null });
    setSaving(false);
    if (error) return Alert.alert('Error', errorMessage(error));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCurrent(null);
    setNote('');
    load();
  };

  const shown = (list || []).filter((r) => (view === 'pending' ? r.status === 'pending' : r.status !== 'pending'));

  return (
    <Screen
      title="Solicitudes"
      subtitle="Cambios que piden los barberos."
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <View style={[shared.row, { marginBottom: 14 }]}>
        <Chip label="Pendientes" active={view === 'pending'} onPress={() => setView('pending')} />
        <Chip label="Resueltas" active={view === 'done'} onPress={() => setView('done')} />
      </View>

      {list === null ? (
        <Loading />
      ) : shown.length === 0 ? (
        <EmptyState icon={InboxIcon} title={view === 'pending' ? 'Todo al día' : 'Sin solicitudes resueltas'} text="Aquí aparecen las solicitudes de los barberos." />
      ) : (
        shown.map((r, i) => (
          <FadeInView key={r.id} delay={Math.min(i, 8) * 40} style={shared.card}>
            <View style={shared.row}>
              <Text style={[shared.name, { flex: 1 }]}>{r.barber?.full_name}</Text>
              <Text style={shared.muted}>{formatDate(r.created_at)}</Text>
            </View>
            <Text style={styles.msg}>"{r.message}"</Text>
            <View style={shared.divider} />
            <Text style={shared.meta}>
              {r.appointment?.service?.name} · {r.appointment?.client?.full_name}
            </Text>
            <Text style={shared.muted}>
              {r.appointment ? `${formatDate(r.appointment.starts_at)} · ${formatTime(r.appointment.starts_at)}` : ''}
            </Text>
            {r.status === 'pending' ? (
              <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
                <SmallButton title="Revisar" filled onPress={() => { setNote(''); setCurrent(r); }} />
              </View>
            ) : (
              <Text style={[styles.result, { color: r.status === 'approved' ? colors.success : colors.error }]}>
                {r.status === 'approved' ? 'Aprobada · cita cancelada' : 'Rechazada'}
                {r.admin_note ? ` · ${r.admin_note}` : ''}
              </Text>
            )}
          </FadeInView>
        ))
      )}

      <Sheet visible={!!current} title="Resolver solicitud" onClose={() => setCurrent(null)}>
        {current ? (
          <>
            <Text style={shared.meta}>
              <Text style={{ color: colors.gold }}>{current.barber?.full_name}</Text> pide: "{current.message}"
            </Text>
            <Text style={[shared.muted, { marginTop: 8 }]}>
              Si apruebas, la cita se cancela y se avisa por correo al cliente para que reagende.
            </Text>
            <Field label="Nota para el barbero (opcional)" value={note} onChangeText={setNote} multiline maxLength={300} style={{ marginTop: 16 }} />
            <PrimaryButton title="Aprobar y cancelar la cita" onPress={() => resolve(true)} loading={saving} height={52} style={{ marginTop: 18 }} />
            <OutlineButton title="Rechazar" color={colors.error} onPress={() => resolve(false)} disabled={saving} height={52} style={{ marginTop: 10 }} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  msg: { marginTop: 8, fontFamily: fonts.regular, fontSize: 14, color: colors.white, fontStyle: 'italic' },
  result: { marginTop: 10, fontFamily: fonts.medium, fontSize: 12.5 },
});
