import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TorneoCard } from '@/components/torneoCard';
import type { Torneo } from '@/types/torneo';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

// TEMP: mock data
const torneos: Torneo[] = [
  { id: '1', name: 'Torneo Apertura', date: '2025-09-15', location: 'San Isidro' },
  { id: '2', name: 'Copa Primavera',  date: '2025-10-01', location: 'Palermo' },
  { id: '3', name: 'Torneo Clausura', date: '2025-11-20', location: 'La Plata' },
];

export default function TorneosTab() {
  const { colors } = useTheme();

  const openTorneo = (id: string) =>
    router.push({ pathname: '/torneos/[id]', params: { id } });

  // Example loading state (if/when you fetch)
  const isLoading = false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Torneos</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TorneoCard torneo={item} onPress={openTorneo} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 24 }}>
              No hay torneos por ahora
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
});
