import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { ComponentProps } from "react";


type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function NoticiaCard({
    icon,
    title,
    subtitle,
    date,
}: {
    icon?:  string ;
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
                <Ionicons  name={(icon as IoniconName) || "alarm"} size={40} color={colors.text} />
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
