import { StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Colors from '../../constants/Colors';
import { Text, View } from '@/components/Themed';
import { TorneoCard } from '@/components/torneoCard';
import type { Torneo } from '../../types/torneo';
import { router } from 'expo-router';

// TEMP: if you don't want to fetch yet, keep local mock here
const torneos: Torneo[] = [
  { id: '1', name: 'Torneo Apertura', date: '2025-09-15', location: 'San Isidro' },
  { id: '2', name: 'Copa Primavera',  date: '2025-10-01', location: 'Palermo' },
  { id: '3', name: 'Torneo Clausura', date: '2025-11-20', location: 'La Plata' },
];

const { light, dark } = Colors;

export default function TorneosTab() {
  // Later you’ll replace "torneos" with data from your repo/provider
  const openTorneo = (id: string) =>
    router.push({ pathname: '/torneos/[id]', params: { id } });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Torneos</Text>
      <FlatList
        data={torneos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TorneoCard torneo={item} onPress={openTorneo} />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: dark.background },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: dark.text },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
});
