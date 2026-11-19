import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, SERVICES } from '../theme';
import { ClockIcon } from '../components/Icons';

export default function ServicesScreen({ onBook }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 22 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Servicios</Text>
      <Text style={styles.subtitle}>Elige tu servicio y reserva en segundos.</Text>

      {SERVICES.map((s) => (
        <View key={s.id} style={styles.row}>
          <Image source={s.image} style={styles.thumb} resizeMode="cover" />
          <View style={styles.info}>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.desc} numberOfLines={2}>
              {s.description}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.price}>{s.price}</Text>
              <View style={styles.duration}>
                <ClockIcon size={13} color="#9A9A9A" />
                <Text style={styles.durationText}>{s.duration}</Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => onBook(s)}
            style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.bookText}>Reservar</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.semibold, fontSize: 28, color: colors.white, letterSpacing: -0.5 },
  subtitle: { marginTop: 4, marginBottom: 18, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  thumb: { width: 76, height: 76, borderRadius: 14 },
  info: { flex: 1, marginLeft: 12, marginRight: 8 },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  desc: { marginTop: 2, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.muted },
  meta: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  price: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold, marginRight: 12 },
  duration: { flexDirection: 'row', alignItems: 'center' },
  durationText: { marginLeft: 4, fontFamily: fonts.regular, fontSize: 11.5, color: '#9A9A9A' },
  bookBtn: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
  },
  bookText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.gold },
});
