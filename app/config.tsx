// app/config.tsx
import { View, Text, StyleSheet, Button } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { Link } from 'expo-router';
import { TEXT_STYLES } from '@/constants/Text';

export default function ConfigScreen() {
  const { signOut } = useAuth();
  const { rol } = useAuth(); // 👈 detecta si es admin o jugador
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Configuración</Text>
      <Button title="Cerrar sesión" onPress={signOut} />
      {/* Nuevo acceso admin */}
      {rol === "admin" && (
      <Text style={[TEXT_STYLES.body, styles.footerText, { marginTop: 8 }]}>
        ¿Eres administrador?{" "}
        <Link href="/(auth)/signup/admin">
          <Text style={[TEXT_STYLES.bodyBold, styles.linkText]}>
            Crear cuenta de admin
          </Text>
        </Link>
      </Text>
      )}
    </View>

  );
}
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
  button: { backgroundColor: "#000", borderRadius: 12, height: 48, justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#fff" },
  termsContainer: { marginTop: 10 },
  termsText: { color: "#666", lineHeight: 20 },
  linkText: { color: "#6366f1" },
  footer: { alignItems: "center", marginTop: 20 },
  footerText: { color: "#666" },
  errorText: { color: "#dc2626", textAlign: "center" },
  inputErrorText: { color: "#dc2626" },
});
