import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Torneo } from './../types/torneo';
import Colors from '@/constants/Colors';

type Props = {
  torneo: Torneo;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

const { light, dark } = Colors;

function TorneoCardBase({ torneo, onPress, style }: Props) {
  return (
    <Pressable
      onPress={() => onPress?.(torneo.id)}
      android_ripple={{ borderless: false }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${torneo.name}`}
    >
      <View>
        <Text style={styles.cardTitle}>{torneo.name}</Text>
        <Text style={styles.cardSubtitle}>{torneo.date}</Text>
        <Text style={styles.cardSubtitle}>{torneo.location}</Text>
      </View>
    </Pressable>
  );
}

export const TorneoCard = memo(TorneoCardBase);

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
  cardTitle: { fontSize: 18, fontWeight: 'bold', backgroundColor: dark.middle, color: dark.text },
  cardSubtitle: { fontSize: 14, backgroundColor: dark.middle, color: dark.text  },
});
