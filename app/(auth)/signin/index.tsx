import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link } from 'expo-router';
import { z } from 'zod';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { TEXT_STYLES } from '@/constants/Text';

const signInSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña es demasiado larga'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema)
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: ENVIAR DATOS A SUPABASE

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (loginError) {
        throw loginError;
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={[TEXT_STYLES.hero, styles.title]}>¡Hola de nuevo!</Text>
        <Text style={[TEXT_STYLES.subtitle, styles.subtitle]}>
          Inicia sesión para continuar usando la aplicación y gestionar tus tareas
        </Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Correo electrónico</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[TEXT_STYLES.body, styles.input]}
                    placeholder="leandro@gmail.com"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.email && (
                  <Text style={[TEXT_STYLES.caption, styles.errorMessage]}>
                    {errors.email.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <Text style={[TEXT_STYLES.body, styles.inputLabel]}>Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[TEXT_STYLES.body, styles.input]}
                    placeholder="********"
                    placeholderTextColor="#999"
                    secureTextEntry
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
                {errors.password && (
                  <Text style={[TEXT_STYLES.caption, styles.errorMessage]}>
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <View style={styles.forgotPassword}>
            <Text style={[TEXT_STYLES.bodyBold, styles.linkText]}>¿Has olvidado tu contraseña?</Text>
          </View>

          {error && <Text style={[TEXT_STYLES.body, styles.errorText]}>{error}</Text>}

          <TouchableOpacity 
            style={styles.button}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={[TEXT_STYLES.button, styles.buttonText]}>
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[TEXT_STYLES.body, styles.footerText]}>
              ¿No tienes una cuenta?{' '}
              <Link href="/(auth)/signup">
                <Text style={[TEXT_STYLES.bodyBold, styles.linkText]}>Regístrate</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#6366f1',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#dc2626',
  },
});