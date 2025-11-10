import { StyleSheet, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { TEXT_STYLES } from "@/constants/Text";
import { NoticiaCard } from "@/components/noticiaCard";

export default function LandingTab() {
  const { colors } = useTheme();

  const exampleNews = [
    {
      icon: "football-outline",
      title: "Virreyes RC vence a Alumni",
      subtitle: "Un gran partido del Top 12 con remontada en el segundo tiempo.",
      date: "10 Nov",
    },
    {
      icon: "leaf-outline",
      title: "Nuevas medidas ambientales",
      subtitle: "El gobierno anunció un nuevo plan de forestación urbana.",
      date: "Hoy",
    },
    {
      icon: "cash-outline",
      title: "El dólar cierra en alza",
      subtitle:
        "La divisa sube por tercera jornada consecutiva en el mercado oficial.",
      date: "Ayer",
    },
  ];

  return (
    <View style={styles.container}>
      <Text
        style={[TEXT_STYLES.headingSm, styles.title, { color: colors.text }]}
      >
        Noticias
      </Text>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          width: "100%",
        }}
      >
        {exampleNews.map((n, i) => (
          <NoticiaCard
            key={i}
            icon={n.icon}
            title={n.title}
            subtitle={n.subtitle}
            date={n.date}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  title: {
    marginBottom: 4,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
});
