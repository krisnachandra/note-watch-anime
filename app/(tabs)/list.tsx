import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { AnimeCard } from '@/components/AnimeCard';
import { searchAnime, Anime, fetchGenres } from '@/lib/anilist';
import { Search, Filter } from 'lucide-react-native';
import { useTheme } from '@/components/ThemeProvider';

export default function ListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<string[] | undefined>(undefined);
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [season, setSeason] = useState<string | undefined>(undefined);
  const [seasonYear, setSeasonYear] = useState<number | undefined>(undefined);

  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  
  useEffect(() => {
    fetchGenres().then(setAvailableGenres).catch(console.error);
  }, []);

  const seasonsList = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];
  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: 20 }, (_, i) => currentYear + 1 - i);

  const toggleSort = (val: string) => {
    setSort(prev => prev && prev[0] === val ? undefined : [val]);
  };
  const toggleGenre = (val: string) => {
    setGenre(prev => prev === val ? undefined : val);
  };
  const toggleSeason = (val: string) => {
    setSeason(prev => prev === val ? undefined : val);
  };
  const toggleYear = (val: number) => {
    setSeasonYear(prev => prev === val ? undefined : val);
  };

  const fetchData = React.useCallback(async (pageNum: number, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await searchAnime(query, pageNum, 20, {
        sort,
        genre,
        season,
        seasonYear
      });
      
      if (data.length < 20) setHasMore(false);
      else setHasMore(true);

      if (isLoadMore) {
        setAnimes(prev => [...prev, ...data]);
      } else {
        setAnimes(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  }, [query, sort, genre, season, seasonYear]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchData(1, false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, sort, genre, season, seasonYear, fetchData]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  };

  const handlePressAnime = (id: number, title: string) => {
    const slug = title.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    router.push(`/anime/${id}-${slug}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Search color={colors.textSecondary} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search anime..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Filter color={colors.primary} size={20} />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={animes}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AnimeCard
                id={item.id}
                title={item.title.romaji || item.title.english}
                coverImage={item.coverImage.large}
                onPress={() => handlePressAnime(item.id, item.title.romaji || item.title.english || 'anime')}
                fullWidth
              />
            </View>
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowFilters(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort By</Text>
              <View style={styles.filterRow}>
                <TouchableOpacity onPress={() => toggleSort('TITLE_ROMAJI')} style={[styles.filterChip, sort?.includes('TITLE_ROMAJI') && { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterChipText}>A-Z</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleSort('POPULARITY_DESC')} style={[styles.filterChip, sort?.includes('POPULARITY_DESC') && { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterChipText}>Popularity</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleSort('SCORE_DESC')} style={[styles.filterChip, sort?.includes('SCORE_DESC') && { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterChipText}>Score</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Genre</Text>
              <View style={styles.filterRow}>
                {availableGenres.map((item) => (
                  <TouchableOpacity key={item} onPress={() => toggleGenre(item)} style={[styles.filterChip, genre === item && { backgroundColor: colors.primary }]}>
                    <Text style={styles.filterChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Season</Text>
              <View style={styles.filterRow}>
                {seasonsList.map((item) => (
                  <TouchableOpacity key={item} onPress={() => toggleSeason(item)} style={[styles.filterChip, season === item && { backgroundColor: colors.primary }]}>
                    <Text style={styles.filterChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Year</Text>
              <View style={styles.filterRow}>
                {yearsList.map((item) => (
                  <TouchableOpacity key={item.toString()} onPress={() => toggleYear(item)} style={[styles.filterChip, seasonYear === item && { backgroundColor: colors.primary }]}>
                    <Text style={styles.filterChipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  filterButton: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48.5%',
    marginBottom: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333344',
  },
  filterChipText: {
    color: '#FFF',
    fontSize: 14,
  },
  applyButton: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
