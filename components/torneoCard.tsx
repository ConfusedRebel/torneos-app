import { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useTheme } from '@/hooks/useTheme';
import { TEXT_STYLES } from '@/constants/Text';
import { Tables } from '@/types/supabase';

type Props = {
  torneo: Tables<'torneos'>;
  onPress?: (id: string) => void;
  style?: ViewStyle;
  isClub?: boolean;
};

function TorneoCardBase({ torneo, onPress, style, isClub }: Props) {
  const { colors } = useTheme();
  const cardBackground = isClub ? colors.clubCard : colors.card;
  const cardBorder = isClub ? colors.clubBorder : colors.border;

  return (
    <Pressable
      onPress={() => onPress?.(torneo.id_torneo)}
      android_ripple={{ borderless: false, color: cardBorder }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBackground,
          shadowColor: cardBorder,
          borderColor: cardBorder,
        },
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${torneo.nombre}`}
    >
      <View>
        {isClub && (
          <View style={[styles.badge, { backgroundColor: colors.tint, borderColor: cardBorder }]}> 
            <Text style={[TEXT_STYLES.captionBold, { color: colors.onTint }]}>Club</Text>
          </View>
        )}
        <Text
          style={[TEXT_STYLES.title, { color: colors.text, backgroundColor: cardBackground }]}
        >
          {torneo.nombre}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: cardBackground }]}
        >
          {torneo.fecha_inicio}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: cardBackground }]}
        >
          {torneo.ubicacion}
        </Text>
        <Text
          style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text, backgroundColor: cardBackground }]}
        >
          {torneo.duo ? 'Doble' : 'Single'}
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
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  pressed: { opacity: 0.9 },
  cardSubtitle: { marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
  },
});
