import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTorneos } from '@/providers/torneosProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import type { Torneo } from '@/types/torneo';
import type { Partido } from '@/types/partido';
import { useAuth } from '@/providers/AuthProvider';

type ParticipanteInscrito = {
  ranking_en_torneo: number | null;
  jugador: { id_jugador: string; nombre: string; apellido: string } | null;
};

type TorneoDetailData = {
  torneo: Torneo | null;
  participantes: ParticipanteInscrito[];
  partidos: Partido[];
  registered: boolean;
};

type ParticipacionRow = ParticipanteInscrito;

type PartidoJugadorRow = {
  equipo: boolean;
  jugador: { id_jugador: string; nombre: string; apellido: string } | null;
};

type PartidoRow = {
  id_partido: string;
  fecha: string;
  hora: string;
  fase?: string | null;
  resultado?: string | null;
  ganador?: { id_jugador: string; nombre: string; apellido: string } | null;
  participantes?: PartidoJugadorRow[] | null;
};

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { get, join } = useTorneos();
  const { jugador } = useAuth();

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteInscrito[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const fetchDetails = useCallback(async (): Promise<TorneoDetailData> => {
    if (!id) {
      return { torneo: null, participantes: [], partidos: [], registered: false };
    }

    const torneoData = await get(id);
    const participantesData: ParticipanteInscrito[] = [];
    const partidosData: Partido[] = [];
    let registered = false;

    const { data: participaciones, error: participacionesError } = await supabase
      .from<ParticipacionRow>('participaciones')
      .select(
        `ranking_en_torneo,
         jugador:jugadores (
           id_jugador,
           nombre,
           apellido
         )`
      )
      .eq('id_torneo', id);

    if (participacionesError) {
      console.error('Error participaciones:', participacionesError.message);
    } else if (participaciones) {
      participaciones.forEach((participacion) => {
        participantesData.push(participacion);
      });
    }

    const { data: partidosRaw, error: partidosError } = await supabase
      .from<PartidoRow>('partidos')
      .select(
        `id_partido,
         fecha,
         hora,
         fase,
         resultado,
         ganador:jugadores!partidos_id_ganador_fkey (
           id_jugador,
           nombre,
           apellido
         ),
         participantes:partido_jugador (
           equipo,
           jugador:jugadores (
             id_jugador,
             nombre,
             apellido
           )
         )`
      )
      .eq('id_torneo', id)
      .order('fecha', { ascending: true });

    if (partidosError) {
      console.error('Error partidos:', partidosError.message);
    } else if (partidosRaw) {
      partidosRaw.forEach((partido) => {
        partidosData.push({
          id_partido: partido.id_partido,
          fecha: partido.fecha,
          hora: partido.hora,
          fase: partido.fase,
          resultado: partido.resultado,
          ganador: partido.ganador ?? null,
          participantes: Array.isArray(partido.participantes)
            ? partido.participantes.map((participante) => ({
                equipo: participante.equipo,
                jugador: participante.jugador ?? null,
              }))
            : [],
        });
      });
    }

    if (jugador?.id_jugador) {
      registered = participantesData.some(
        (participante) => participante.jugador?.id_jugador === jugador.id_jugador,
      );

      if (!registered) {
        const { data: registroData, error: registroError } = await supabase
          .from('participaciones')
          .select('id_jugador')
          .eq('id_torneo', id)
          .eq('id_jugador', jugador.id_jugador)
          .maybeSingle();

        if (registroError) {
          console.error('Error registro torneo:', registroError.message);
        } else {
          registered = Boolean(registroData);
        }
      }
    }

    return {
      torneo: torneoData,
      participantes: participantesData,
      partidos: partidosData,
      registered,
    };
  }, [get, id, jugador?.id_jugador]);

  const applyDetails = useCallback(
    (details: TorneoDetailData) => {
      setTorneo(details.torneo);
      if (details.torneo?.nombre) {
        navigation.setOptions({ title: details.torneo.nombre });
      }
      setParticipantes(details.participantes);
      setPartidos(details.partidos);
      setIsRegistered(details.registered);
    },
    [navigation],
  );

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    fetchDetails()
      .then((details) => {
        if (!isActive) return;
        applyDetails(details);
      })
      .catch((error) => {
        console.error('Error cargando torneo:', error);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [applyDetails, fetchDetails]);

  const canJoin =
    !!torneo && torneo.estado === 'pendiente' && !isRegistered && !!jugador?.id_jugador;

  let joinHelpMessage = 'Las inscripciones ya no están disponibles.';
  if (isRegistered) {
    joinHelpMessage = 'Ya estás inscrito en este torneo.';
  } else if (torneo?.estado === 'pendiente') {
    joinHelpMessage = 'Pulsa el botón (+) para inscribirte.';
  }

  const joinSection = jugador ? (
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
      <Text style={[styles.joinHelp, { color: colors.text }]}>{joinHelpMessage}</Text>
    </View>
  ) : (
    <Text style={[styles.joinHelp, { color: colors.text, marginBottom: 12 }]}> 
      Inicia sesión para inscribirte en este torneo.
    </Text>
  );

  const handleJoin = async () => {
    if (!torneo || !jugador?.id_jugador || isJoining || !id) return;
    setIsJoining(true);
    setJoinMessage(null);
    try {
      await join(id, jugador.id_jugador);
      const details = await fetchDetails();
      applyDetails(details);
      setJoinMessage({ type: 'success', text: 'Te inscribiste correctamente en el torneo.' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message === 'YA_REGISTRADO'
            ? 'Ya estás inscrito en este torneo.'
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
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}> 
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!torneo) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}> 
        <Text style={{ color: colors.text, textAlign: 'center' }}>
          No se encontró información del torneo.
        </Text>
      </View>
    );
  }

  const formatEquipo = (equipo: Partido['participantes']) => {
    const names = equipo
      .map((participante) =>
        participante.jugador
          ? `${participante.jugador.nombre} ${participante.jugador.apellido}`
          : 'Por definir',
      )
      .filter(Boolean)
      .join(' / ');

    return names || 'Por definir';
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>{torneo.nombre}</Text>

        {joinSection}

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

        <Text style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>Participantes</Text>
        {participantes.length === 0 ? (
          <Text style={{ color: colors.text, marginTop: 4 }}>No hay participantes registrados.</Text>
        ) : (
          participantes.map((participante, index) => (
            <View
              key={participante.jugador?.id_jugador ?? `participante-${index}`}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}> 
                {participante.jugador
                  ? `${participante.jugador.nombre} ${participante.jugador.apellido}`
                  : 'Participante sin datos'}
              </Text>
              {participante.ranking_en_torneo != null && (
                <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                  Ranking en torneo: {participante.ranking_en_torneo}
                </Text>
              )}
            </View>
          ))
        )}

        <Text style={[styles.subtitle, { color: colors.text, marginTop: 20 }]}>Partidos</Text>
        {partidos.length === 0 ? (
          <Text style={{ color: colors.text, marginTop: 4 }}>No hay partidos registrados.</Text>
        ) : (
          partidos.map((partido) => {
            const equipoA = partido.participantes.filter((participante) => participante.equipo);
            const equipoB = partido.participantes.filter((participante) => !participante.equipo);

            return (
              <View
                key={partido.id_partido}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.cardTitle, { color: colors.text }]}> 
                  {formatEquipo(equipoA)} vs {formatEquipo(equipoB)}
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                  {partido.fecha} {partido.hora}
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                  Fase: {partido.fase ?? '—'}
                </Text>
                {partido.resultado && (
                  <Text style={[styles.cardSubtitle, { color: colors.text }]}> 
                    Resultado: {partido.resultado}
                  </Text>
                )}
                {partido.ganador?.nombre && (
                  <Text style={[styles.cardSubtitle, { color: colors.tint, fontWeight: 'bold' }]}> 
                    Ganador: {partido.ganador.nombre} {partido.ganador.apellido}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {jugador && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={canJoin ? 'Inscribirme al torneo' : 'Inscripción no disponible'}
          onPress={handleJoin}
          disabled={!canJoin || isJoining}
          style={[
            styles.fab,
            {
              backgroundColor: !canJoin || isJoining ? colors.border : colors.tint,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.fabLabel, { color: colors.background }]}> 
            {isJoining ? '…' : isRegistered ? '✓' : '+'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 96 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  joinContainer: { marginBottom: 16 },
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  fabLabel: { fontSize: 28, fontWeight: 'bold' },
});
