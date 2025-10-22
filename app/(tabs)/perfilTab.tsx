import { useEffect, useState } from "react";
import { StyleSheet, Image, FlatList, ActivityIndicator, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import image from "@/assets/images/favicon.png";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PartidoCard } from "@/components/partidoCard";
import type { Partido } from "@/types/partido";
import { TEXT_STYLES } from "@/constants/Text";

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
        // 1️⃣ Buscar equipos del jugador
        const { data: equipos, error: equiposError } = await supabase
          .from("equipos")
          .select("id_equipo")
          .or(`id_jugador1.eq.${jugador.id_jugador},id_jugador2.eq.${jugador.id_jugador}`);

        if (equiposError) throw equiposError;
        if (!equipos?.length) {
          setPartidosPasados([]);
          setLoading(false);
          return;
        }

        const equipoIds = equipos.map((e) => e.id_equipo);

        // 2️⃣ Buscar partidos donde el jugador participó (equipos 1 o 2)
        const { data, error } = await supabase
          .from<Partido>("partidos")
          .select(`
            id_partido,
            fecha,
            hora,
            fase,
            resultado,
            torneos (nombre, deporte, ubicacion),
            equipo1:id_equipo1 (id_equipo, nombre),
            equipo2:id_equipo2 (id_equipo, nombre)
          `)
          .or(equipoIds.map((id) => `id_equipo1.eq.${id},id_equipo2.eq.${id}`).join(","))
          .order("fecha", { ascending: false });

        if (error) throw error;

        // 3️⃣ Filtrar partidos pasados
        const hoy = new Date();
        const pasados = (data ?? []).filter((partido) => new Date(partido.fecha) < hoy);
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
        <Text style={[TEXT_STYLES.headingSm, styles.title, { color: colors.text }]}>
          {jugador?.nombre} {jugador?.apellido}
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={[TEXT_STYLES.body, { color: colors.text }]}>Edad: {jugador?.edad ?? "—"}</Text>
        <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
          Ranking Tenis: {jugador?.ranking_tennis ?? 0}
        </Text>
        <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
          Ranking Pádel: {jugador?.ranking_paddle ?? 0}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <Text style={[TEXT_STYLES.bodyBold, styles.subtitle, { color: colors.text }]}>
        Partidos Pasados
      </Text>
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
            <Text style={[TEXT_STYLES.body, { textAlign: "center", marginTop: 20, color: colors.text }]}>
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
  title: { flexShrink: 1 },
  stats: { rowGap: 4, marginTop: 8 },
  separator: { height: 1, width: "100%", marginTop: 16, marginBottom: 10 },
  subtitle: { marginTop: 4 },
});
