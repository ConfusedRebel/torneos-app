import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Player } from '@/types/player';
import Colors from '@/constants/Colors';

type Props = {
  player: Player;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

const { dark } = Colors;

function PlayerCardBase({ player, onPress, style }: Props) {
  return (
    <Pressable
      onPress={() => onPress?.(player.id)}
      android_ripple={{ borderless: false }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${player.name} ${player.surname}`}
    >
      <View>
        <Text style={styles.cardTitle}>
          {player.name} {player.surname}
        </Text>
        <Text style={styles.cardSubtitle}>Edad: {player.age}</Text>
        <Text style={styles.cardSubtitle}>
          🎾 {player.tennisScore} | 🏓 {player.paddleScore}
        </Text>
      </View>
    </Pressable>
  );
}

export const PlayerCard = memo(PlayerCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: dark.middle,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: dark.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pressed: { opacity: 0.9 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: dark.text, backgroundColor: dark.middle },
  cardSubtitle: { fontSize: 14, color: dark.text, marginTop: 4, backgroundColor: dark.middle },
});
