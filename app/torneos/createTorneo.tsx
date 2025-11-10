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
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useTorneos } from "@/providers/torneosProvider";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateTorneo() {
    const { colors } = useTheme();
    const { create } = useTorneos();

    const [nombre, setNombre] = useState("");
    const [deporte, setDeporte] = useState<"paddle" | "tennis" | "">("");
    const [ubicacion, setUbicacion] = useState("");
    const [duo, setDuo] = useState(false);
    const [maxParticipantes, setmaxParticipantes] = useState(0);

    // 🗓️ Estados de fecha
    const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
    const [fechaFin, setFechaFin] = useState<Date | null>(null);
    const [showInicioPicker, setShowInicioPicker] = useState(false);
    const [showFinPicker, setShowFinPicker] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // ✅ Crear torneo
    const handleCreate = async () => {
        if (!nombre || !deporte || !fechaInicio || !maxParticipantes) {
            Alert.alert("Campos incompletos", "Por favor completa los datos requeridos");
            return;
        }

        const fecha_inicio_sql = fechaInicio.toISOString().split("T")[0];
        const fecha_fin_sql = fechaFin
            ? fechaFin.toISOString().split("T")[0]
            : fecha_inicio_sql;

        setIsLoading(true);
        const ok = await create({
            nombre,
            deporte,
            ubicacion,
            duo,
            fecha_inicio: fecha_inicio_sql,
            fecha_fin: fecha_fin_sql,
            estado: "pendiente",
            maxParticipantes: 16,
        });
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
            <Text style={[styles.title, { color: colors.text }]}>Crear Torneo</Text>

            {/* Nombre */}
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Nombre del torneo"
                placeholderTextColor="#888"
                value={nombre}
                onChangeText={setNombre}
            />

            {/* Deporte */}
            <RNPicker
                label="Deporte"
                selectedValue={deporte}
                onValueChange={(v) => setDeporte(v as "paddle" | "tennis")}
                colors={colors}
            />

            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                keyboardType="numeric" // shows numeric keypad
                onChangeText={(text) => {
                    // only allow digits
                    const numericValue = text.replace(/[^0-9]/g, "");
                    setmaxParticipantes(numericValue ? parseInt(numericValue, 10) : 0);
                }}
                placeholder="Cantidad de Jugadores "
                placeholderTextColor="#888"
            />

            {/* Ubicación */}
            <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                placeholder="Ubicación"
                placeholderTextColor="#888"
                value={ubicacion}
                onChangeText={setUbicacion}
            />

            {/* Fecha de inicio */}
            <TouchableOpacity
                style={[styles.input, { borderColor: colors.border }]}
                onPress={() => setShowInicioPicker(true)}
            >
                <Text style={{ color: fechaInicio ? colors.text : "#888" }}>
                    {fechaInicio
                        ? `Inicio: ${fechaInicio.toISOString().split("T")[0]}`
                        : "Seleccionar fecha de inicio"}
                </Text>
            </TouchableOpacity>

            {showInicioPicker && (
                Platform.OS === "ios" ? (
                    <View style={styles.iosPickerContainer}>
                        <DateTimePicker
                            value={fechaInicio || new Date()}
                            mode="date"
                            display="inline"
                            onChange={(_, selectedDate) => {
                                if (selectedDate) setFechaInicio(selectedDate);
                            }}
                        />
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => setShowInicioPicker(false)}
                        >
                            <Text style={styles.doneButtonText}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Modal transparent={true} visible={showInicioPicker}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={fechaInicio || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        if (event.type === "set" && selectedDate) {
                                            setFechaInicio(selectedDate);
                                        }
                                        setShowInicioPicker(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                )
            )}

            {/* Fecha de fin */}
            <TouchableOpacity
                style={[styles.input, { borderColor: colors.border }]}
                onPress={() => setShowFinPicker(true)}
            >
                <Text style={{ color: fechaFin ? colors.text : "#888" }}>
                    {fechaFin
                        ? `Fin: ${fechaFin.toISOString().split("T")[0]}`
                        : "Seleccionar fecha de fin (opcional)"}
                </Text>
            </TouchableOpacity>

            {showFinPicker && (
                Platform.OS === "ios" ? (
                    <View style={styles.iosPickerContainer}>
                        <DateTimePicker
                            value={fechaFin || fechaInicio || new Date()}
                            mode="date"
                            display="inline"
                            onChange={(_, selectedDate) => {
                                if (selectedDate) setFechaFin(selectedDate);
                            }}
                        />
                        <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => setShowFinPicker(false)}
                        >
                            <Text style={styles.doneButtonText}>Listo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Modal transparent={true} visible={showFinPicker}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={fechaFin || fechaInicio || new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        if (event.type === "set" && selectedDate) {
                                            setFechaFin(selectedDate);
                                        }
                                        setShowFinPicker(false);
                                    }}
                                />
                            </View>
                        </View>
                    </Modal>
                )
            )}

            {/* Modalidad */}
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
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {isLoading ? "Creando..." : "Crear Torneo"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

/* 🔧 Picker reutilizable */
function RNPicker({
    label,
    selectedValue,
    onValueChange,
    colors,
    options = [
        { label: "Paddle", value: "paddle" },
        { label: "Tennis", value: "tennis" },
    ],
}: {
    label: string;
    selectedValue: string;
    onValueChange: (v: string) => void;
    colors: ReturnType<typeof useTheme>["colors"];
    options?: { label: string; value: string }[];
}) {
    return (
        <View
            style={[
                styles.pickerBox,
                { borderColor: colors.border, backgroundColor: colors.card },
            ]}
        >
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
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

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, gap: 16 },
    title: { fontSize: 22, fontWeight: "600", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    btn: {
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
    pickerBox: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
    },
    label: { fontSize: 14, marginRight: 8 },

    // 📱 iOS inline picker
    iosPickerContainer: {
        marginVertical: 8,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
    },
    doneButton: {
        alignSelf: "flex-end",
        backgroundColor: "#000",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
    },
    doneButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },

    // 📱 Android modal
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        margin: 20,
        borderRadius: 12,
        padding: 16,
    },
});
