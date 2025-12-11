import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useJugadores } from "@/providers/jugadoresProvider";
import { useEquipos } from "@/providers/equiposProvider";
import { useTorneos } from "@/providers/torneosProvider";
import type { Tables } from "@/types/supabase";
import { useTheme } from "@/hooks/useTheme";
import { TEXT_STYLES } from "@/constants/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Jugador = Tables<"jugadores">;

export default function CreateEquipo() {
    const { torneoId } = useLocalSearchParams<{ torneoId: string }>();

    const { colors } = useTheme();
    const { list } = useJugadores();
    const { createEquipo } = useEquipos();
    const { get } = useTorneos();
    const insets = useSafeAreaInsets();

    const [torneoDuo, setTorneoDuo] = useState<boolean>(false);

    const [search, setSearch] = useState("");
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(false);

    const [selected1, setSelected1] = useState<Jugador | null>(null);
    const [selected2, setSelected2] = useState<Jugador | null>(null);

    // ───────────────────────────────────────────────
    // 🔹 Cargar torneo para saber si es DUO
    // ───────────────────────────────────────────────
    useEffect(() => {
        if (!torneoId) return;

        (async () => {
            const t = await get(torneoId);
            if (t) setTorneoDuo(t.duo);
        })();
    }, [torneoId]);

    // ───────────────────────────────────────────────
    // 🔹 Buscar jugadores
    // ───────────────────────────────────────────────
    useEffect(() => {
        let active = true;

        (async () => {
            setLoading(true);
            const data = await list({ search });
            if (active) setJugadores(data);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    }, [search]);

    // ───────────────────────────────────────────────
    // 🔹 Selección
    // ───────────────────────────────────────────────
    function handleSelect(j: Jugador) {
        if (!selected1) return setSelected1(j);

        if (torneoDuo) {
            if (selected1.id_jugador === j.id_jugador) {
                Alert.alert("Error", "No podés elegir el mismo jugador dos veces.");
                return;
            }
            if (!selected2) return setSelected2(j);
            setSelected1(j);
            setSelected2(null);
        } else {
            setSelected1(j);
        }
    }

    // ───────────────────────────────────────────────
    // 🔹 Crear equipo
    // ───────────────────────────────────────────────
    async function handleCreate() {
        if (!torneoId) return;

        if (!selected1) {
            Alert.alert("Error", "Debes seleccionar al menos un jugador.");
            return;
        }

        if (torneoDuo && !selected2) {
            Alert.alert("Error", "Este torneo es en parejas. Debes elegir dos jugadores.");
            return;
        }

        const { error } = await createEquipo({
            id_torneo: torneoId,
            id_jugador1: selected1.id_jugador,
            id_jugador2: torneoDuo ? selected2?.id_jugador ?? null : null,
        });

        // 🔥 CAMBIO NECESARIO: manejar error sin message
        if (error) {
            Alert.alert("Error", typeof error === "string" ? error : "No se pudo crear el equipo");
            return;
        }

        Alert.alert("Equipo creado", "El equipo fue agregado correctamente.");
        router.back();
    }

    // ───────────────────────────────────────────────
    // 🔹 UI
    // ───────────────────────────────────────────────
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[TEXT_STYLES.headingLg, { color: colors.text, marginBottom: 12 }]}>
                Crear Equipo
            </Text>

            <Text style={[TEXT_STYLES.body, { color: colors.text, marginBottom: 8 }]}>
                Torneo: {torneoDuo ? "Dúo (2 jugadores)" : "Individual (1 jugador)"}
            </Text>

            <TextInput
                placeholder="Buscar jugador por apellido..."
                placeholderTextColor={colors.border}
                value={search}
                onChangeText={setSearch}
                style={[
                    styles.input,
                    {
                        borderColor: colors.border,
                        color: colors.text,
                        backgroundColor: colors.card,
                    },
                ]}
            />

            <View style={{ marginVertical: 12 }}>
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.text }]}>Seleccionados:</Text>

                <Text style={{ color: colors.text, marginTop: 4 }}>
                    🎾 Jugador 1: {selected1 ? `${selected1.apellido}, ${selected1.nombre}` : "—"}
                </Text>

                {torneoDuo && (
                    <Text style={{ color: colors.text, marginTop: 2 }}>
                        🎾 Jugador 2: {selected2 ? `${selected2.apellido}, ${selected2.nombre}` : "—"}
                    </Text>
                )}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} />
            ) : (
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        {
                            backgroundColor: colors.background,
                            paddingBottom: insets.bottom + 40,
                        },
                    ]}
                >
                    {jugadores.length === 0 ? (
                        <Text style={{ color: colors.text }}>No hay coincidencias.</Text>
                    ) : (
                        jugadores.map((j) => {
                            const isSelected =
                                selected1?.id_jugador === j.id_jugador ||
                                selected2?.id_jugador === j.id_jugador;

                            return (
                                <TouchableOpacity
                                    key={j.id_jugador}
                                    onPress={() => handleSelect(j)}
                                    style={[
                                        styles.item,
                                        {
                                            backgroundColor: isSelected ? colors.tint : colors.card,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: isSelected ? colors.background : colors.text,
                                        }}
                                    >
                                        {j.apellido}, {j.nombre}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint }]}
                onPress={handleCreate}
            >
                <Text style={[TEXT_STYLES.bodyBold, { color: colors.background }]}>
                    Crear equipo
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    input: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    item: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    button: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
});
