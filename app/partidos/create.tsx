import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { TEXT_STYLES } from "@/constants/Text";
import { useAuth } from "@/providers/AuthProvider";
import { useEquipos } from "@/providers/equiposProvider";
import { usePartidos } from "@/providers/partidosProvider";
import type { TablesInsert } from "@/types/supabase";

export default function CreatePartido() {
    const { torneoId } = useLocalSearchParams<{ torneoId: string }>();
    const { colors } = useTheme();
    const { rol } = useAuth();

    const { equipos, getEquiposByTorneo, loading: loadingEquipos } = useEquipos();
    const { createPartido, loading: loadingPartidos } = usePartidos();

    const [equipo1, setEquipo1] = useState<string | null>(null);
    const [equipo2, setEquipo2] = useState<string | null>(null);
    const [fecha, setFecha] = useState<Date>(new Date());
    const [hora, setHora] = useState<Date>(new Date());
    const [fase, setFase] = useState<string>("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // 🔹 Load equipos once for this torneo
    useEffect(() => {
        if (!torneoId) return;
        getEquiposByTorneo(torneoId);
    }, [torneoId]);

    // 🔹 Create partido
    const handleCreate = async () => {
        if (rol !== "admin") {
            Alert.alert("Acceso denegado", "Solo los administradores pueden crear partidos.");
            return;
        }

        if (!equipo1 || !equipo2) {
            Alert.alert("Datos faltantes", "Seleccioná ambos equipos.");
            return;
        }

        if (equipo1 === equipo2) {
            Alert.alert("Error", "Los equipos deben ser diferentes.");
            return;
        }

        const fechaISO = fecha.toISOString().split("T")[0];
        const horaStr = hora.toTimeString().slice(0, 8);

        const newPartido: TablesInsert<"partidos"> = {
            id_torneo: torneoId!,
            id_equipo1: equipo1,
            id_equipo2: equipo2,
            fecha: fechaISO,
            hora: horaStr,
            fase: fase || null,
        };

        try {
            await createPartido(newPartido);
            Alert.alert("✅ Éxito", "Partido creado correctamente.", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Error loading partidos:", err.message);
            } else {
                console.error("Error desconocido:", err);
            }
            Alert.alert("Error", "No se pudo crear el partido.");
        }
    };

    // ==========================
    // 📱 Render
    // ==========================
    if (loadingEquipos) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <Text style={[TEXT_STYLES.body, { color: colors.text }]}>Cargando equipos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[TEXT_STYLES.headingLg, { color: colors.text, marginBottom: 16 }]}>
                Crear Partido
            </Text>

            {/* EQUIPO 1 */}
            <Text style={[TEXT_STYLES.bodyBold, { color: colors.text }]}>Equipo 1</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                    selectedValue={equipo1}
                    onValueChange={(val) => setEquipo1(val)}
                    dropdownIconColor={colors.text}
                >
                    <Picker.Item label="Seleccionar equipo 1" value={null} />
                    {equipos.map((e) => (
                        <Picker.Item key={e.id_equipo} value={e.id_equipo} label={e.nombre ?? "Nombre vacio"} />
                    ))}
                </Picker>
            </View>

            {/* EQUIPO 2 */}
            {/* EQUIPO 2 */}
            <Text style={[TEXT_STYLES.bodyBold, { color: colors.text, marginTop: 12 }]}>
                Equipo 2
            </Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker
                    selectedValue={equipo2}
                    onValueChange={(val) => setEquipo2(val)}
                    dropdownIconColor={colors.text}
                >
                    <Picker.Item label="Seleccionar equipo 2" value={null} />
                    {equipos
                        .filter((e) => e.id_equipo !== equipo1) // 👈 hide equipo1
                        .map((e) => (
                            <Picker.Item
                                key={e.id_equipo}
                                value={e.id_equipo}
                                label={e.nombre ?? "Sin nombre"}
                            />
                        ))}
                </Picker>
            </View>
            {/* Fecha */}
            <Text style={[TEXT_STYLES.bodyBold, { color: colors.text, marginTop: 12 }]}>Fecha</Text>
            <TouchableOpacity
                style={[styles.fieldButton, { borderColor: colors.border }]}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
                    {fecha.toLocaleDateString("es-AR")}
                </Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    mode="date"
                    value={fecha}
                    display="default"
                    onChange={(e, selected) => {
                        setShowDatePicker(false);
                        if (selected) setFecha(selected);
                    }}
                />
            )}

            {/* Hora */}
            <Text style={[TEXT_STYLES.bodyBold, { color: colors.text, marginTop: 12 }]}>Hora</Text>
            <TouchableOpacity
                style={[styles.fieldButton, { borderColor: colors.border }]}
                onPress={() => setShowTimePicker(true)}
            >
                <Text style={[TEXT_STYLES.body, { color: colors.text }]}>
                    {hora.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </Text>
            </TouchableOpacity>
            {showTimePicker && (
                <DateTimePicker
                    mode="time"
                    value={hora}
                    is24Hour={true}
                    display="default"
                    onChange={(e, selected) => {
                        setShowTimePicker(false);
                        if (selected) setHora(selected);
                    }}
                />
            )}

            {/* Fase */}
            <Text style={[TEXT_STYLES.bodyBold, { color: colors.text, marginTop: 12 }]}>Fase</Text>
            <View style={[styles.pickerContainer, { borderColor: colors.border }]}>
                <Picker selectedValue={fase} onValueChange={setFase} dropdownIconColor={colors.text}>
                    <Picker.Item label="Seleccionar fase (opcional)" value="" />
                    <Picker.Item label="Grupo 1" value="Grupo 1" />
                    <Picker.Item label="Grupo 2" value="Grupo 2" />
                    <Picker.Item label="Grupo 3" value="Grupo 3" />
                    <Picker.Item label="Grupo 4" value="Grupo 4" />
                    <Picker.Item label="Primera ronda" value="Primera ronda" />
                    <Picker.Item label="Cuartos de final" value="Cuartos de final" />
                    <Picker.Item label="Semifinal" value="Semifinal" />
                    <Picker.Item label="Final" value="Final" />
                </Picker>
            </View>

            {/* BOTÓN CREAR */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint }]}
                onPress={handleCreate}
                disabled={loadingPartidos}
            >
                <Text style={[TEXT_STYLES.button, { color: colors.background }]}>
                    {loadingPartidos ? "Creando..." : "Crear partido"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// ==========================
// 🎨 STYLES
// ==========================
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 6,
    },
    button: {
        marginTop: 24,
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    fieldButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 6,
    },
});
