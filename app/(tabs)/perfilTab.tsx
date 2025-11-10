import { useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator, View as RNView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import { TEXT_STYLES } from "@/constants/Text";
import { usePartidos } from "@/providers/partidosProvider";
import { router } from "expo-router";

export default function PerfilTab() {
  const { colors } = useTheme();
  const { jugador } = useAuth();
  const { partidos, loading, error, getPartidosPasadosByJugador } = usePartidos();

  useEffect(() => {
    if (jugador?.id_jugador) {
      getPartidosPasadosByJugador(jugador.id_jugador);
    }
  }, [jugador?.id_jugador]);

  // 🔹 Header with player info
  const Header = (
    <RNView>
      <View style={styles.headerRow}>
        <Text style={[TEXT_STYLES.headingSm, styles.title, { color: colors.text }]}>
          {jugador?.nombre} {jugador?.apellido}
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
          Miembro desde: {jugador?.antiguedad ?? "—"}
        </Text>
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
