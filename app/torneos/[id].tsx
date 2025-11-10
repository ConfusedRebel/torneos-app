import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  View as RNView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { TEXT_STYLES } from "@/constants/Text";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useTorneos } from "@/providers/torneosProvider";
import { useEquipos } from "@/providers/equiposProvider";
import { Partido, usePartidos } from "@/providers/partidosProvider";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/providers/AuthProvider";
import { PartidoCard } from "@/components/partidoCard";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { Tables } from "@/types/supabase";

type Torneo = Tables<"torneos">;

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { get } = useTorneos();
  const { rol } = useAuth();
  const navigation = useNavigation();

  const { equipos, getEquiposByTorneo, loading: loadingEquipos } = useEquipos();
  const {
    partidos,
    getPartidosByTorneo,
    deletePartido,
    updateResultado,
    loading: loadingPartidos,
    error,
    refreshPartidos,
  } = usePartidos();

  const [torneo, setTorneo] = useState<Torneo | null>(null);

  // ⚙️ Modal states for uploading result
  const [showModal, setShowModal] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  // FAB animation
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 6, stiffness: 200 }) }],
  }));

  // Fetch all tournament data
  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const torneoData = await get(id);
      setTorneo(torneoData);
      if (torneoData?.nombre) {
        navigation.setOptions({ title: torneoData.nombre });
      }
      await Promise.all([getEquiposByTorneo(id), getPartidosByTorneo(id)]);
    };
    fetchAll();
  }, [id]);

  // 🧠 Winner detection helper
  function detectarGanador(score1: number, score2: number): "equipo1" | "equipo2" | null {
    if (score1 > score2) return "equipo1";
    if (score2 > score1) return "equipo2";
    return null;
  }

  // 🏆 Trigger modal
  const handleUploadResultado = (partido: Partido) => {
    if (rol !== "admin") return;
    setSelectedPartido(partido);
    setScore1("");
    setScore2("");
    setShowModal(true);
  };

  // 💾 Confirm & upload
  const handleConfirmResultado = async () => {
    if (!selectedPartido || score1 === "" || score2 === "") {
      Alert.alert("Error", "Ingresá ambos resultados numéricos");
      return;
    }

    const n1 = Number(score1);
    const n2 = Number(score2);
    if (isNaN(n1) || isNaN(n2)) {
      Alert.alert("Error", "Los resultados deben ser numéricos");
      return;
    }

    const ganador = detectarGanador(n1, n2);
    let id_ganador: string | null = null;
    if (ganador === "equipo1") id_ganador = selectedPartido.id_equipo1;
    else if (ganador === "equipo2") id_ganador = selectedPartido.id_equipo2;

    const resultado = `${n1}-${n2}`;
    await updateResultado(selectedPartido.id_partido, resultado, id_ganador);
    await refreshPartidos();

    setShowModal(false);
    setSelectedPartido(null);
    Alert.alert("Resultado cargado", `Ganador: ${ganador ? ganador : "Empate"}`);
  };

  // 🗑️ Delete partido
  const handleDeletePartido = (id_partido: string) => {
    if (rol !== "admin") return;
    Alert.alert("Eliminar partido", "¿Querés eliminar este partido?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deletePartido(id_partido);
          Alert.alert("Eliminado", "El partido fue eliminado.");
        },
      },
    ]);
  };

  if (loadingEquipos || loadingPartidos) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* 🏆 Torneo Info */}
        {torneo && (
          <>
            <Text style={[TEXT_STYLES.headingLg, { color: colors.text }]}>{torneo.nombre}</Text>
            <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
              {torneo.fecha_inicio} → {torneo.fecha_fin}
            </Text>
            <Text style={[TEXT_STYLES.body, { color: colors.text }]}>{torneo.ubicacion}</Text>
          </>
        )}

        {/* 👥 Equipos */}
        <Text style={[TEXT_STYLES.headingLg, { color: colors.text, marginTop: 20 }]}>Equipos</Text>
        {equipos.length === 0 ? (
          <Text style={[TEXT_STYLES.body, { color: colors.text }]}>No hay equipos.</Text>
        ) : (
          equipos.map((eq) => (
            <RNView key={eq.id_equipo} style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[TEXT_STYLES.headingSm, { color: colors.text }]}>{eq.nombre}</Text>
              <Text style={[TEXT_STYLES.caption, { color: colors.text }]}>
                {eq.id_jugador1?.nombre} {eq.id_jugador1?.apellido}
                {eq.id_jugador2 ? ` / ${eq.id_jugador2.nombre} ${eq.id_jugador2.apellido}` : ""}
              </Text>
            </RNView>
          ))
        )}

        {/* 🎾 Partidos */}
        <Text style={[TEXT_STYLES.headingLg, { color: colors.text, marginTop: 20 }]}>Partidos</Text>
        {error && <Text style={{ color: "red" }}>Error: {error}</Text>}

        {partidos.length === 0 ? (
          <Text style={[TEXT_STYLES.body, { color: colors.text }]}>No hay partidos.</Text>
        ) : (
          partidos.map((p) => (
            <TouchableOpacity
              key={p.id_partido}
              activeOpacity={0.9}
              onPress={() => handleUploadResultado(p)} // tap = upload result
              onLongPress={() => handleDeletePartido(p.id_partido)} // long press = delete
            >
              <PartidoCard partido={p} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🧾 RESULT MODAL */}
      {showModal && (
        <RNView
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{
              width: "80%",
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              elevation: 10,
            }}
          >
            <Text
              style={[
                TEXT_STYLES.headingSm,
                { color: colors.text, textAlign: "center", marginBottom: 16 },
              ]}
            >
              Cargar resultado
            </Text>

            <RNView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <RNView style={{ flex: 1, alignItems: "center" }}>
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.text }]}>Equipo 1</Text>
                <TextInput
                  keyboardType="numeric"
                  value={score1}
                  onChangeText={setScore1}
                  placeholder="0"
                  placeholderTextColor={colors.border}
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                  ]}
                />
              </RNView>

              <Text style={[TEXT_STYLES.title, { color: colors.text }]}> - </Text>

              <RNView style={{ flex: 1, alignItems: "center" }}>
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.text }]}>Equipo 2</Text>
                <TextInput
                  keyboardType="numeric"
                  value={score2}
                  onChangeText={setScore2}
                  placeholder="0"
                  placeholderTextColor={colors.border}
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
                  ]}
                />
              </RNView>
            </RNView>

            <RNView style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.tint }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirmResultado}>
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.tint }]}>Guardar</Text>
              </TouchableOpacity>
            </RNView>
          </KeyboardAvoidingView>
        </RNView>
      )}

      {/* ➕ FAB */}
      {rol === "admin" && (
        <Animated.View
          style={[styles.fabContainer, animatedStyle, { backgroundColor: colors.tint }]}
        >
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/partidos/create", params: { torneoId: id } })}
            onPressIn={() => (scale.value = 0.9)}
            onPressOut={() => (scale.value = 1)}
            activeOpacity={0.8}
            style={styles.fabButton}
          >
            <Text style={[TEXT_STYLES.fab, { color: colors.background }]}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1, marginVertical: 8 },
  fabContainer: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  fabButton: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 60,
    textAlign: "center",
    fontSize: 16,
  },
});
