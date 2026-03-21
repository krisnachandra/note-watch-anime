const ANILIST_URL = process.env.EXPO_PUBLIC_ANILIST_API_URL || 'https://graphql.anilist.co';

export interface Anime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  coverImage: {
    large: string;
    medium: string;
  };
  episodes: number;
}

const fetchAniList = async (query: string, variables: Record<string, any> = {}) => {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

// --- Queries ---

const ANIME_FIELDS = `
  id
  title {
    romaji
    english
    native
  }
  coverImage {
    large
    medium
  }
  episodes
`;

export const GET_CURRENT_SEASON = `
  query ($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      media(season: $season, seasonYear: $seasonYear, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        ${ANIME_FIELDS}
      }
    }
  }
`;

export const GET_POPULAR = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        ${ANIME_FIELDS}
      }
    }
  }
`;

export const SEARCH_ANIME = `
  query ($page: Int, $perPage: Int, $search: String, $sort: [MediaSort], $genre: String, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: $sort, genre: $genre, season: $season, seasonYear: $seasonYear, isAdult: false) {
        ${ANIME_FIELDS}
      }
    }
  }
`;

export const GET_ANIME_DETAIL = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${ANIME_FIELDS}
      description
      bannerImage
      nextAiringEpisode {
        episode
      }
      trailer {
        id
        site
      }
    }
  }
`;

export const GET_GENRES = `
  query {
    GenreCollection
  }
`;

// --- Helpers ---

// Get current year and season for queries
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  let season = 'WINTER';
  if (month >= 2 && month <= 4) season = 'SPRING';
  else if (month >= 5 && month <= 7) season = 'SUMMER';
  else if (month >= 8 && month <= 10) season = 'FALL';
  return { season, seasonYear: new Date().getFullYear() };
};

export const fetchCurrentSeason = async (page = 1, perPage = 20): Promise<Anime[]> => {
  const { season, seasonYear } = getCurrentSeason();
  const data = await fetchAniList(GET_CURRENT_SEASON, { page, perPage, season, seasonYear });
  return data.Page.media;
};

export const fetchPopular = async (page = 1, perPage = 20): Promise<Anime[]> => {
  const data = await fetchAniList(GET_POPULAR, { page, perPage });
  return data.Page.media;
};

export const fetchGenres = async (): Promise<string[]> => {
  const data = await fetchAniList(GET_GENRES);
  // filter out some non-anime standard ones if we want, but returning all is fine
  return data.GenreCollection;
};

interface SearchFilters {
  genre?: string;
  season?: string;
  seasonYear?: number;
  sort?: string[];
}

export const searchAnime = async (
  search: string, 
  page = 1, 
  perPage = 20, 
  filters?: SearchFilters
): Promise<Anime[]> => {
  const variables: Record<string, any> = { page, perPage };
  
  if (search && search.trim() !== '') {
    variables.search = search;
  }
  
  // Default Sort A-Z if no search and no sort provided
  variables.sort = filters?.sort || (variables.search ? ['POPULARITY_DESC'] : ['TITLE_ROMAJI']);
  
  if (filters?.genre) variables.genre = filters.genre;
  if (filters?.season) variables.season = filters.season;
  if (filters?.seasonYear) variables.seasonYear = filters.seasonYear;

  const data = await fetchAniList(SEARCH_ANIME, variables);
  return data.Page.media;
};

export interface AnimeDetail extends Anime {
    description: string;
    bannerImage: string;
    nextAiringEpisode?: {
      episode: number;
    } | null;
    trailer?: {
      id: string;
      site: string;
    } | null;
}

export const fetchAnimeDetail = async (id: number): Promise<AnimeDetail> => {
  const data = await fetchAniList(GET_ANIME_DETAIL, { id });
  return data.Media;
};
