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
      title: "Nuevo torneo",
      subtitle: "Nuevo torneo hecho en algun momento de la semana",
      date: "10 Nov",
    },
    {
      icon: "leaf-outline",
      title: "Nuevas medidas ambientales",
      subtitle: "Estamos haciendo cosas para ser ecofriendly o algo asi",
      date: "Hoy",
    },
    {
      icon: "person",
      title: "Ganadora del ultimo torneo",
      subtitle:
        "Felicidades.......",
      date: "Ayer",
    },
  ];
  
  return (
    <View style={styles.container}>

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
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  title: {
    marginBottom: 4,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "10%",
  },
});
