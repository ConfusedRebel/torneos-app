import { useEffect, useState } from "react";
import { StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import type { Partido } from "@/types/partido";

export default function PartidosFuturosTab() {
  const { colors } = useTheme();
  const { jugador } = useAuth();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jugador?.id_jugador) return;

    const fetchPartidos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("partido_jugador")
        .select(`
          partidos (
            id_partido,
            fecha,
            hora,
            fase,
            resultado,
            torneos (nombre, deporte, ubicacion)
          )
        `)
        .eq("id_jugador", jugador.id_jugador)
        .order("partidos.fecha", { ascending: true });

      if (error) {
        console.error("Error cargando partidos futuros:", error.message);
        setLoading(false);
        return;
      }

      const hoy = new Date();
      const futuros = (data ?? [])
        .map((p) => p.partidos)
        .filter((p) => new Date(p.fecha) >= hoy);

      setPartidos(futuros);
      setLoading(false);
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
