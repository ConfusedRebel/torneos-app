import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTheme } from '@/hooks/useTheme';

export default function TabOneScreen() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Tab One</Text>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <Text style={{ color: colors.text }}>Espacio para las noticias</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
