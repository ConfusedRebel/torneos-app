import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Platform,
    Modal,
    Switch,
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useTorneos } from "@/providers/torneosProvider";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { TablesInsert } from "@/types/supabase";
import { TEXT_STYLES } from "@/constants/Text";
import Colors from "@/constants/Colors";

type ThemeColors = (typeof Colors)[keyof typeof Colors];
type DeporteValue = "paddle" | "tennis" | "";

export default function CreateTorneo() {
    const { colors } = useTheme();
    const { create } = useTorneos();

    const [nombre, setNombre] = useState("");
    const [deporte, setDeporte] = useState<DeporteValue>("");
    const [ubicacion, setUbicacion] = useState("");

    const [club, setClub] = useState(false);
    const [duo, setDuo] = useState(false);
    const [maxParticipantes, setMaxParticipantes] = useState<number | null>(null);

    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [showInicioPicker, setShowInicioPicker] = useState(false);
    const [showFinPicker, setShowFinPicker] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // ⭐ CREAR TORNEO
    const handleCreate = async () => {
        if (!nombre || !deporte || !fechaInicio || !maxParticipantes) {
            Alert.alert("Campos incompletos", "Completá los datos requeridos.");
            return;
        }

        const fecha_inicio_sql = fechaInicio.toISOString().split("T")[0];
        const fecha_fin_sql = fechaFin
            ? fechaFin.toISOString().split("T")[0]
            : fecha_inicio_sql;

        const payload: TablesInsert<"torneos"> = {
            nombre,
            deporte,
            ubicacion,
            duo,
            club,
            fecha_inicio: fecha_inicio_sql,
            fecha_fin: fecha_fin_sql,
            estado: "pendiente",
            maxParticipantes,
        };

        setIsLoading(true);
        const ok = await create(payload);
        setIsLoading(false);

        if (ok) {
            Alert.alert("✅ Torneo creado correctamente");
            router.back();
        } else {
            Alert.alert("❌ Error al crear el torneo");
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
        >
            <Text style={[TEXT_STYLES.headingMd, styles.title, { color: colors.text }]}>Crear Torneo</Text>

            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Nombre del torneo"
                placeholderTextColor={colors.mutedText}
                value={nombre}
                onChangeText={setNombre}
            />

            <RNPicker
                label="Deporte"
                selectedValue={deporte}
                onValueChange={(v) => setDeporte(v as DeporteValue)}
                colors={colors}
            />

            {/* SWITCH CLUB */}
            <View style={styles.switchRow}>
                <Text style={[TEXT_STYLES.body, { color: colors.text }]}>Torneo de Club</Text>
                <Switch
                    value={club}
                    onValueChange={setClub}
                    thumbColor={club ? colors.tint : colors.border}
                />
            </View>

            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                keyboardType="numeric"
                placeholder="Cantidad de Participantes"
                placeholderTextColor={colors.mutedText}
                onChangeText={(txt) => {
                    const clean = txt.replace(/[^0-9]/g, "");
                    setMaxParticipantes(clean ? parseInt(clean) : null);
                }}
            />

            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Ubicación"
                placeholderTextColor={colors.mutedText}
                value={ubicacion}
                onChangeText={setUbicacion}
            />

            {/* FECHA INICIO */}
            <TouchableOpacity
                style={[styles.input, { borderColor: colors.border }]}
                onPress={() => setShowInicioPicker(true)}
            >
                <Text style={[TEXT_STYLES.body, { color: fechaInicio ? colors.text : colors.mutedText }]}>
                    {fechaInicio
                        ? `Inicio: ${fechaInicio.toISOString().split("T")[0]}`
                        : "Seleccionar fecha de inicio"}
                </Text>
            </TouchableOpacity>

            {showInicioPicker && (
                Platform.OS === "ios" ? (
                    <View style={[styles.iosPickerContainer, { backgroundColor: colors.card }]}>
                        <DateTimePicker
                            value={fechaInicio || new Date()}
                            mode="date"
                            display="inline"
                            onChange={(_, d) => d && setFechaInicio(d)}
                        />
                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: colors.tint }]}
                            onPress={() => setShowInicioPicker(false)}
                        >
                            <Text style={[TEXT_STYLES.button, styles.doneButtonText, { color: colors.onTint }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Modal transparent visible>
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                                <DateTimePicker
                                    value={fechaInicio || new Date()}
                                    mode="date"
                                    onChange={(e, d) => {
                                        if (e.type === "set" && d) setFechaInicio(d);
                                        setShowInicioPicker(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                )
            )}

            {/* FECHA FIN */}
            <TouchableOpacity
                style={[styles.input, { borderColor: colors.border }]}
                onPress={() => setShowFinPicker(true)}
            >
                <Text style={[TEXT_STYLES.body, { color: fechaFin ? colors.text : colors.mutedText }]}>
                    {fechaFin
                        ? `Fin: ${fechaFin.toISOString().split("T")[0]}`
                        : "Seleccionar fecha de fin (opcional)"}
                </Text>
            </TouchableOpacity>

            {showFinPicker && (
                Platform.OS === "ios" ? (
                    <View style={[styles.iosPickerContainer, { backgroundColor: colors.card }]}>
                        <DateTimePicker
                            value={fechaFin || fechaInicio || new Date()}
                            mode="date"
                            display="inline"
                            onChange={(_, d) => d && setFechaFin(d)}
                        />
                        <TouchableOpacity
                            style={[styles.doneButton, { backgroundColor: colors.tint }]}
                            onPress={() => setShowFinPicker(false)}
                        >
                            <Text style={[TEXT_STYLES.button, styles.doneButtonText, { color: colors.onTint }]}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Modal transparent visible>
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                                <DateTimePicker
                                    value={fechaFin || fechaInicio || new Date()}
                                    mode="date"
                                    onChange={(e, d) => {
                                        if (e.type === "set" && d) setFechaFin(d);
                                        setShowFinPicker(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                )
            )}

            <RNPicker
                label="Modalidad"
                selectedValue={duo ? "doble" : "single"}
                onValueChange={(v) => setDuo(v === "doble")}
                colors={colors}
                options={[
                    { label: "Single", value: "single" },
                    { label: "Doble", value: "doble" },
                ]}
            />

            <TouchableOpacity
                disabled={isLoading}
                style={[styles.btn, { backgroundColor: colors.tint }]}
                onPress={handleCreate}
            >
                <Text style={[TEXT_STYLES.button, { color: colors.onTint }]}>
                    {isLoading ? "Creando..." : "Crear Torneo"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

/* ───────────── RNPicker Component ───────────── */

interface RNPickerProps {
    label: string;
    selectedValue: string;
    onValueChange: (v: string) => void;
    colors: ThemeColors;
    options?: { label: string; value: string }[];
}

function RNPicker({
    label,
    selectedValue,
    onValueChange,
    colors,
    options = [
        { label: "Padle", value: "paddle" },
        { label: "Tenis", value: "tennis" },
    ],
}: RNPickerProps) {
    return (
        <View
            style={[
                styles.pickerBox,
                { borderColor: colors.border, backgroundColor: colors.card },
            ]}
        >
            <Text style={[TEXT_STYLES.caption, { color: colors.text, marginRight: 8 }]}>{label}</Text>

            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                dropdownIconColor={colors.text}
                style={{ color: colors.text, flex: 1 }}
            >
                <Picker.Item label="Seleccionar..." value="" />
                {options.map((o) => (
                    <Picker.Item key={o.value} label={o.label} value={o.value} />
                ))}
            </Picker>
        </View>
    );
}

/* ───────────── Styles ───────────── */

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, gap: 16 },
    title: { marginBottom: 10 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    btn: { padding: 14, borderRadius: 10, alignItems: "center", marginTop: 20 },

    pickerBox: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },

    iosPickerContainer: { marginVertical: 8, borderRadius: 8, padding: 10 },

    doneButton: {
        alignSelf: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
    },
    doneButtonText: { fontWeight: "bold" },

    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: { margin: 20, borderRadius: 12, padding: 16 },
});
