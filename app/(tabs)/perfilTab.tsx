import { StyleSheet, Image, FlatList, View as RNView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import image from "@/assets/images/favicon.png";
import { useAuth } from "../../providers/AuthProvider";

export default function TabTwoScreen() {
  const { colors } = useTheme();
  const { jugador } = useAuth(); // ✅ move inside the component

  const Header = (
    <RNView>
      {/* Header: avatar + name */}
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

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={{ color: colors.text }}>Edad: {jugador?.edad ?? "—"}</Text>
        <Text style={{ color: colors.text }}>
          Puntuación Tenis: {jugador?.ranking_tennis ?? 0}
        </Text>
        <Text style={{ color: colors.text }}>
          Puntuación Pádel: {jugador?.ranking_paddle ?? 0}
        </Text>
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </RNView>
  );

  // You can render a list of matches or just the header for now
  return (
    <View style={styles.container}>
      {Header}
      {/* Example: add FlatList here later for partidos */}
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
  separator: { height: 1, width: "100%", marginTop: 16 },
});
