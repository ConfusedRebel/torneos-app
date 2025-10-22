import { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { View, Text } from '@/components/Themed';
import type { Partido } from '@/types/partido';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  partido: Partido;
  style?: ViewStyle;
};

function PartidoCardBase({ partido, style }: Props) {
  const { colors } = useTheme();

  const equipoA = partido.participantes.filter((participante) => participante.equipo);
  const equipoB = partido.participantes.filter((participante) => !participante.equipo);

  const formatEquipo = (equipo: Partido['participantes']) => {
    const nombres = equipo
      .map((participante) =>
        participante.jugador
          ? `${participante.jugador.nombre} ${participante.jugador.apellido}`
          : 'Por definir',
      )
      .filter(Boolean)
      .join(' / ');

    return nombres || 'Por definir';
  };

  const torneoNombre = partido.torneo?.nombre ?? 'Torneo desconocido';
  const ubicacion = partido.torneo?.ubicacion ?? 'Ubicación no definida';

  const fecha = new Date(partido.fecha).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

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
        {formatEquipo(equipoA)} vs {formatEquipo(equipoB)}
      </Text>

      <Text style={[styles.cardSubtitle, { color: colors.text }]}>
        {fecha} - {partido.hora}
      </Text>

      <Text style={[styles.cardSubtitle, { color: colors.text }]}>{ubicacion}</Text>

      <Text style={[styles.cardSubtitle, { color: colors.tint, fontWeight: '600' }]}>
        {torneoNombre}
      </Text>

      {partido.resultado && (
        <Text style={[styles.cardResult, { color: colors.text }]}>Resultado: {partido.resultado}</Text>
      )}
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
  cardResult: {
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
  },
});
