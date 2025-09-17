import { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Partido } from './../types/partido';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  partido: Partido;
  style?: ViewStyle;
};

function PartidoCardBase({ partido, style }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          shadowColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {partido.playerName1} vs {partido.playerName2}
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {partido.score1} - {partido.score2}
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {partido.date} {partido.time}
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {partido.location}
      </Text>
      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {partido.tournamentName}
      </Text>
    </View>
  );
}

export const PartidoCard = memo(PartidoCardBase);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
