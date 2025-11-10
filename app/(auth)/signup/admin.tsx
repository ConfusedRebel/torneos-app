import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { z } from "zod";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { TEXT_STYLES } from "@/constants/Text";

// 📘 Validación del formulario
const adminSignUpSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type AdminSignUpForm = z.infer<typeof adminSignUpSchema>;

export default function SignUpAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminSignUpForm>({
        resolver: zodResolver(adminSignUpSchema),
    });

    // 🧩 Registro de administrador
    const onSubmit = async (data: AdminSignUpForm) => {
        try {
            setLoading(true);
            setError(null);

            // 1️⃣ Crear usuario en Supabase Auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });
            if (signUpError) throw signUpError;

            const user = signUpData.user;
            if (!user) throw new Error("No se pudo obtener el usuario");

            // 2️⃣ Insertar en la tabla administradores
            const { error: insertError } = await supabase.from("administradores").insert([
                {
                    user_id: user.id,
                    nombre: data.nombre,
                    email: data.email,
                    contraseña: data.password,
                },
            ]);
            if (insertError) throw insertError;

            // 3️⃣ Auto login opcional
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (loginError) throw loginError;

            // 4️⃣ Redirigir al panel de administración
            router.replace("/(tabs)/landingTab");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ha ocurrido un error");
        } finally {
            setLoading(false);
        }
    };

    return (
            <View style={styles.container}>
                <Text style={[TEXT_STYLES.hero, styles.title]}>Registro de administrador</Text>
                <Text style={[TEXT_STYLES.subtitle, styles.subtitle]}>
                    Crea una cuenta de administrador para gestionar torneos, equipos y jugadores.
                </Text>

                <View style={styles.form}>
                    {/* Nombre */}
                    <Controller
                        control={control}
                        name="nombre"
                        render={({ field: { onChange, value } }) => (
                            <InputField
                                label="Nombre completo"
                                icon="person-outline"
                                placeholder="Leandro Pérez"
                                value={value}
                                onChangeText={onChange}
                                error={errors.nombre?.message}
                            />
                        )}
                    />

                    {/* Correo */}
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <InputField
                                label="Correo electrónico"
                                icon="mail-outline"
                                placeholder="admin@torneos.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                            />
                        )}
                    />

                    {/* Contraseña */}
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <InputField
                                label="Contraseña"
                                icon="lock-closed-outline"
                                placeholder="********"
                                secureTextEntry
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                            />
                        )}
                    />

                    {/* Botón */}
                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.6 }]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        <Text style={[TEXT_STYLES.button, styles.buttonText]}>
                            {loading ? "Registrando..." : "Crear cuenta administrador"}
                        </Text>
                    </TouchableOpacity>

                    {/* Error */}
                    {error && <Text style={[TEXT_STYLES.body, styles.errorText]}>{error}</Text>}
                </View>
            </View>
    );
}

// ✅ InputField — componente reutilizable
type InputFieldProps = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    error?: string;
} & TextInputProps;

function InputField({ label, icon, error, ...props }: InputFieldProps) {
    return (
        <View style={styles.inputContainer}>
            <Text style={[TEXT_STYLES.body, styles.inputLabel]}>{label}</Text>
            <View
                style={[styles.inputWrapper, error && { borderColor: "#dc2626", borderWidth: 1 }]}
            >
                <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                    style={[TEXT_STYLES.body, styles.input]}
                    placeholderTextColor="#999"
                    {...props}
                />
            </View>
            {error && <Text style={[TEXT_STYLES.footnote, styles.inputErrorText]}>{error}</Text>}
        </View>
    );
}

// ✅ Estilos
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
    container: { flex: 1, padding: 24, justifyContent: "center" },
    title: { color: "#000", marginBottom: 8 },
    subtitle: { color: "#666", marginBottom: 32 },
    form: { gap: 18 },
    inputContainer: { gap: 6 },
    inputLabel: { color: "#333" },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: "#000" },
    button: {
        backgroundColor: "#000",
        borderRadius: 12,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: { color: "#fff" },
    footer: { alignItems: "center", marginTop: 20 },
    footerText: { color: "#666" },
    linkText: { color: "#6366f1" },
    errorText: { color: "#dc2626", textAlign: "center" },
    inputErrorText: { color: "#dc2626" },
});
