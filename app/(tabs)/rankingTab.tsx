import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { JugadorCard } from '@/components/jugadorCard';
import type { Jugador } from '@/types/jugador';
import { useJugadores } from '@/providers/jugadoresProvider';
import { useEffect, useState } from 'react';

export default function JugadorTab() {
  const { list } = useJugadores(); // ✅ Access Supabase methods from context
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJugadores = async () => {
      try {
        const data = await list();
        setJugadores(data);
      } catch (error) {
        console.error('Error loading jugadores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJugadores();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores</Text>

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={jugadores}
          keyExtractor={(item) => item.id_jugador}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <JugadorCard jugador={item} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay jugadores registrados</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  listContent: { paddingBottom: 24 },
  separator: { height: 8 },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 16 },
});
