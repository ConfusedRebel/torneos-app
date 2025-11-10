import { memo } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { View, Text } from "@/components/Themed";
import type { Tables } from "@/types/supabase";
import { useTheme } from "@/hooks/useTheme";
import { TEXT_STYLES } from "@/constants/Text";

export interface Partido extends Tables<"partidos"> {
  equipo1?: { id_equipo: string; nombre: string | null };
  equipo2?: { id_equipo: string; nombre: string | null };
  torneos?: { nombre: string | null; ubicacion: string | null };
}

type Props = {
  partido: Partido;
  style?: ViewStyle;
};

function PartidoCardBase({ partido, style }: Props) {
  const { colors } = useTheme();

  // ✅ Safely access joined fields

  //TODO arreglar para que no busque todos los partidos todo el tiempo  /*console.log(partido.id_partido)*/
  const equipo1Nombre = partido.equipo1?.nombre ?? "Equipo 1";
  const equipo2Nombre = partido.equipo2?.nombre ?? "Equipo 2";
  const ubicacion = partido.torneos?.ubicacion ?? "Ubicación no definida";

  const fecha = new Date(partido.fecha).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
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
      <Text style={[TEXT_STYLES.title, styles.cardTitle, { color: colors.text }]}>
        {equipo1Nombre} vs {equipo2Nombre}
      </Text>

      <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
        {fecha} - {partido.hora}
      </Text>

      <Text style={[TEXT_STYLES.caption, styles.cardSubtitle, { color: colors.text }]}>
        {ubicacion}
      </Text>

      <Text
        style={[TEXT_STYLES.captionBold, styles.cardSubtitle, { color: colors.tint }]}
      >
      </Text>

      {partido.resultado && (
        <Text style={[TEXT_STYLES.detail, styles.cardResult, { color: colors.text }]}>
          Resultado: {partido.resultado}
        </Text>
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
    marginBottom: 4,
  },
  cardSubtitle: {
    marginTop: 2,
  },
  cardResult: {
    marginTop: 6,
  },
});
