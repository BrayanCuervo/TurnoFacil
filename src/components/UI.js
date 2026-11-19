import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { LogoScissors } from './Icons';

// Circulo dorado con tijeras agrega el aro exterior fino.
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
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        { height, opacity: pressed || disabled ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#1A1A1A" />
      ) : (
        <Text style={[styles.primaryText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function OutlineButton({ title, onPress, height = 58, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.outline, { height, opacity: pressed ? 0.7 : 1 }, style]}
    >
      <Text style={styles.outlineText}>{title}</Text>
    </Pressable>
  );
}

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
  primaryText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#1A1A1A',
  },
  outline: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20,20,20,0.35)',
  },
  outlineText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.gold,
  },
});
