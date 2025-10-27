import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { TEXT_STYLES } from '@/constants/Text';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTorneos } from '@/providers/torneosProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import type { Torneo } from '@/types/torneo';
import type { Partido } from '@/types/partido';
import { useAuth } from '@/providers/AuthProvider';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type EquipoInscrito = {
  id_equipo: string;
  nombre: string;
  id_jugador1: { nombre: string; apellido: string } | null;
  id_jugador2: { nombre: string; apellido: string } | null;
};

type PlayerSummary = { nombre: string; apellido: string };

type EquipoRow = {
  id_equipo: string;
  nombre: string;
  id_jugador1?: PlayerSummary[] | null;
  id_jugador2?: PlayerSummary[] | null;
};

type PartidoRelation = { id_equipo: string; nombre: string };
type TorneoSummary = { nombre: string; deporte: string; ubicacion: string };

type PartidoRow = {
  id_partido: string;
  torneos?: TorneoSummary | TorneoSummary[] | null;
  fecha: string;
  hora: string;
  fase?: string | null;
  resultado?: string | null;
  equipo1?: PartidoRelation[] | null;
  equipo2?: PartidoRelation[] | null;
  ganador?: PartidoRelation[] | null;
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

  // 🎯 Animación del FAB
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 6, stiffness: 200 }) }],
  }));

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
      await supabase
        .from('equipos')
        .select(`
          id_equipo,
          nombre,
          id_jugador1 (nombre, apellido),
          id_jugador2 (nombre, apellido)
        `)
        .eq('id_torneo', id)
        .then(({ data }) => {
          if (isActive && data) {
            // Supabase returns related rows as arrays; take first element or null to match EquipoInscrito
            const equiposRaw = Array.isArray(data) ? (data as EquipoRow[]) : [];
            const mapped = equiposRaw.map((d) => ({
              id_equipo: d.id_equipo,
              nombre: d.nombre,
              id_jugador1: d.id_jugador1?.[0] ?? null,
              id_jugador2: d.id_jugador2?.[0] ?? null,
            })) as EquipoInscrito[];
            setEquipos(mapped);
          }
        });

      // 🔹 Partidos del torneo
      const { data: partidosData, error: partidosError } = await supabase
        .from('partidos')
        .select(`
          id_partido,
          torneos,
          fecha,
          hora,
          fase,
          resultado,
          equipo1:id_equipo1 (id_equipo, nombre),
          equipo2:id_equipo2 (id_equipo, nombre),
          ganador:id_ganador (id_equipo, nombre)
        `)
        .eq('id_torneo', id);

      if (partidosError) {
        // handle error...
      } else if (partidosData) {
        // Map Supabase's relation-arrays to your Partido shape (take first element)
        const partidosRaw = Array.isArray(partidosData)
          ? (partidosData as PartidoRow[])
          : [];

        const mapped = partidosRaw.map((p) => {
          const torneoDetalle = Array.isArray(p.torneos)
            ? p.torneos?.[0] ?? null
            : p.torneos ?? null;

          return {
            id_partido: p.id_partido,
            torneos: torneoDetalle,
            fecha: p.fecha,
            hora: p.hora,
            fase: p.fase ?? null,
            resultado: p.resultado ?? null,
            equipo1: p.equipo1?.[0]
              ? { id_equipo: p.equipo1[0].id_equipo, nombre: p.equipo1[0].nombre }
              : null,
            equipo2: p.equipo2?.[0]
              ? { id_equipo: p.equipo2[0].id_equipo, nombre: p.equipo2[0].nombre }
              : null,
            ganador: p.ganador?.[0]
              ? { id_equipo: p.ganador[0].id_equipo, nombre: p.ganador[0].nombre }
              : null,
          };
        }) as Partido[];

        if (isActive) setPartidos(mapped);
      };

      // 🔹 Comprobar si el jugador ya está inscrito
      if (jugador?.id_jugador) {
        const { data: registroData, error: registroError } = await supabase
          .from('equipos')
          .select('id_jugador1')
          .eq('id_torneo', id)
          .eq('id_jugador1', jugador.id_jugador)
          .maybeSingle();

        if (!registroError && isActive) setIsRegistered(Boolean(registroData));
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
    <View style={{ flex: 1 }}>
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
                  TEXT_STYLES.body,
                  styles.joinMessage,
                  joinMessage.type === 'error'
                    ? styles.joinMessageError
                    : styles.joinMessageSuccess,
                ]}
              >
                {joinMessage.text}
              </Text>
            )}

            <Text style={[TEXT_STYLES.body, styles.joinHelp, { color: colors.text }]}>
              Cupos disponibles: {slotsAvailable}
            </Text>
          </View>
        ) : (
          <Text
            style={[TEXT_STYLES.body, styles.joinHelp, { color: colors.text, marginBottom: 12 }]}
          >
            Inicia sesión para inscribirte en este torneo.
          </Text>
        )}

        {/* ========================== */}
        {/* ℹ️ DETALLES DEL TORNEO */}
        {/* ========================== */}
        <View style={styles.section}>
          <Text style={[TEXT_STYLES.bodyBold, styles.label, { color: colors.text }]}>Deporte:</Text>
          <Text style={[TEXT_STYLES.body, styles.value, { color: colors.text }]}>
            {torneo.deporte}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.bodyBold, styles.label, { color: colors.text }]}>Fechas:</Text>
          <Text style={[TEXT_STYLES.body, styles.value, { color: colors.text }]}>
            {torneo.fecha_inicio} → {torneo.fecha_fin}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.bodyBold, styles.label, { color: colors.text }]}>Ubicación:</Text>
          <Text style={[TEXT_STYLES.body, styles.value, { color: colors.text }]}>{torneo.ubicacion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.bodyBold, styles.label, { color: colors.text }]}>Modalidad:</Text>
          <Text style={[TEXT_STYLES.body, styles.value, { color: colors.text }]}>
            {torneo.duo ? 'Dobles' : 'Singles'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[TEXT_STYLES.bodyBold, styles.label, { color: colors.text }]}>Estado:</Text>
          <Text
            style={[
              TEXT_STYLES.body,
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
        <Text
          style={[TEXT_STYLES.headingLg, styles.subtitle, { color: colors.text, marginTop: 20 }]}
        >
          Equipos
        </Text>

        {equipos.length === 0 ? (
          <Text style={[TEXT_STYLES.body, { color: colors.text, marginTop: 4 }]}>No hay equipos registrados.</Text>
        ) : (
          equipos.map((eq) => (
            <View
              key={eq.id_equipo}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[TEXT_STYLES.headingSm, styles.cardTitle, { color: colors.text }]}
              >
                {eq.nombre}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
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
        <Text
          style={[TEXT_STYLES.headingLg, styles.subtitle, { color: colors.text, marginTop: 20 }]}
        >
          Partidos
        </Text>

        {partidos.length === 0 ? (
          <Text style={[TEXT_STYLES.body, { color: colors.text, marginTop: 4 }]}>No hay partidos registrados.</Text>
        ) : (
          partidos.map((p) => (
            <View
              key={p.id_partido}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[TEXT_STYLES.headingSm, styles.cardTitle, { color: colors.text }]}>
                {p.equipo1?.nombre} vs {p.equipo2?.nombre}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
                {p.fecha} {p.hora}
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
                Fase: {p.fase ?? '—'}
              </Text>
              {p.resultado && (
                <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
                  Resultado: {p.resultado}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ========================== */}
      {/* 🔘 FAB BOTÓN FLOTANTE */}
      {/* ========================== */}
      {jugador && (
        <Animated.View
          style={[
            styles.fabContainer,
            animatedStyle,
            {
              backgroundColor:
                !canJoin || isJoining ? colors.border : colors.tint,
            },
          ]}
        >
          <TouchableOpacity
            accessibilityRole="button"
            onPress={handleJoin}
            onPressIn={() => (scale.value = 0.9)}
            onPressOut={() => (scale.value = 1)}
            disabled={!canJoin || isJoining}
            activeOpacity={0.8}
            style={styles.fabButton}
          >
            <Text style={[TEXT_STYLES.fab, styles.fabText, { color: colors.background }]}>
              {isRegistered ? '✓' : isJoining ? '⏳' : '+'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// ==========================
// 🎨 ESTILOS
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    marginRight: 8,
  },
  value: {
    flexShrink: 1,
  },
  subtitle: {
    marginBottom: 8,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  joinContainer: {
    marginVertical: 12,
  },
  joinMessage: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  joinMessageError: {
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  joinMessageSuccess: {
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  joinHelp: {
    marginBottom: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {},
  card: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  cardSubtitle: {
    marginTop: 4,
  },
  cardTitle: {
    marginBottom: 4,
  }


});
