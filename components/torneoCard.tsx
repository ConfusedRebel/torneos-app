import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Torneo } from '@/types/torneo';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  torneo: Torneo;
  onPress?: (id: string) => void;
  style?: ViewStyle;
};

function TorneoCardBase({ torneo, onPress, style }: Props) {
  const { colors } = useTheme();

  const estadoColor =
    torneo.estado === 'en_curso' ? colors.tint : torneo.estado === 'finalizado' ? '#888' : colors.text;

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
        <Text style={[styles.cardTitle, { color: colors.text, backgroundColor: colors.card }]}>
          {torneo.nombre}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}>
          {torneo.fecha_inicio} → {torneo.fecha_fin}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}>
          {torneo.ubicacion}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.text, backgroundColor: colors.card }]}>
          {torneo.deporte} · {torneo.duo ? 'Dobles' : 'Singles'}
        </Text>
        <Text style={[styles.cardSubtitle, { color: estadoColor, backgroundColor: colors.card }]}>Estado: {torneo.estado}</Text>
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
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 14, marginTop: 4 },
});
