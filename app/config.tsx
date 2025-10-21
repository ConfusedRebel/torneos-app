// app/config.tsx
import { View, Text, Button } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function ConfigScreen() {
  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Configuración</Text>
      <Button title="Cerrar sesión" onPress={signOut} />
    </View>
    
  );
}
