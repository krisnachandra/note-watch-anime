import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimeCard } from '@/components/AnimeCard';
import { fetchCurrentSeason, fetchPopular, Anime } from '@/lib/anilist';
import { useTheme } from '@/components/ThemeProvider';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [currentSeason, setCurrentSeason] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [seasonData, popularData] = await Promise.all([
          fetchCurrentSeason(),
          fetchPopular(),
        ]);
        setCurrentSeason(seasonData);
        setPopular(popularData);
      } catch (error) {
        console.error('Failed to load anime data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePressAnime = (id: number, title: string) => {
    const slug = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    router.push(`/anime/${id}-${slug}`);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Season</Text>
      <FlatList
        data={currentSeason}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AnimeCard
            id={item.id}
            title={item.title.romaji || item.title.english}
            coverImage={item.coverImage.large}
            onPress={() => handlePressAnime(item.id, item.title.romaji || item.title.english || 'anime')}
          />
        )}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Anime</Text>
      <FlatList
        data={popular}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AnimeCard
            id={item.id}
            title={item.title.romaji || item.title.english}
            coverImage={item.coverImage.large}
            onPress={() => handlePressAnime(item.id, item.title.romaji || item.title.english || 'anime')}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
