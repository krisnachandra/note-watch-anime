import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useTheme } from '@/components/ThemeProvider';

interface EpisodeItemProps {
  episodeNumber: number;
  isChecked: boolean;
  onToggle: (episodeNumber: number, newValue: boolean) => void;
}

export const EpisodeItem: React.FC<EpisodeItemProps> = ({ episodeNumber, isChecked, onToggle }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={() => onToggle(episodeNumber, !isChecked)}
    >
      <Text style={[styles.episodeText, { color: colors.text }]}>Episode {episodeNumber}</Text>
      <Checkbox
        value={isChecked}
        onValueChange={(newValue) => onToggle(episodeNumber, newValue)}
        color={isChecked ? colors.primary : colors.textSecondary}
        style={styles.checkbox}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  episodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
});
