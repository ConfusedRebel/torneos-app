import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TorneoCard } from '@/components/torneoCard';
import type { Torneo } from '@/types/torneo';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useTorneos } from '@/data/torneosProvider';
import { useEffect, useState } from 'react';

export default function TorneosTab() {
  const { colors } = useTheme();
  const { list } = useTorneos(); // ← fetch function from provider

  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const openTorneo = (id: string) =>
    router.push({ pathname: '/torneos/[id]', params: { id } });

  useEffect(() => {
    const loadTorneos = async () => {
      try {
        const data = await list();
        setTorneos(data);
      } catch (e) {
        console.error('Error loading torneos', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTorneos();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Torneos</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <FlatList
          data={torneos}
          keyExtractor={(item) => String(item.id_torneo)} // match Supabase id field
          renderItem={({ item }) => (
            <TorneoCard torneo={item} onPress={() => openTorneo(item.id_torneo)} />
          )}
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
