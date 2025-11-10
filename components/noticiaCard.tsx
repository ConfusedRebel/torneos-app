import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

export function NoticiaCard({
    icon = "newspaper-outline",
    title,
    subtitle,
    date,
}: {
    icon?: string;
    title: string;
    subtitle?: string;
    date: string;
}) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
            ]}
        >
            {/* Left circular icon */}
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: colors.text + "11", borderColor: colors.text + "33" },
                ]}
            >
                <Ionicons name={icon as any} size={40} color={colors.text} />
            </View>

            {/* Right content */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={[styles.date, { color: colors.text + "99" }]}>{date}</Text>
                </View>

                {subtitle && (
                    <Text
                        style={[styles.subtitle, { color: colors.text + "AA" }]}
                        numberOfLines={2}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>
    );
}

// --- Example usage preview ---
export default function NoticiaCardExample() {
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
            subtitle: "La divisa sube por tercera jornada consecutiva en el mercado oficial.",
            date: "Ayer",
        },
    ];

    return (
        <ScrollView
            contentContainerStyle={{
                padding: 16,
                gap: 10,
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
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginVertical: 6,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    content: {
        flex: 1,
        paddingLeft: 12,
        justifyContent: "center",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        flexShrink: 1,
    },
    subtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    date: {
        fontSize: 13,
        fontWeight: "600",
    },
});
