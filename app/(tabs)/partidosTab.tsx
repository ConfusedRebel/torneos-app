import { useEffect, useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import type { Partido } from "@/types/partido";
import { TEXT_STYLES } from "@/constants/Text";

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
        const { data: equipos, error: equiposError } = await supabase
          .from("equipos")
          .select("id_equipo")
          .or(`id_jugador1.eq.${jugador.id_jugador},id_jugador2.eq.${jugador.id_jugador}`);

        if (equiposError) throw equiposError;
        if (!equipos?.length) {
          setPartidos([]);
          setLoading(false);
          return;
        }

        const equipoIds = equipos.map((e) => e.id_equipo);

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
          .order("fecha", { ascending: true });

        if (error) throw error;

        const hoy = new Date();
        const futuros = (data ?? []).filter((partido) => new Date(partido.fecha) >= hoy);
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
      <Text style={[TEXT_STYLES.headingMd, styles.title, { color: colors.text }]}>
        Partidos Futuros
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={partidos}
          keyExtractor={(item) => item.id_partido}
          renderItem={({ item }) => <PartidoCard partido={item} />}
          ListEmptyComponent={
            <Text style={[TEXT_STYLES.body, { textAlign: "center", marginTop: 20, color: colors.text }]}>
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
  title: { textAlign: "center", marginBottom: 20 },
});
