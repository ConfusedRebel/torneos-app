import { StyleSheet, FlatList } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Partido } from '@/types/partidoSingle';
import { PartidoCard } from '@/components/partidoCard';

// Datos de ejemplo
const futureMatches: Partido[] = [
  {
    id: 'f1',
    playerName1: 'Juan Pérez',
    playerName2: 'Carlos López',
    score1: 0,
    score2: 0,
    date: '2025-09-20',
    time: '18:00',
    location: 'Club Central',
    tournamentName: 'Copa Primavera',
  },
  {
    id: 'f2',
    playerName1: 'Francisco García',
    playerName2: 'Luis Martínez',
    score1: 0,
    score2: 0,
    date: '2025-09-25',
    time: '14:30',
    location: 'Club Deportivo Norte',
    tournamentName: 'Torneo Anual',
  },
];

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Futuros Partidos</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      <FlatList
        data={futureMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PartidoCard partido={item} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
