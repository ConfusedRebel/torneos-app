import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Jugador } from '@/types/jugador';
import { useTheme } from '@/hooks/useTheme';
import { TEXT_STYLES } from '@/constants/Text';

type Props = {
  jugador: Jugador;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

function JugadorCardBase({ jugador, onPress, style }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(jugador.id_jugador)}
      android_ripple={{ borderless: false, color: colors.border }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${jugador.nombre} ${jugador.apellido}`}
    >
      <View>
        <Text
          style={[TEXT_STYLES.title, { color: colors.text, backgroundColor: colors.card }]}
        >
          {jugador.nombre} {jugador.apellido}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
          Edad: {jugador.edad}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
          🎾 {jugador.ranking_tennis} | 🏓 {jugador.ranking_paddle}
        </Text>
      </View>
    </Pressable>
  );
}

export const JugadorCard = memo(JugadorCardBase);

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
  cardSubtitle: {
    marginTop: 4,
  },
});
