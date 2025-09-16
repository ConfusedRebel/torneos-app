import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { View, Text } from '@/components/Themed';

export default function TorneoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Torneo #{id}</Text>
      <Text>Detalle del torneo…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: 'bold' },
});
