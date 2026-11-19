import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { CalendarIcon, ClockIcon, PinIcon } from '../components/Icons';
import { PrimaryButton } from '../components/UI';

export default function AppointmentsScreen({ appointments, onCancel, onOpenServices }) {
  const insets = useSafeAreaInsets();

  const confirmCancel = (a) =>
    Alert.alert('Cancelar cita', `¿Deseas cancelar tu cita de ${a.service.name}?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => onCancel(a.id) },
    ]);

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 22, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Mis citas</Text>
      <Text style={styles.subtitle}>Tus próximas reservas en TurnoFácil.</Text>

      {appointments.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <CalendarIcon size={30} color={colors.gold} />
          </View>
          <Text style={styles.emptyTitle}>Aún no tienes citas</Text>
          <Text style={styles.emptyText}>Reserva tu próximo corte y aparecerá aquí.</Text>
          <PrimaryButton title="Reservar ahora" height={52} onPress={onOpenServices} style={{ alignSelf: 'stretch', marginTop: 24 }} />
        </View>
      ) : (
        appointments.map((a) => (
          <View key={a.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Image source={a.service.image} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{a.service.name}</Text>
                <Text style={styles.price}>{a.service.price}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Confirmada</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detail}>
              <CalendarIcon size={16} color={colors.muted} />
              <Text style={styles.detailText}>{a.date}</Text>
              <View style={{ width: 16 }} />
              <ClockIcon size={15} color={colors.muted} />
              <Text style={styles.detailText}>{a.time}</Text>
            </View>
            <View style={[styles.detail, { marginTop: 8 }]}>
              <PinIcon size={16} color={colors.muted} />
              <Text style={styles.detailText}>TurnoFácil Barbería - Sede Centro</Text>
            </View>
            <Pressable onPress={() => confirmCancel(a)} style={styles.cancel} hitSlop={6}>
              <Text style={styles.cancelText}>Cancelar cita</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.semibold, fontSize: 28, color: colors.white, letterSpacing: -0.5 },
  subtitle: { marginTop: 4, marginBottom: 18, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 18, fontFamily: fonts.semibold, fontSize: 18, color: colors.white },
  emptyText: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 54, height: 54, borderRadius: 12 },
  name: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.white },
  price: { marginTop: 2, fontFamily: fonts.semibold, fontSize: 14, color: colors.gold },
  badge: { backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.medium, fontSize: 11.5, color: '#6CCB72' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 14 },
  detail: { flexDirection: 'row', alignItems: 'center' },
  detailText: { marginLeft: 7, fontFamily: fonts.regular, fontSize: 13, color: '#D0D0D0' },
  cancel: { marginTop: 14, alignSelf: 'flex-end' },
  cancelText: { fontFamily: fonts.medium, fontSize: 13, color: colors.error },
});
