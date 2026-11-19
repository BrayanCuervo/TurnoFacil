import React from 'react';
import { ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { AnimatedLogo, FadeInView, OutlineButton, PrimaryButton } from '../components/UI';

export default function WelcomeScreen({ onLogin, onRegister }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <ImageBackground
      source={require('../../assets/images/welcome-bg.jpg')}
      style={styles.fill}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(10,10,10,0.15)', 'rgba(10,10,10,0.05)', 'rgba(10,10,10,0.55)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.brandBlock, { paddingTop: height * 0.255 }]}>
        <AnimatedLogo size={104} />
        <Text style={styles.title}>
          Turno<Text style={{ color: colors.gold }}>Fácil</Text>
        </Text>
        <View style={styles.taglineRow}>
          <View style={styles.line} />
          <Text style={styles.tagline}>TU CITA, SIN{'\n'}COMPLICACIONES</Text>
          <View style={styles.line} />
        </View>
      </View>

      <FadeInView delay={500} distance={30} style={[styles.actions, { paddingBottom: insets.bottom + 52 }]}>
        <PrimaryButton title="Iniciar sesión" onPress={onLogin} />
        <OutlineButton title="Crear cuenta" style={{ marginTop: 14 }} onPress={onRegister} />
      </FadeInView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  brandBlock: { flex: 1, alignItems: 'center' },
  title: {
    marginTop: 34,
    fontFamily: fonts.semibold,
    fontSize: 42,
    letterSpacing: -0.8,
    color: colors.white,
  },
  taglineRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 44,
  },
  line: {
    width: 50,
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.7)',
    marginTop: 10,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    letterSpacing: 0.4,
    color: '#E6DFD1',
    textAlign: 'center',
    marginHorizontal: 18,
  },
  actions: { paddingHorizontal: 30 },
});
