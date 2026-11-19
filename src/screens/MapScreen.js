import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
// Android: Google Maps (clave en app.json). iPhone: Apple Maps.
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BARBERSHOP, colors, fonts } from '../theme';
import { ClockIcon, NavigationIcon, PinIcon } from '../components/Icons';
import { FadeInView, PrimaryButton } from '../components/UI';

const SHOP = { latitude: BARBERSHOP.latitude, longitude: BARBERSHOP.longitude };

// Distancia en km entre dos puntos (formula de Haversine)
function distanceKm(a, b) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState('Buscando tu ubicación…');

  useEffect(() => {
    let sub;
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('Activa el permiso de ubicación para ver qué tan lejos estás.');
        return;
      }
      // GPS del celular: se actualiza mientras te mueves
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 25 },
        (pos) => {
          const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setMe((prev) => {
            if (!prev) {
              mapRef.current?.fitToCoordinates([p, SHOP], {
                edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
                animated: true,
              });
            }
            return p;
          });
          setStatus('');
        }
      ).catch(() => setStatus('No pudimos obtener tu ubicación.'));
    })();
    return () => sub?.remove?.();
  }, []);

  const directions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const dest = encodeURIComponent(BARBERSHOP.address);
    const origin = me ? `&origin=${me.latitude},${me.longitude}` : '';
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}&travelmode=driving`);
  };

  const centerShop = () => {
    mapRef.current?.animateToRegion({ ...SHOP, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600);
  };

  const km = me ? distanceKm(me, SHOP) : null;

  return (
    <View style={styles.fill}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...SHOP, latitudeDelta: 0.012, longitudeDelta: 0.012 }}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
        userInterfaceStyle="dark"
      >
        <Marker coordinate={SHOP} title={BARBERSHOP.name} description={BARBERSHOP.address} pinColor={colors.gold} />
      </MapView>

      <View style={[styles.topPill, { top: insets.top + 10 }]}>
        <Text style={styles.topText}>Ubicación</Text>
      </View>

      <FadeInView distance={40} style={styles.card}>
        <Text style={styles.name}>{BARBERSHOP.name}</Text>
        <Pressable onPress={centerShop} style={styles.row} hitSlop={6}>
          <PinIcon size={16} color={colors.gold} />
          <Text style={styles.text}>{BARBERSHOP.address}</Text>
        </Pressable>
        <View style={styles.row}>
          <ClockIcon size={15} color={colors.gold} />
          <Text style={styles.text}>{BARBERSHOP.hours}</Text>
        </View>
        <View style={styles.row}>
          <NavigationIcon size={15} color={colors.gold} />
          <Text style={styles.text}>
            {km !== null ? `Estás a ${km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`} de la barbería` : status}
          </Text>
        </View>
        <PrimaryButton title="Cómo llegar (Google Maps)" height={52} onPress={directions} style={{ marginTop: 14 }} />
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  topPill: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(20,20,20,0.85)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.white },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(28,28,28,0.97)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontFamily: fonts.semibold, fontSize: 18, color: colors.white, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  text: { marginLeft: 8, fontFamily: fonts.regular, fontSize: 13.5, color: '#D0D0D0', flexShrink: 1 },
});
