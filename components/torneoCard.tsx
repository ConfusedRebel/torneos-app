import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useTheme } from '@/hooks/useTheme';
import { TEXT_STYLES } from '@/constants/Text';
import { Tables } from '@/types/supabase'

type Props = {
  torneo: Tables<'torneos'>;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

function TorneoCardBase({ torneo, onPress, style }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(torneo.id_torneo)}
      android_ripple={{ borderless: false, color: colors.border }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, shadowColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${torneo.nombre}`}
    >
      <View>
        <Text
          style={[TEXT_STYLES.title, { color: colors.text, backgroundColor: colors.card }]}
        >
          {torneo.nombre}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
          {torneo.fecha_inicio}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
          {torneo.ubicacion}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
          {torneo.duo ? 'duo' : 'single'}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}
        >
        </Text>
      </View>
    </Pressable>
  );
}

export const TorneoCard = memo(TorneoCardBase);

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
  pressed: { opacity: 0.9 },
  cardSubtitle: { marginTop: 4 },
});
