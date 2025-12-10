import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
    const { token } = useLocalSearchParams();
    const [password, setPassword] = useState('');

    const handleReset = async () => {
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) alert(error.message);
        else alert("Tu contraseña fue actualizada.");
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Ingresá tu nueva contraseña</Text>

            <TextInput
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginVertical: 10,
                    borderRadius: 6
                }}
            />

            <Button title="Actualizar" onPress={handleReset} />
        </View>
    );
}
