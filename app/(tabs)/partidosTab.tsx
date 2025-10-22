import { useEffect, useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import type { Partido } from "@/types/partido";

type PartidoIdRow = { id_partido: string };

type PartidoJugadorRow = {
  equipo: boolean;
  jugador: {
    id_jugador: string;
    nombre: string;
    apellido: string;
  } | null;
};

type PartidoRow = {
  id_partido: string;
  fecha: string;
  hora: string;
  fase?: string | null;
  resultado?: string | null;
  ganador?: {
    id_jugador: string;
    nombre: string;
    apellido: string;
  } | null;
  torneo?: {
    nombre: string;
    deporte: string;
    ubicacion: string;
  } | null;
  participantes?: PartidoJugadorRow[] | null;
};

export default function PartidosFuturosTab() {
  const { colors } = useTheme();
  const { jugador } = useAuth();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jugador?.id_jugador) return;

    const fetchPartidos = async () => {
      setLoading(true);

      try {
        const { data: participaciones, error: participacionesError } = await supabase
          .from<PartidoIdRow>("partido_jugador")
          .select("id_partido")
          .eq("id_jugador", jugador.id_jugador);

        if (participacionesError) throw participacionesError;

        const partidoIds = Array.from(
          new Set((participaciones ?? []).map((participacion) => participacion.id_partido)),
        );

        if (partidoIds.length === 0) {
          setPartidos([]);
          return;
        }

        const { data, error } = await supabase
          .from<PartidoRow>("partidos")
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
             torneo:torneos (
               nombre,
               deporte,
               ubicacion
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
          .in("id_partido", partidoIds)
          .order("fecha", { ascending: true });

        if (error) throw error;

        const hoy = new Date();
        const futuros = (data ?? [])
          .map<Partido>((partido) => ({
            id_partido: partido.id_partido,
            fecha: partido.fecha,
            hora: partido.hora,
            fase: partido.fase,
            resultado: partido.resultado,
            ganador: partido.ganador ?? null,
            torneo: partido.torneo ?? null,
            participantes: Array.isArray(partido.participantes)
              ? partido.participantes.map((participante) => ({
                  equipo: participante.equipo,
                  jugador: participante.jugador ?? null,
                }))
              : [],
          }))
          .filter((partido) => new Date(partido.fecha) >= hoy);

        setPartidos(futuros);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error cargando partidos futuros:", message);
        setPartidos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidos();
  }, [jugador?.id_jugador]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Partidos Futuros</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={partidos}
          keyExtractor={(item) => item.id_partido}
          renderItem={({ item }) => <PartidoCard partido={item} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: colors.text }}>
              No tenés partidos futuros
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
});
