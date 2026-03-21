import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Home, List, PlaySquare, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

export default function TabLayout() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerRight: () => (
          <TouchableOpacity onPress={toggleTheme} style={styles.headerIcon}>
            {theme === 'dark' ? (
              <Sun color={colors.text} size={24} />
            ) : (
              <Moon color={colors.text} size={24} />
            )}
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Anime List',
          tabBarIcon: ({ color }) => <List color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: 'My Watch',
          tabBarIcon: ({ color }) => <PlaySquare color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    marginRight: 16,
  },
});
