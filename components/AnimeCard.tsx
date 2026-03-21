import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

interface AnimeCardProps {
  id: number;
  title: string;
  coverImage: string;
  onPress: () => void;
  statusBadge?: 'ON_PROGRESS' | 'DONE';
  fullWidth?: boolean;
}
export const AnimeCard: React.FC<AnimeCardProps> = ({ title, coverImage, onPress, statusBadge, fullWidth }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { backgroundColor: colors.surface },
        fullWidth && styles.cardFullWidth
      ]} 
      onPress={onPress}
    >
      <Image source={{ uri: coverImage }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{title}</Text>
        {statusBadge && (
          <View style={[styles.badge, statusBadge === 'DONE' ? styles.badgeDone : styles.badgeProgress]}>
            <Text style={styles.badgeText}>{statusBadge === 'DONE' ? 'Done' : 'On Progress'}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 290, // Fixed height forces all cards to behave uniformly
    marginRight: 12,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  cardFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 8,
    flex: 1, 
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  badge: {
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeProgress: {
    backgroundColor: '#FF9800',
  },
  badgeDone: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
