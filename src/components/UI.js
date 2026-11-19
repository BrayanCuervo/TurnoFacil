import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, STATUS } from '../theme';
import { CheckIcon, LogoScissors } from './Icons';

// Circulo dorado con tijeras y aro exterior fino.
export function LogoMark({ size = 104 }) {
  const inner = size * 0.76;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: colors.goldBorder,
        backgroundColor: 'rgba(20,20,20,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: colors.gold,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoScissors size={inner * 0.62} color="#141414" />
      </View>
    </View>
  );
}

// ANIMACION 1: el logo "late" suavemente y gira un poco al aparecer
export function AnimatedLogo({ size = 104 }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, pulse) }, { rotate: spin }] }}>
      <LogoMark size={size} />
    </Animated.View>
  );
}

// ANIMACION 2: los elementos entran deslizandose y apareciendo (con retraso escalonado)
export function FadeInView({ delay = 0, distance = 18, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ANIMACION 3: check dorado que "explota" al confirmar una reserva
export function SuccessOverlay({ visible, title, subtitle, onDone }) {
  const scale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    ring.setValue(0);
    fade.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.delay(900),
      Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onDone?.());
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal transparent visible animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] }) }],
              },
            ]}
          />
          <Animated.View style={[styles.check, { transform: [{ scale }] }]}>
            <CheckIcon size={46} color="#1A1A1A" />
          </Animated.View>
        </View>
        <Text style={styles.overlayTitle}>{title}</Text>
        {subtitle ? <Text style={styles.overlaySub}>{subtitle}</Text> : null}
      </Animated.View>
    </Modal>
  );
}

export function BrandName({ size = 18, style }) {
  return (
    <Text style={[{ fontFamily: fonts.semibold, fontSize: size, color: colors.white, letterSpacing: -0.3 }, style]}>
      Turno<Text style={{ color: colors.gold }}>Fácil</Text>
    </Text>
  );
}

export function PrimaryButton({ title, onPress, height = 58, style, textStyle, disabled, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primary,
        { height, opacity: pressed || disabled ? 0.6 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={[styles.primaryText, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, height = 58, style, color = colors.gold, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outline,
        { height, opacity: pressed || disabled ? 0.6 : 1, borderColor: color === colors.gold ? colors.goldBorder : color },
        style,
      ]}
    >
      <Text style={[styles.outlineText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function SmallButton({ title, onPress, color = colors.gold, filled, style, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.small,
        filled ? { backgroundColor: color, borderColor: color } : { borderColor: color },
        { opacity: pressed || disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={[styles.smallText, { color: filled ? '#1A1A1A' : color }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, icon: Icon, right, style, inputRef, ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputBox, focused && styles.inputBoxFocused, props.multiline && { height: 96, alignItems: 'flex-start', paddingTop: 14 }]}>
        {Icon ? <Icon size={20} color={focused ? colors.gold : '#8C8C8C'} /> : null}
        <TextInput
          ref={inputRef}
          placeholderTextColor="#7A7A7A"
          selectionColor={colors.gold}
          keyboardAppearance="dark"
          autoCorrect={false}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, !Icon && { marginLeft: 0 }, props.multiline && { height: 70, textAlignVertical: 'top' }]}
        />
        {right}
      </View>
    </View>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.scheduled;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive, style]} hitSlop={4}>
      <Text style={[styles.chipText, active && { color: '#1A1A1A', fontFamily: fonts.semibold }]}>{label}</Text>
    </Pressable>
  );
}

// Pantalla con titulo, subtitulo y "jalar para recargar"
export function Screen({ title, subtitle, right, onRefresh, refreshing = false, children, contentStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[{ paddingTop: insets.top + 14, paddingBottom: 28, paddingHorizontal: 22, flexGrow: 1 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} colors={[colors.gold]} /> : undefined
      }
    >
      {title ? (
        <FadeInView style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </FadeInView>
      ) : null}
      {children}
    </ScrollView>
  );
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <FadeInView style={styles.empty}>
      {Icon ? (
        <View style={styles.emptyIcon}>
          <Icon size={30} color={colors.gold} />
        </View>
      ) : null}
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
      {children}
    </FadeInView>
  );
}

export function Loading() {
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.section, style]}>{children}</Text>;
}

// Hoja inferior para formularios (crear servicio, crear barbero, etc.)
export function Sheet({ visible, title, onClose, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.sheetBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const shared = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 14, marginBottom: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: fonts.semibold, fontSize: 15.5, color: colors.white },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: '#D0D0D0' },
  muted: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
  gold: { fontFamily: fonts.semibold, fontSize: 14, color: colors.gold },
  error: { fontFamily: fonts.regular, fontSize: 13, color: colors.error, marginTop: 10 },
});

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  primaryText: { fontFamily: fonts.semibold, fontSize: 16, color: '#1A1A1A' },
  outline: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,20,0.35)',
  },
  outlineText: { fontFamily: fonts.semibold, fontSize: 16 },
  small: { borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, height: 34, justifyContent: 'center' },
  smallText: { fontFamily: fonts.semibold, fontSize: 12.5 },
  label: { fontFamily: fonts.regular, fontSize: 13.5, color: '#E8E8E8', marginBottom: 8 },
  inputBox: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputBoxFocused: { borderColor: 'rgba(212,175,55,0.65)' },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    marginRight: 6,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.white,
    paddingVertical: 0,
  },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.medium, fontSize: 11.5 },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: '#D8D8D8' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  title: { fontFamily: fonts.semibold, fontSize: 28, color: colors.white, letterSpacing: -0.5 },
  subtitle: { marginTop: 4, fontFamily: fonts.regular, fontSize: 14, color: colors.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: 18, fontFamily: fonts.semibold, fontSize: 18, color: colors.white, textAlign: 'center' },
  emptyText: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
  section: { fontFamily: fonts.medium, fontSize: 17, color: colors.white, marginTop: 18, marginBottom: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.88)', alignItems: 'center', justifyContent: 'center', padding: 30 },
  ring: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: colors.gold },
  check: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: { marginTop: 28, fontFamily: fonts.semibold, fontSize: 22, color: colors.white, textAlign: 'center' },
  overlaySub: { marginTop: 6, fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    maxHeight: '90%',
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#444', marginBottom: 14 },
  sheetTitle: { fontFamily: fonts.semibold, fontSize: 20, color: colors.white, marginBottom: 16 },
});
