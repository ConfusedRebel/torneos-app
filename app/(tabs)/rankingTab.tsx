import { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View as RNView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { JugadorCard } from "@/components/jugadorCard";
import { TEXT_STYLES } from "@/constants/Text";
import { useJugadores } from "@/providers/jugadoresProvider";
import { useEquipos } from "@/providers/equiposProvider";
import { useTorneos } from "@/providers/torneosProvider";
import { useTheme } from "@/hooks/useTheme";
import { Picker } from "@react-native-picker/picker";
import type { Tables } from "@/types/supabase";

// 🔹 Supabase types
type Jugador = Tables<"jugadores">;
type Torneo = Tables<"torneos">;
type Equipo = Tables<"equipos"> & {
  id_jugador1?: Partial<Jugador> | null;
  id_jugador2?: Partial<Jugador> | null;
};

export default function JugadorTab() {
  const { colors } = useTheme();
  const { list: listJugadores } = useJugadores();
  const { getEquiposByTorneo, equipos, loading: loadingEquipos } = useEquipos();
  const { list: listTorneos } = useTorneos();

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [selectedTorneo, setSelectedTorneo] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<"tennis" | "paddle">("tennis");
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // 🔹 Cargar jugadores y torneos desde Providers
  // ===============================
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setIsLoading(true);
        const [torneosData, jugadoresData] = await Promise.all([
          listTorneos(),
          listJugadores(),
        ]);
        setTorneos(torneosData);
        setJugadores(jugadoresData);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitial();
  }, []);

  // ===============================
  // 🔹 Cuando cambia el torneo → cargar equipos
  // ===============================
  useEffect(() => {
    if (selectedTorneo) {
      getEquiposByTorneo(selectedTorneo);
    }
  }, [selectedTorneo]);

  // ===============================
  // 📊 Qué mostrar
  // ===============================
  const showEquipos = !!selectedTorneo;
  let dataToShow: (Jugador | Equipo)[] = [];

  if (showEquipos) {
    dataToShow = equipos;
  } else if (selectedSport) {
    const field =
      selectedSport === "tennis" ? "ranking_tennis" : "ranking_paddle";
    dataToShow = [...jugadores].sort(
      (a, b) => (b[field] ?? 0) - (a[field] ?? 0)
    );
  } else {
    dataToShow = jugadores;
  }

  // ===============================
  // 📱 Render
  // ===============================
  return (
    <View style={styles.container}>
      <Text style={[TEXT_STYLES.headingMd, styles.title, { color: colors.text }]}>
        {showEquipos ? "Ranking de Equipos" : "Jugadores"}
      </Text>

      {/* 🏆 Filtros */}
      <RNView style={[styles.filterContainer, { borderColor: colors.border }]}>
        <Text style={[TEXT_STYLES.captionBold, { color: colors.text }]}>
          Filtrar por Torneo:
        </Text>
        <Picker
          selectedValue={selectedTorneo}
          onValueChange={(val) => {
            setSelectedTorneo(val);
            setSelectedSport("tennis");
          }}
          dropdownIconColor={colors.text}
          style={{ color: colors.text }}
        >
          <Picker.Item label="Jugadores" value={null} />
          {torneos.map((t) => (
            <Picker.Item
              key={t.id_torneo}
              label={t.nombre ?? "Sin nombre"}
              value={t.id_torneo}
            />
          ))}
        </Picker>
      </RNView>

      <RNView style={[styles.filterContainer, { borderColor: colors.border }]}>
        <Text style={[TEXT_STYLES.captionBold, { color: colors.text }]}>
          Filtrar por Deporte:
        </Text>
        <Picker
          selectedValue={selectedSport}
          onValueChange={(val) => {
            setSelectedSport(val);
            setSelectedTorneo(null);
          }}
          dropdownIconColor={colors.text}
          style={{ color: colors.text }}
        >
          <Picker.Item label="Tennis" value="tennis" />
          <Picker.Item label="Paddle" value="paddle" />
        </Picker>
      </RNView>

      {/* 🧑‍🤝‍🧑 Jugadores / Equipos */}
      {isLoading || loadingEquipos ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} color={colors.tint} />
      ) : showEquipos ? <FlatList
        contentContainerStyle={styles.listContent}
        data={equipos}
        keyExtractor={(item) => item.id_equipo}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <RNView
            style={[
              styles.equipoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                padding: 10,
                shadowColor: colors.text,
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
          >
            {/* Left section (30%) */}
            <View
              style={{
                width: "20%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.text,
                borderRadius: 10,
                paddingVertical: 14,
              }}
            >
              <Text
                style={[
                  TEXT_STYLES.headingSm,
                  {
                    color: colors.background,
                    fontSize: 28,
                    fontWeight: "bold",
                  },
                ]}
              >
                {index + 1}
              </Text>
            </View>

            {/* Right section (70%) */}
            <View
              style={{
                width: "70%",
                paddingHorizontal: 14,
                justifyContent: "center",
                backgroundColor: colors.card,
              }}
            >
              <Text
                style={[
                  TEXT_STYLES.headingSm,
                  { color: colors.text, fontWeight: "600", fontSize: 18 },
                ]}
              >
                {item.nombre ?? "Equipo sin nombre"}
              </Text>

              <Text style={[TEXT_STYLES.body, { color: colors.text + "AA" }]}>
                {item.id_jugador1?.nombre} {item.id_jugador1?.apellido}
                {item.id_jugador2
                  ? ` / ${item.id_jugador2.nombre} ${item.id_jugador2.apellido}`
                  : ""}
              </Text>

              <View
                style={{
                  marginTop: 6,
                  backgroundColor: colors.text,
                  alignSelf: "flex-start",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={[
                    TEXT_STYLES.caption,
                    { color: colors.background, fontWeight: "bold" },
                  ]}
                >
                  {item.puntos ?? 0} pts
                </Text>
              </View>
            </View>
          </RNView>
        )}
        ListEmptyComponent={
          <Text style={[TEXT_STYLES.body, styles.empty, { color: colors.text }]}>
            No hay equipos para mostrar
          </Text>
        }
      />
        : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={dataToShow as Jugador[]}
            keyExtractor={(item) => item.id_jugador}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => <JugadorCard jugador={item} />}
            ListEmptyComponent={
              <Text style={[TEXT_STYLES.body, styles.empty, { color: colors.text }]}>
                No hay jugadores para mostrar
              </Text>
            }
          />
        )}
    </View>
  );
}

// ===============================
// 🎨 Styles
// ===============================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 12 },
  listContent: { paddingBottom: 24 },
  separator: { height: 8 },
  empty: { textAlign: "center", marginTop: 20 },
  filterContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  equipoCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
