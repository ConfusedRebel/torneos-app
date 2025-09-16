import { StyleSheet, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed'; // or: import { Text, View } from 'react-native';
import { PlayerCard } from '@/components/playerCard'; // ensure file & export names match casing
import type { Player } from '../../types/player';

export const players: Player[] = [
  { id: '1', name: 'Juan', surname: 'Pérez', age: 24, tennisScore: 1450, paddleScore: 1320 },
  { id: '2', name: 'María', surname: 'Gómez', age: 21, tennisScore: 1380, paddleScore: 1410 },
  { id: '3', name: 'Lucas', surname: 'Fernández', age: 27, tennisScore: 1500, paddleScore: 1360 },
  { id: '4', name: 'Sofía', surname: 'Martínez', age: 22, tennisScore: 1290, paddleScore: 1480 },
  { id: '5', name: 'Diego', surname: 'Rodríguez', age: 29, tennisScore: 1530, paddleScore: 1340 },
  { id: '6', name: 'Carla', surname: 'López', age: 26, tennisScore: 1420, paddleScore: 1490 },
  { id: '7', name: 'Mateo', surname: 'Silva', age: 23, tennisScore: 1360, paddleScore: 1310 },
  { id: '8', name: 'Valentina', surname: 'Díaz', age: 25, tennisScore: 1470, paddleScore: 1400 },
  { id: '9', name: 'Nicolás', surname: 'Ramírez', age: 28, tennisScore: 1520, paddleScore: 1370 },
  { id: '10', name: 'Camila', surname: 'Torres', age: 22, tennisScore: 1350, paddleScore: 1500 },
];

export default function PlayerTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores</Text>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={players}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <PlayerCard player={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  listContent: { paddingBottom: 24 },
  separator: { height: 8 },
});
