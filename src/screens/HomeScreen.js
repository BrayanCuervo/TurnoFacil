import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, imageFor } from '../theme';
import { formatPrice } from '../lib/time';
import { FadeInView } from '../components/UI';
import { ClockIcon, FilterIcon, SearchIcon } from '../components/Icons';

const PAD = 22;
const GAP = 13;

export function ServiceCard({ service, width, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width, opacity: pressed ? 0.85 : 1 }]}
    >
      <Image source={imageFor(service.image_key)} style={{ width, height: width * 0.62 }} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {service.name}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardPrice}>{formatPrice(service.price)}</Text>
          <View style={styles.duration}>
            <ClockIcon size={13} color="#9A9A9A" />
            <Text style={styles.durationText}>{service.duration_min} min</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen({ services, onOpenServices, onBook, profile }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const cardW = (width - PAD * 2 - GAP) / 2;

  const combo = services.find((s) => /barba/i.test(s.name) && /corte/i.test(s.name)) || services[0];
  const list = services.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.search}>
        <SearchIcon size={22} color="#8A8A8A" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar servicios"
          placeholderTextColor="#8A8A8A"
          style={styles.searchInput}
          selectionColor={colors.gold}
          keyboardAppearance="dark"
          returnKeyType="search"
        />
        <Pressable style={styles.filterBtn} onPress={onOpenServices} hitSlop={6}>
          <FilterIcon size={21} color={colors.gold} />
        </Pressable>
      </View>

      <ImageBackground
        source={require('../../assets/images/banner.jpg')}
        style={styles.banner}
        imageStyle={{ borderRadius: 20 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(14,14,14,0.85)', 'rgba(14,14,14,0.45)', 'rgba(14,14,14,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.45, 0.85]}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerKicker}>Hola, {(profile?.full_name || '').split(' ')[0]}</Text>
          <Text style={styles.bannerTitle}>Agenda tu</Text>
          <Text style={[styles.bannerTitle, styles.bannerGold]}>{combo ? combo.name : 'próximo corte'}</Text>
          <Pressable
            onPress={() => combo && onBook(combo)}
            style={({ pressed }) => [styles.bannerBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.bannerBtnText}>Reservar ahora</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Servicios destacados</Text>
        <Pressable onPress={onOpenServices} hitSlop={8}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {list.map((s, i) => (
          <FadeInView key={s.id} delay={i * 70}>
            <ServiceCard service={s} width={cardW} onPress={() => onBook(s)} />
          </FadeInView>
        ))}
        {list.length === 0 && <Text style={styles.empty}>No encontramos servicios con ese nombre.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  search: {
    marginHorizontal: PAD,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    height: '100%',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    marginTop: 22,
    marginHorizontal: PAD,
    height: 174,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  bannerContent: { flex: 1, justifyContent: 'center', paddingLeft: 22 },
  bannerKicker: { fontFamily: fonts.regular, fontSize: 12.5, color: '#E8E8E8' },
  bannerTitle: {
    fontFamily: fonts.semibold,
    fontSize: 20,
    lineHeight: 25,
    color: colors.white,
    letterSpacing: -0.3,
  },
  bannerGold: { color: colors.gold, lineHeight: 30 },
  bannerBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 12,
    justifyContent: 'center',
  },
  bannerBtnText: { fontFamily: fonts.semibold, fontSize: 13.5, color: '#1A1A1A' },
  sectionHeader: {
    marginTop: 30,
    marginHorizontal: PAD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontFamily: fonts.medium, fontSize: 18, color: colors.white, letterSpacing: -0.2 },
  seeAll: { fontFamily: fonts.regular, fontSize: 13.5, color: colors.gold },
  grid: {
    marginTop: 16,
    paddingHorizontal: PAD,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GAP,
  },
  card: { backgroundColor: colors.card, borderRadius: 18, overflow: 'hidden' },
  cardBody: { paddingHorizontal: 13, paddingTop: 13, paddingBottom: 15 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.white },
  cardMeta: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardPrice: { fontFamily: fonts.semibold, fontSize: 15, color: colors.gold },
  duration: { flexDirection: 'row', alignItems: 'center' },
  durationText: { marginLeft: 4, fontFamily: fonts.regular, fontSize: 11.5, color: '#9A9A9A' },
  empty: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, paddingVertical: 20 },
});
