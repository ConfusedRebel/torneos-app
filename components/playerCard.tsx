import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Player } from '@/types/jugador';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  player: Player;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

function PlayerCardBase({ player, onPress, style }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(player.id)}
      android_ripple={{ borderless: false, color: colors.border }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${player.name} ${player.surname}`}
    >
      <View>
        <Text style={[styles.cardTitle, { color: colors.text, backgroundColor: colors.card }]}>
          {player.name} {player.surname}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}>
          Edad: {player.age}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}>
          🎾 {player.tennisScore} | 🏓 {player.paddleScore}
        </Text>
      </View>
    </Pressable>
  );
}

export const PlayerCard = memo(PlayerCardBase);

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
  pressed: {
    opacity: 0.9,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
