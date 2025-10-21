import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTorneos } from '@/providers/torneosProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import type { Torneo } from '@/types/torneo';
import type { Partido } from '@/types/partido';

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { get } = useTorneos();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);

      // 🔹 Obtener datos del torneo
      const torneoData = await get(id);
      setTorneo(torneoData);
      if (torneoData?.nombre) navigation.setOptions({ title: torneoData.nombre });

      // 🔹 Equipos inscritos
      const { data: equiposData, error: equiposError } = await supabase
        .from('equipos')
        .select(`
          id_equipo,
          nombre,
          id_jugador1 (nombre, apellido),
          id_jugador2 (nombre, apellido)
        `)
        .eq('id_torneo', id);

      if (equiposError) console.error('Error equipos:', equiposError.message);
      else setEquipos(equiposData ?? []);

      // 🔹 Partidos del torneo
      const { data: partidosData, error: partidosError } = await supabase
        .from('partidos')
        .select(`
          id_partido,
          fecha,
          hora,
          fase,
          resultado,
          equipo1:id_equipo1 (nombre),
          equipo2:id_equipo2 (nombre),
          ganador:id_ganador (nombre)
        `)
        .eq('id_torneo', id)
        .order('fecha', { ascending: true });

      if (partidosError) console.error('Error partidos:', partidosError.message);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!torneo) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>
          No se encontró información del torneo.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ========================== */}
      {/* 🏆 DATOS DEL TORNEO */}
      {/* ========================== */}
      <Text style={[styles.title, { color: colors.text }]}>{torneo.nombre}</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Deporte:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{torneo.deporte}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Fechas:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {torneo.fecha_inicio} → {torneo.fecha_fin}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Ubicación:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{torneo.ubicacion}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Modalidad:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {torneo.duo ? 'Dobles' : 'Singles'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Estado:</Text>
        <Text
          style={[
            styles.value,
            {
              color:
                torneo.estado === 'en_curso'
                  ? colors.tint
                  : torneo.estado === 'finalizado'
                  ? '#888'
                  : colors.text,
            },
          ]}
        >
          {torneo.estado}
        </Text>
      </View>

      {/* ========================== */}
      {/* 🧑‍🤝‍🧑 EQUIPOS */}
      {/* ========================== */}
      <Text style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>Equipos</Text>

      {equipos.length === 0 ? (
        <Text style={{ color: colors.text, marginTop: 4 }}>No hay equipos registrados.</Text>
      ) : (
        equipos.map((eq) => (
          <View
            key={eq.id_equipo}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>{eq.nombre}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>
              {eq.id_jugador1?.nombre} {eq.id_jugador1?.apellido}
              {eq.id_jugador2
                ? ` / ${eq.id_jugador2.nombre} ${eq.id_jugador2.apellido}`
                : ''}
            </Text>
          </View>
        ))
      )}

      {/* ========================== */}
      {/* 🎾 PARTIDOS */}
      {/* ========================== */}
      <Text style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>Partidos</Text>

      {partidos.length === 0 ? (
        <Text style={{ color: colors.text, marginTop: 4 }}>No hay partidos registrados.</Text>
      ) : (
        partidos.map((p) => (
          <View
            key={p.id_partido}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {p.equipo1?.nombre} vs {p.equipo2?.nombre}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>
              {p.fecha} {p.hora}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.text }]}>
              Fase: {p.fase ?? '—'}
            </Text>
            {p.resultado && (
              <Text style={[styles.cardSubtitle, { color: colors.text }]}>
                Resultado: {p.resultado}
              </Text>
            )}
            {p.ganador?.nombre && (
              <Text style={[styles.cardSubtitle, { color: colors.tint, fontWeight: 'bold' }]}>
                Ganador: {p.ganador.nombre}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  section: { marginBottom: 10 },
  label: { fontWeight: '600', fontSize: 16 },
  value: { fontSize: 15, marginTop: 2 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 14, marginTop: 2 },
});
