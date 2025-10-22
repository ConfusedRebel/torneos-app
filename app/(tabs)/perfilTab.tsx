import { useEffect, useState } from "react";
import { StyleSheet, Image, FlatList, ActivityIndicator, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import image from "@/assets/images/favicon.png";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
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

export default function PerfilTab() {
  const { colors } = useTheme();
  const { jugador } = useAuth();
  const [partidosPasados, setPartidosPasados] = useState<Partido[]>([]);
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
          setPartidosPasados([]);
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
          .order("fecha", { ascending: false });

        if (error) throw error;

        const hoy = new Date();
        const pasados = (data ?? [])
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
          .filter((partido) => new Date(partido.fecha) < hoy);

        setPartidosPasados(pasados);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Error cargando partidos pasados:", message);
        setPartidosPasados([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartidos();
  }, [jugador?.id_jugador]);

  // 🔹 Encabezado con avatar + datos de jugador
  const Header = (
    <RNView>
      <View style={styles.headerRow}>
        <Image
          source={image}
          style={[
            styles.avatar,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {jugador?.nombre} {jugador?.apellido}
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={{ color: colors.text }}>Edad: {jugador?.edad ?? "—"}</Text>
        <Text style={{ color: colors.text }}>
          Ranking Tenis: {jugador?.rankingTennis ?? 0}
        </Text>
        <Text style={{ color: colors.text }}>
          Ranking Pádel: {jugador?.rankingPaddle ?? 0}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <Text style={[styles.subtitle, { color: colors.text }]}>Partidos Pasados</Text>
    </RNView>
  );

  return (
    <View style={styles.container}>
      {Header}
      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={partidosPasados}
          keyExtractor={(item) => item.id_partido}
          renderItem={({ item }) => <PartidoCard partido={item} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: colors.text }}>
              No hay partidos pasados
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 20, fontWeight: "bold", flexShrink: 1 },
  stats: { rowGap: 4, marginTop: 8 },
  separator: { height: 1, width: "100%", marginTop: 16, marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 4 },
});
