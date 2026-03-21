import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchAnimeDetail, AnimeDetail } from '@/lib/anilist';
import { supabase } from '@/lib/supabase';
import { EpisodeItem } from '@/components/EpisodeItem';
import { ChevronLeft, Plus, Trash2, PlayCircle } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';



export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  
  // Parse numeric ID out of potential slug (e.g. "123-naruto" -> 123)
  const animeIdString = String(id).split('-')[0];
  const animeId = Number(animeIdString);

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchListId, setWatchListId] = useState<string | null>(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const animeData = await fetchAnimeDetail(animeId);
        setAnime(animeData);

        // Check if exists in watch list
        const { data: watchListData, error: watchListError } = await supabase
          .from('watch_list')
          .select('id')
          .eq('anime_id', animeId)
          .single();

        if (watchListData) {
          setWatchListId(watchListData.id);
          // Fetch watched episodes
          const { data: episodesData } = await supabase
            .from('watched_episodes')
            .select('episode_number')
            .eq('watch_list_id', watchListData.id);

          if (episodesData) {
            setWatchedEpisodes(episodesData.map(e => e.episode_number));
          }
        } else if (watchListError && watchListError.code !== 'PGRST116') {
            console.error(watchListError);
        }
      } catch (error) {
        console.error('Failed to load anime details', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [animeId]);

  const ensureWatchListEntry = async (): Promise<string | null> => {
    if (watchListId) return watchListId;
    if (!anime) return null;

    try {
      const { data, error } = await supabase
        .from('watch_list')
        .insert({
          anime_id: anime.id,
          title: anime.title.romaji || anime.title.english,
          cover_image: anime.coverImage.large,
          total_episodes: anime.episodes || 0,
          status: 'ON_PROGRESS'
        })
        .select('id')
        .single();

      if (error) throw error;
      setWatchListId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating watch list entry', error);
      return null;
    }
  };

  const removeFromWatchList = async () => {
    if (!watchListId) return;
    try {
      await supabase.from('watch_list').delete().eq('id', watchListId);
      setWatchListId(null);
      setWatchedEpisodes([]);
      router.back();
    } catch (error) {
      console.error('Error removing watch list entry', error);
    }
  };

  const updateAnimeStatus = async (currentId: string, currentWatched: number[]) => {
    if (!anime) return;
    const totalEps = anime.episodes || 0;
    const isDone = currentWatched.length === totalEps && totalEps > 0;
    const status = isDone ? 'DONE' : 'ON_PROGRESS';

    await supabase
      .from('watch_list')
      .update({ status })
      .eq('id', currentId);
  };

  const toggleEpisode = async (episodeNumber: number, newValue: boolean) => {
    let currentWatchListId = watchListId;
    if (!currentWatchListId) {
      currentWatchListId = await ensureWatchListEntry();
    }
    if (!currentWatchListId) return;

    try {
      if (newValue) {
        // Add
        await supabase
          .from('watched_episodes')
          .insert({ watch_list_id: currentWatchListId, episode_number: episodeNumber });
        setWatchedEpisodes(prev => [...prev, episodeNumber]);
        await updateAnimeStatus(currentWatchListId, [...watchedEpisodes, episodeNumber]);
      } else {
        // Remove
        await supabase
          .from('watched_episodes')
          .delete()
          .match({ watch_list_id: currentWatchListId, episode_number: episodeNumber });
        setWatchedEpisodes(prev => prev.filter(ep => ep !== episodeNumber));
        await updateAnimeStatus(currentWatchListId, watchedEpisodes.filter(ep => ep !== episodeNumber));
      }
    } catch (error) {
      console.error('Error toggling episode', error);
    }
  };

  const openTrailer = async () => {
    if (anime?.trailer?.id) {
      const site = anime.trailer.site === 'dailymotion' ? 'dailymotion.com/video/' : 'youtube.com/watch?v=';
      const url = `https://www.${site}${anime.trailer.id}`;
      await Linking.openURL(url);
    }
  };

  if (loading || !anime) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  let displayEpisodes = anime.episodes;

  if (!displayEpisodes) {
    if (anime.nextAiringEpisode?.episode) {
      // show up to the next airing episode
      displayEpisodes = Math.max(1, anime.nextAiringEpisode.episode);
    } else {
      displayEpisodes = 12; // final fallback if completely unknown
    }
  }

  const episodes = Array.from({ length: displayEpisodes }, (_, i) => i + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#FFF" size={28} />
        </TouchableOpacity>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {anime.bannerImage ? (
              <Image source={{ uri: anime.bannerImage }} style={styles.banner} />
            ) : (
              <View style={[styles.bannerPlaceholder, { backgroundColor: colors.surface }]} />
            )}
            <View style={styles.infoSection}>
              <View style={styles.coverWrapper}>
                <Image source={{ uri: anime.coverImage.large }} style={[styles.cover, { borderColor: colors.background }]} />
              </View>
              <View style={styles.titleSection}>
                <Text style={[styles.title, { color: colors.text }]}>{anime.title.romaji || anime.title.english}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Total Episodes: {anime.episodes || 'Unknown'}</Text>
                
                <View style={styles.actionButtonsContainer}>
                  {watchListId ? (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF5252' }]} onPress={removeFromWatchList}>
                       <Trash2 color="#FFF" size={16} />
                       <Text style={styles.actionButtonText}>Remove</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={ensureWatchListEntry}>
                       <Plus color="#FFF" size={16} />
                       <Text style={styles.actionButtonText}>Save</Text>
                    </TouchableOpacity>
                  )}
                  {anime.trailer?.id && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#666' }]} onPress={openTrailer}>
                       <PlayCircle color="#FFF" size={16} />
                       <Text style={styles.actionButtonText}>Trailer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            {anime.description && (
              <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={4}>
                {anime.description.replace(/<[^>]+>/g, '')}
              </Text>
            )}
            <View style={[styles.divider, { backgroundColor: colors.surface }]} />
            <Text style={[styles.episodesHeader, { color: colors.text }]}>Episodes</Text>
          </>
        }
        data={episodes}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EpisodeItem
            episodeNumber={item}
            isChecked={watchedEpisodes.includes(item)}
            onToggle={toggleEpisode}
          />
        )}
      />
    </View>
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
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    width: '100%',
    height: 180,
  },
  infoSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  coverWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
  },
  titleSection: {
    flex: 1,
    marginLeft: 16,
    marginTop: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  episodesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  listContainer: {
    paddingBottom: 40,
  },
});
