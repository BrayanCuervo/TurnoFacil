import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, imageFor } from '../theme';
import { errorMessage, supabase } from '../lib/supabase';
import { formatDateLong, formatPrice, formatTime, nextBusinessDays } from '../lib/time';
import { Chip, PrimaryButton, Sheet, shared } from './UI';

export default function BookingSheet({ service, onClose, onBooked }) {
  const [barbers, setBarbers] = useState([]);
  const [barberId, setBarberId] = useState(null); // null = cualquier barbero disponible
  const days = React.useMemo(() => nextBusinessDays(14), []);
  const [day, setDay] = useState(days[0].iso);
  const [slots, setSlots] = useState(null);
  const [slot, setSlot] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'barber')
      .eq('active', true)
      .order('full_name')
      .then(({ data }) => setBarbers(data || []));
  }, []);

  const loadSlots = async () => {
    setSlots(null);
    setSlot(null);
    const { data, error: err } = await supabase.rpc('get_available_slots', { p_date: day, p_barber_id: barberId });
    if (err) {
      setError(errorMessage(err));
      setSlots([]);
      return;
    }
    setSlots(data || []);
  };

  useEffect(() => {
    if (service) loadSlots();
  }, [day, barberId, service]);

  const confirm = async () => {
    if (!slot) return;
    setSaving(true);
    setError('');
    const { error: err } = await supabase.rpc('book_appointment', {
      p_service_id: service.id,
      p_starts_at: slot,
      p_barber_id: barberId,
    });
    setSaving(false);
    if (err) {
      setError(errorMessage(err));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      loadSlots();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onBooked();
  };

  if (!service) return null;
  return (
    <Sheet visible title="Agendar cita" onClose={onClose}>
      <View style={[shared.row, styles.serviceBox]}>
        <Image source={imageFor(service.image_key)} style={styles.thumb} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={shared.name}>{service.name}</Text>
          <Text style={shared.gold}>
            {formatPrice(service.price)} <Text style={shared.muted}>· {service.duration_min} min</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Barbero</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip label="Cualquiera disponible" active={barberId === null} onPress={() => setBarberId(null)} />
        {barbers.map((b) => (
          <Chip key={b.id} label={b.full_name} active={barberId === b.id} onPress={() => setBarberId(b.id)} />
        ))}
      </ScrollView>
      {barbers.length === 0 ? <Text style={[shared.muted, { marginTop: 8 }]}>Todavía no hay barberos registrados.</Text> : null}

      <Text style={styles.label}>Día</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((d) => {
          const active = d.iso === day;
          return (
            <Pressable key={d.iso} onPress={() => setDay(d.iso)} style={[styles.day, active && styles.dayActive]}>
              <Text style={[styles.dayName, active && styles.dayTextActive]}>{d.day}</Text>
              <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.num}</Text>
              <Text style={[styles.dayName, active && styles.dayTextActive]}>{d.month}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Hora</Text>
      {slots === null ? (
        <ActivityIndicator color={colors.gold} style={{ marginVertical: 18 }} />
      ) : slots.length === 0 ? (
        <Text style={shared.muted}>No quedan horarios este día. Prueba con otro.</Text>
      ) : (
        <View style={styles.slots}>
          {slots.map((s) => {
            const free = s.available_barbers > 0;
            const active = slot === s.slot_start;
            return (
              <Pressable
                key={s.slot_start}
                disabled={!free}
                onPress={() => setSlot(s.slot_start)}
                style={[styles.slot, active && styles.slotActive, !free && styles.slotBusy]}
              >
                <Text style={[styles.slotText, active && { color: '#1A1A1A' }, !free && styles.slotBusyText]}>
                  {formatTime(s.slot_start)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {slot ? (
        <Text style={[shared.meta, { marginTop: 14 }]}>
          Tu cita: <Text style={{ color: colors.gold }}>{formatDateLong(slot)}, {formatTime(slot)}</Text>
        </Text>
      ) : null}
      {error ? <Text style={shared.error}>{error}</Text> : null}
      <PrimaryButton title="Confirmar cita" onPress={confirm} disabled={!slot} loading={saving} style={{ marginTop: 18 }} />
      <Text style={[shared.muted, { marginTop: 10, textAlign: 'center' }]}>Puedes cancelar hasta 12 horas antes.</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  serviceBox: { backgroundColor: colors.card, borderRadius: 16, padding: 12 },
  thumb: { width: 54, height: 54, borderRadius: 12 },
  label: { fontFamily: fonts.medium, fontSize: 14.5, color: colors.white, marginTop: 20, marginBottom: 10 },
  day: {
    width: 62,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    marginRight: 8,
  },
  dayActive: { backgroundColor: colors.gold },
  dayName: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted },
  dayNum: { fontFamily: fonts.semibold, fontSize: 19, color: colors.white, marginVertical: 1 },
  dayTextActive: { color: '#1A1A1A' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', marginRight: -8 },
  slot: {
    width: '31%',
    marginRight: '2.3%',
    marginBottom: 8,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  slotBusy: { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  slotText: { fontFamily: fonts.medium, fontSize: 13, color: colors.gold },
  slotBusyText: { color: '#555', textDecorationLine: 'line-through' },
});
