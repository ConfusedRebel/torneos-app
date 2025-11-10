import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SpaceMono from '../assets/fonts/SpaceMono-Regular.ttf';
import Constants from "expo-constants";

import { useColorScheme } from '@/components/useColorScheme';

// 🔹 Tus providers
import AuthProvider from '@/providers/AuthProvider';
import { TorneosProvider } from '@/providers/torneosProvider';
import { PartidosProvider } from '@/providers/partidosProvider';
import { JugadoresProvider } from '@/providers/jugadoresProvider';
import { EquiposProvider } from '@/providers/equiposProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Evita que el splash se oculte antes de tiempo
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

const extra = (Constants.expoConfig ?? Constants)?.extra;
console.log("URL:", extra.supabaseUrl);
console.log("KEY EXISTS:", !!extra.supabaseAnonKey);

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <TorneosProvider>
            <PartidosProvider>
              <EquiposProvider>
                <JugadoresProvider>
                  <Stack screenOptions={{ animation: 'simple_push' }}>
                    <Stack.Screen
                      name="(auth)/signin/index"
                      options={{
                        headerShown: false,
                        animation: 'ios_from_right',
                        gestureEnabled: false,
                      }}
                    />
                    <Stack.Screen
                      name="(auth)/signup/index"
                      options={{
                        headerShown: false,
                        animation: 'ios_from_right',
                        gestureEnabled: false,
                      }}
                    />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="config" options={{ title: 'Configuración' }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                  </Stack>
                </JugadoresProvider>
              </EquiposProvider>
            </PartidosProvider>
          </TorneosProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView >
  );
}
