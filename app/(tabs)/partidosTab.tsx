import { useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import { TEXT_STYLES } from "@/constants/Text";
import { usePartidos } from "@/providers/partidosProvider";
import { router } from "expo-router";

export default function PartidosFuturosTab() {
  const { colors } = useTheme();
  const { jugador } = useAuth();
  const { partidos, loading, error, getPartidosByJugador } = usePartidos();

  useEffect(() => {
    if (jugador?.id_jugador) {
      getPartidosByJugador(jugador.id_jugador);
    }
  }, [jugador?.id_jugador]);

  return (
    <View style={styles.container}>
      <Text style={[TEXT_STYLES.headingMd, styles.title, { color: colors.text }]}>
        Partidos Futuros
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={[TEXT_STYLES.body, { color: "red", textAlign: "center", marginTop: 20 }]}>
          {error}
        </Text>
      ) : (
        <FlatList
          data={partidos}
          keyExtractor={(item) => item.id_partido}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/torneos/${item.id_torneo}`)}
            >
              <PartidoCard partido={item} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text
              style={[
                TEXT_STYLES.body,
                { textAlign: "center", marginTop: 20, color: colors.text },
              ]}
            >
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
