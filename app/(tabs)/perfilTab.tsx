import { StyleSheet, Image, FlatList, View as RNView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Player } from '@/types/jugador';
import { Partido } from '@/types/partidoSingle';
import { PartidoCard } from '@/components/partidoCard';
import { useTheme } from '@/hooks/useTheme';
import image from '@/assets/images/favicon.png';

const samplePlayer: Player = {
  id: '1',
  name: 'Francisco',
  surname: 'García',
  age: 28,
  tennisScore: 1500,
  paddleScore: 1600,
};

const sampleMatches: Partido[] = [
  {
    id: 'm1',
    playerName1: 'Francisco García',
    playerName2: 'Luis Martínez',
    score1: 6,
    score2: 4,
    date: '2023-10-01',
    time: '10:00',
    location: 'Club Deportivo A',
    tournamentName: 'Torneo de Otoño',
  },
  {
    id: 'm2',
    playerName1: 'Francisco García',
    playerName2: 'Carlos López',
    score1: 3,
    score2: 6,
    date: '2023-10-05',
    time: '15:00',
    location: 'Club Deportivo B',
    tournamentName: 'Copa Invierno',
  },
];

export default function TabTwoScreen() {
  const { colors } = useTheme();

  const Header = (
    <RNView>
      {/* Header: avatar + name */}
      <View style={styles.headerRow}>
        <Image
          source={image}
          style={[
            styles.avatar,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {samplePlayer.name} {samplePlayer.surname}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={{ color: colors.text }}>Edad: {samplePlayer.age}</Text>
        <Text style={{ color: colors.text }}>
          Puntuación Tenis: {samplePlayer.tennisScore}
        </Text>
        <Text style={{ color: colors.text }}>
          Puntuación Pádel: {samplePlayer.paddleScore}
        </Text>
      </View>

      {/* Separator */}
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
    </RNView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sampleMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PartidoCard partido={item} />}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  stats: {
    rowGap: 4,
    marginTop: 8,
  },
  separator: {
    height: 1,
    width: '100%',
    marginTop: 16,
  },
});
