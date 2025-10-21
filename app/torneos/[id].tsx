import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTorneos } from '@/providers/torneosProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/providers/AuthProvider'; // 👈 si ya tenés AuthProvider

// Local lightweight Plus icon component to avoid an external dependency
const Plus = ({ color, size }: { color?: string; size?: number }) => (
  <Text style={{ color: color ?? 'black', fontSize: size ?? 24, lineHeight: size ?? 24 }}>+</Text>
);

import type { Torneo } from '@/types/torneo';
import type { Partido } from '@/types/partido';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { get, join } = useTorneos();
  const { jugador } = useAuth(); // 👈 jugador logueado
  const insets = useSafeAreaInsets();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);

      const torneoData = await get(id);
      setTorneo(torneoData);
      if (torneoData?.nombre) navigation.setOptions({ title: torneoData.nombre });

      const { data: equiposData } = await supabase
        .from('equipos')
        .select(`
          id_equipo,
          nombre,
          id_jugador1 (id_jugador, nombre, apellido),
          id_jugador2 (id_jugador, nombre, apellido)
        `)
        .eq('id_torneo', id);

      setEquipos(equiposData ?? []);

      // comprobar si el jugador ya está inscripto
      if (jugador) {
        const { data } = await supabase
          .from('jugadores_torneos')
          .select('*')
          .eq('id_torneo', id)
          .eq('id_jugador', jugador.id_jugador)
          .maybeSingle();
        if (data) setJoined(true);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleJoin = async () => {
    if (!jugador) return alert('Debes iniciar sesión para unirte.');

    try {
      await join(id!, jugador.id_jugador);
      alert('Te uniste al torneo 🎾');
      setJoined(true);
    } catch (e: any) {
      alert('Error al unirse: ' + e.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* --- tu contenido actual --- */}
        <Text style={[styles.title, { color: colors.text }]}>{torneo?.nombre}</Text>
        {/* ... resto del contenido ... */}
      </ScrollView>

      {/* 👇 BOTÓN FLOTANTE */}
      {!joined && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: colors.tint, bottom: insets.bottom + 20 },
          ]}
          onPress={handleJoin}
        >
          <Plus color="white" size={28} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
