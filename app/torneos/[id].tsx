import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTorneos } from '@/providers/torneosProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import type { Torneo } from '@/types/torneo';
import type { Partido } from '@/types/partido';
import { useAuth } from '@/providers/AuthProvider';

type EquipoInscrito = {
  id_equipo: string;
  nombre: string;
  id_jugador1: { nombre: string; apellido: string } | null;
  id_jugador2: { nombre: string; apellido: string } | null;
};

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { get, join } = useTorneos();
  const { jugador } = useAuth();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<EquipoInscrito[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;
    let isActive = true;
    const fetchData = async () => {
      setLoading(true);

      // 🔹 Obtener datos del torneo
      const torneoData = await get(id);
      if (!isActive) return;
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
      else if (isActive) setEquipos((equiposData as EquipoInscrito[]) ?? []);

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
      else if (isActive) setPartidos(partidosData ?? []);

      if (jugador?.id_jugador) {
        const { data: registroData, error: registroError } = await supabase
          .from('jugadores_torneos')
          .select('id_jugador')
          .eq('id_torneo', id)
          .eq('id_jugador', jugador.id_jugador)
          .maybeSingle();

        if (registroError) console.error('Error registro torneo:', registroError.message);
        else if (isActive) setIsRegistered(Boolean(registroData));
      } else if (isActive) {
        setIsRegistered(false);
      }

      if (isActive) setLoading(false);
    };

    fetchData();
    return () => {
      isActive = false;
    };
  }, [get, id, jugador?.id_jugador, navigation]);

  const slotsAvailable = torneo ? Math.max(torneo.maxParticipantes - torneo.participantes, 0) : 0;
  const canJoin =
    !!torneo &&
    torneo.estado === 'pendiente' &&
    slotsAvailable > 0 &&
    !isRegistered &&
    !!jugador?.id_jugador;

  const handleJoin = async () => {
    if (!torneo || !jugador?.id_jugador || isJoining || !id) return;
    setIsJoining(true);
    setJoinMessage(null);
    try {
      const updatedParticipants = await join(id, jugador.id_jugador);
      setTorneo((prev) => (prev ? { ...prev, participantes: updatedParticipants } : prev));
      setIsRegistered(true);
      setJoinMessage({ type: 'success', text: 'Te inscribiste correctamente en el torneo.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message === 'YA_REGISTRADO'
            ? 'Ya estás inscrito en este torneo.'
            : error.message === 'TORNEO_SIN_CUPOS'
            ? 'No quedan cupos disponibles.'
            : error.message === 'TORNEO_NO_DISPONIBLE'
            ? 'Las inscripciones ya no están abiertas.'
            : error.message === 'TORNEO_NO_ENCONTRADO'
            ? 'No se pudo encontrar el torneo.'
            : error.message || 'Ocurrió un error al inscribirte.'
          : 'Ocurrió un error al inscribirte.';
      setJoinMessage({ type: 'error', text: message });
    } finally {
      setIsJoining(false);
    }
  };

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

      {jugador ? (
        <View style={styles.joinContainer}>
          {joinMessage && (
            <Text
              style={[
                styles.joinMessage,
                joinMessage.type === 'error' ? styles.joinMessageError : styles.joinMessageSuccess,
              ]}
            >
              {joinMessage.text}
            </Text>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleJoin}
            disabled={!canJoin || isJoining}
            style={[
              styles.joinButton,
              {
                backgroundColor:
                  !canJoin || isJoining ? colors.border : colors.tint,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.joinButtonText, { color: colors.background }]}> 
              {isRegistered
                ? 'Ya estás inscrito'
                : isJoining
                ? 'Inscribiéndote...'
                : 'Inscribirme'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.joinHelp, { color: colors.text }]}>Cupos disponibles: {slotsAvailable}</Text>
        </View>
      ) : (
        <Text style={[styles.joinHelp, { color: colors.text, marginBottom: 12 }]}>
          Inicia sesión para inscribirte en este torneo.
        </Text>
      )}

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
  joinContainer: { marginBottom: 16 },
  joinButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    marginBottom: 8,
  },
  joinButtonText: { fontSize: 16, fontWeight: '600' },
  joinHelp: { fontSize: 14 },
  joinMessage: { fontSize: 14, marginBottom: 8 },
  joinMessageError: { color: '#d9534f' },
  joinMessageSuccess: { color: '#2e7d32' },
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
