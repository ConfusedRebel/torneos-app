import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Small helper
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="landingTab"
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.background }, // RN Navigation v7+
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => (
          <Link href="/config" asChild>
            <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Configuración">
              {({ pressed }) => (
                <FontAwesome
                  name="cog"
                  size={25}
                  color={colors.text}               /* <- use themed color */
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      <Tabs.Screen
        name="landingTab"
        options={{ title: 'Landing', tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} /> }}
      />
      <Tabs.Screen
        name="torneoTab"
        options={{ title: 'Torneos', tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} /> }}
      />
      <Tabs.Screen
        name="rankingTab"
        options={{ title: 'Ranking', tabBarIcon: ({ color }) => <TabBarIcon name="list-ol" color={color} /> }}
      />
      <Tabs.Screen
        name="partidosTab"
        options={{ title: 'Partidos', tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} /> }}
      />
      <Tabs.Screen
        name="perfilTab"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }}
      />
    </Tabs>
  );
}
