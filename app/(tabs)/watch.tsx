import { AnimeCard } from "@/components/AnimeCard";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface WatchListItem {
  id: string;
  anime_id: number;
  title: string;
  cover_image: string;
  total_episodes: number;
  status: "ON_PROGRESS" | "DONE";
}

export default function WatchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [watchList, setWatchList] = useState<WatchListItem[]>([]);

  const fetchWatchList = async () => {
    try {
      const { data, error } = await supabase
        .from("watch_list")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        throw error;
      }
      setWatchList(data as WatchListItem[]);
    } catch (error) {
      console.error("Error fetching watch list:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWatchList();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchWatchList();
  };

  const handlePressAnime = (id: number, title: string) => {
    const slug = title
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    router.push(`/anime/${id}-${slug}`);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {watchList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You haven&apos;t added any anime to your watch list yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={watchList}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          keyExtractor={(item) => item.anime_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AnimeCard
                id={item.anime_id}
                title={item.title}
                coverImage={item.cover_image}
                onPress={() =>
                  handlePressAnime(item.anime_id, item.title || "anime")
                }
                statusBadge={item.status}
                fullWidth
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48.5%",
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
