import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, router } from "expo-router";
import { z } from "zod";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { TEXT_STYLES } from "@/constants/Text";

// 📘 Validación
const signUpSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  // 🧩 Registro
  const onSubmit = async (data: SignUpForm) => {
    console.log("📨 Datos enviados desde el form:", data);

    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Crear usuario en Supabase Auth (con metadata)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
          },
          // Si ya tenés deep link configurado, acá podrías poner redirect:
          // emailRedirectTo: "tuapp://auth/callback",
        },
      });

      console.log("🔍 signUpData:", signUpData);
      console.log("🔍 signUpError:", signUpError);

      if (signUpError) {
        console.log("❌ Error en signUp:", signUpError.message);
        throw signUpError;
      }

      const user = signUpData.user;
      console.log("🆔 User recibido después del signUp:", user);

      if (!user) {
        console.log("❌ ERROR: signUpData.user es null!");
        throw new Error("No se pudo obtener el usuario al registrarse.");
      }

      // ❌ IMPORTANTÍSIMO:
      // YA NO intentamos insertar en la tabla jugadores desde el cliente.
      // Eso lo hará la Edge Function cuando se confirme el email.

      // 2️⃣ Aviso al usuario
      alert("Revisa tu email para confirmar tu cuenta.");
      console.log("✅ Registro completado correctamente (esperando confirmación de email)");

      router.replace("/(auth)/signin");
    } catch (err) {
      if (err instanceof Error) {
        console.log("❌ ERROR FINAL:", err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={[TEXT_STYLES.hero, styles.title]}>¡Registra tu cuenta!</Text>

          <View style={styles.form}>
            {/* Nombre */}
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Nombre"
                  icon="person-outline"
                  placeholder="María"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nombre?.message}
                />
              )}
            />

            {/* Apellido */}
            <Controller
              control={control}
              name="apellido"
              render={({ field: { onChange, value } }) => (
                <InputField
                  label="Apellido"
                  icon="person-outline"
                  placeholder="Gonzáles"
                  value={value}
                  onChangeText={onChange}
                  error={errors.apellido?.message}
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
                  placeholder="gonzales@gmail.com"
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
                {loading ? "Registrando..." : "Registrarse"}
              </Text>
            </TouchableOpacity>

            {/* Términos */}
            <View style={styles.termsContainer}>
              <Text style={[TEXT_STYLES.body, styles.termsText]}>
                Al crear una cuenta, aceptas nuestros{" "}
                <Text style={[TEXT_STYLES.bodyBold, styles.linkText]}>
                  Términos y Condiciones
                </Text>.
              </Text>
            </View>

            {/* Error */}
            {error && <Text style={[TEXT_STYLES.body, styles.errorText]}>{error}</Text>}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[TEXT_STYLES.body, styles.footerText]}>
                ¿Ya tienes una cuenta?{" "}
                <Link href="/(auth)/signin">
                  <Text style={[TEXT_STYLES.bodyBold, styles.linkText]}>
                    Iniciar sesión
                  </Text>
                </Link>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --------------------------------------------
// COMPONENTE InputField
// --------------------------------------------

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
        style={[
          styles.inputWrapper,
          error && { borderColor: "#dc2626", borderWidth: 1 },
        ]}
      >
        <Ionicons name={icon} size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={[TEXT_STYLES.body, styles.input]}
          placeholderTextColor="#999"
          {...props}
        />
      </View>
      {error && (
        <Text style={[TEXT_STYLES.footnote, styles.inputErrorText]}>
          {error}
        </Text>
      )}
    </View>
  );
}

// --------------------------------------------
// ESTILOS
// --------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { color: "#000", marginBottom: 8 },
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
  termsContainer: { marginTop: 10 },
  termsText: { color: "#666", lineHeight: 20 },
  linkText: { color: "#6366f1" },
  footer: { alignItems: "center", marginTop: 20 },
  footerText: { color: "#666" },
  errorText: { color: "#dc2626", textAlign: "center" },
  inputErrorText: { color: "#dc2626" },
});
