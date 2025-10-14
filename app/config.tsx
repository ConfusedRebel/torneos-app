// app/config.tsx
import { View, Text } from 'react-native';

import { useAuth } from "@/providers/AuthProvider"
import { Button } from 'react-native';


export default function ConfigScreen() {
  const { signOut, jugador } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Configuración</Text>
      <Button title="Cerrar sesión" onPress={signOut} />
    </View>
    
  );
}
