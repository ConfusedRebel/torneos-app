import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  View as RNView,
  TouchableOpacity,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { TorneoCard } from "@/components/torneoCard";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useTorneos } from "@/providers/torneosProvider";
import { useEffect, useState } from "react";
import { TEXT_STYLES } from "@/constants/Text";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import type { Tables } from "@/types/supabase"; // ✅ Supabase generated types

type Torneo = Tables<"torneos">;

type EstadoFilter = "all" | "pendiente" | "en_curso" | "finalizado";
type ModalidadFilter = "all" | "single" | "doble";
type DeporteFilter = "all" | "paddle" | "tennis";

function capitalize(str : string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export default function TorneosTab() {
  const { colors } = useTheme();
  const { list } = useTorneos();
  const { rol } = useAuth();

  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 Search + debounce
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // 🧩 Filters
  const [estado, setEstado] = useState<EstadoFilter>("all");
  const [modalidad, setModalidad] = useState<ModalidadFilter>("all");
  const [deporte, setDeporte] = useState<DeporteFilter>("all");

  // ✅ updated to match new dynamic route /torneos/[id]
  const openTorneo = (id_torneo: string) => {
    router.push(`/torneos/${id_torneo}`);
  };

  useEffect(() => {
    const loadTorneos = async () => {
      try {
        setIsLoading(true);

        const params = {
          search: debounced || undefined,
          estado: estado === "all" ? undefined : (estado as Torneo["estado"]),
          fechaDesde: undefined,
          fechaHasta: undefined,
        };

        const data = await list(params);

        // Client-side filters
        let filtered = data;
        if (modalidad !== "all") {
          filtered = filtered.filter((t) => (modalidad === "doble" ? t.duo : !t.duo));
        }
        if (deporte !== "all") {
          filtered = filtered.filter(
            (t) => t.deporte?.toLowerCase() === deporte.toLowerCase()
          );
        }

        setTorneos(filtered);
      } catch (err) {
        console.error("Error loading torneos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTorneos();
  }, [debounced, estado, modalidad, deporte]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 🔍 Search Bar */}
      <RNView style={[styles.filterBar, {bottom : 5}]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar torneo por nombre…"
          placeholderTextColor="#999"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={() => setQuery("")}
          style={[styles.clearBtn, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.text }}>✕</Text>
        </TouchableOpacity>
      </RNView>

      {/* 🧩 Filters */}
      <RNView style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <RNView style={styles.filtersRow}>
          {/* Estado */}
          <RNView
            style={[
              styles.filterCol,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {estado === "pendiente"
                ? "Pendiente"
                : estado === "en_curso"
                  ? "En curso"
                  : estado === "finalizado"
                    ? "Finalizado"
                    : "Todos"}
            </Text>
            <Picker
              selectedValue={estado}
              onValueChange={(v: EstadoFilter) => setEstado(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Pendiente" value="pendiente" />
              <Picker.Item label="En curso" value="en_curso" />
              <Picker.Item label="Finalizado" value="finalizado" />
            </Picker>
          </RNView>

          {/* Modalidad */}
          <RNView
            style={[
              styles.filterCol,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.filterLabel, { color: colors.text }]}>{modalidad == "all"? "Todos" : capitalize(modalidad)}</Text>
            <Picker
              selectedValue={modalidad}
              onValueChange={(v: ModalidadFilter) => setModalidad(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todas" value="all" />
              <Picker.Item label="Single" value="single" />
              <Picker.Item label="Doble" value="doble" />
            </Picker>
          </RNView>

          {/* Deporte */}
          <RNView
            style={[
              styles.filterCol,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.filterLabel, { color: colors.text }]}>{deporte == "all"? "Todos" : capitalize(deporte)}</Text>
            <Picker
              selectedValue={deporte}
              onValueChange={(v: DeporteFilter) => setDeporte(v)}
              dropdownIconColor={colors.text}
              style={{ color: colors.text, flex: 1 }}
            >
              <Picker.Item label="Todos" value="all" />
              <Picker.Item label="Paddle" value="paddle" />
              <Picker.Item label="Tennis" value="tennis" />
            </Picker>
          </RNView>
        </RNView>
      </RNView>

      {/* 📋 Torneos list */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => String(item.id_torneo)}
          renderItem={({ item }) => (
            <TorneoCard torneo={item} onPress={() => openTorneo(item.id_torneo)} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text
              style={[
                TEXT_STYLES.body,
                { color: colors.text, textAlign: "center", marginTop: 24 },
              ]}
            >
              No hay torneos por ahora
            </Text>
          }
        />
      )}

      {/* ➕ FAB visible only for admin */}
      {rol === "admin" && (
        <TouchableOpacity
          onPress={() => router.push("/torneos/createTorneo")}
          style={[
            styles.fab,
            { backgroundColor: colors.tint, borderColor: colors.border },
          ]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  filterBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  clearBtn: {
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
  },
  filtersRow: { flexDirection: "row", gap: 8 },
  filterCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 48,
  },
  filterLabel: { fontSize: 14, marginRight: 8 },
  fab: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});
