import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, imageFor, SERVICE_IMAGES } from '../../theme';
import { errorMessage, supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/time';
import { PlusIcon, ScissorsIcon } from '../../components/Icons';
import { EmptyState, FadeInView, Field, Loading, PrimaryButton, Screen, Sheet, shared } from '../../components/UI';

const EMPTY = { id: null, name: '', description: '', price: '', duration_min: '60', image_key: 'corte-clasico', active: true };

// El administrador crea servicios (tintura, barba, etc.) y les pone precio
export default function AdminServicesScreen({ onChanged }) {
  const [list, setList] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('services').select('*').order('active', { ascending: false }).order('name');
    if (err) Alert.alert('Error', errorMessage(err));
    setList(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const open = (s) => {
    setError('');
    setForm(s ? { ...s, price: String(s.price), duration_min: String(s.duration_min) } : { ...EMPTY });
  };

  const save = async () => {
    setError('');
    const price = parseInt(String(form.price).replace(/\D/g, ''), 10);
    const duration = parseInt(form.duration_min, 10);
    if (form.name.trim().length < 2) return setError('Escribe el nombre del servicio.');
    if (!Number.isFinite(price) || price < 0) return setError('Escribe un precio válido (solo números).');
    if (!Number.isFinite(duration) || duration < 15 || duration > 240) return setError('La duración debe estar entre 15 y 240 minutos.');
    const row = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      duration_min: duration,
      image_key: form.image_key,
      active: form.active,
    };
    setSaving(true);
    const { error: err } = form.id
      ? await supabase.from('services').update(row).eq('id', form.id)
      : await supabase.from('services').insert(row);
    setSaving(false);
    if (err) return setError(errorMessage(err));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setForm(null);
    load();
    onChanged?.();
  };

  return (
    <Screen
      title="Servicios"
      subtitle="Crea servicios y ponles precio."
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
      refreshing={refreshing}
      right={
        <Pressable onPress={() => open(null)} style={styles.add} hitSlop={6}>
          <PlusIcon size={22} color="#1A1A1A" />
        </Pressable>
      }
    >
      {list === null ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState icon={ScissorsIcon} title="Sin servicios" text="Crea el primero con el botón +." />
      ) : (
        list.map((s, i) => (
          <FadeInView key={s.id} delay={i * 40}>
            <Pressable onPress={() => open(s)} style={[shared.card, shared.row, !s.active && { opacity: 0.5 }]}>
              <Image source={imageFor(s.image_key)} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={shared.name}>{s.name}</Text>
                <Text style={shared.muted} numberOfLines={1}>
                  {s.description || 'Sin descripción'}
                </Text>
                <Text style={[shared.gold, { marginTop: 2 }]}>
                  {formatPrice(s.price)} <Text style={shared.muted}>· {s.duration_min} min</Text>
                </Text>
              </View>
              {!s.active ? <Text style={styles.off}>Inactivo</Text> : null}
            </Pressable>
          </FadeInView>
        ))
      )}

      <Sheet visible={!!form} title={form?.id ? 'Editar servicio' : 'Nuevo servicio'} onClose={() => setForm(null)}>
        {form ? (
          <>
            <Field label="Nombre" value={form.name} onChangeText={set('name')} placeholder="Ej. Tintura" autoCapitalize="sentences" />
            <Field label="Descripción" value={form.description} onChangeText={set('description')} multiline maxLength={200} style={{ marginTop: 14 }} />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
              <Field label="Precio (COP)" value={form.price} onChangeText={set('price')} keyboardType="number-pad" placeholder="35000" style={{ flex: 1 }} />
              <Field label="Duración (min)" value={form.duration_min} onChangeText={set('duration_min')} keyboardType="number-pad" style={{ flex: 1 }} />
            </View>
            <Text style={styles.label}>Imagen</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.keys(SERVICE_IMAGES).map((k) => (
                <Pressable key={k} onPress={() => set('image_key')(k)} style={[styles.imgPick, form.image_key === k && styles.imgActive]}>
                  <Image source={SERVICE_IMAGES[k]} style={styles.img} />
                </Pressable>
              ))}
            </ScrollView>
            <View style={[shared.row, { marginTop: 16, justifyContent: 'space-between' }]}>
              <Text style={shared.meta}>Visible para los clientes</Text>
              <Switch value={form.active} onValueChange={set('active')} trackColor={{ true: colors.gold }} thumbColor="#fff" />
            </View>
            {error ? <Text style={shared.error}>{error}</Text> : null}
            <PrimaryButton title="Guardar servicio" onPress={save} loading={saving} height={52} style={{ marginTop: 20 }} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  add: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 12 },
  off: { fontFamily: fonts.medium, fontSize: 11.5, color: colors.error },
  label: { fontFamily: fonts.regular, fontSize: 13.5, color: '#E8E8E8', marginTop: 14, marginBottom: 8 },
  imgPick: { borderRadius: 14, borderWidth: 2, borderColor: 'transparent', marginRight: 8, padding: 2 },
  imgActive: { borderColor: colors.gold },
  img: { width: 64, height: 64, borderRadius: 11 },
});
