import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '../types/news';

const FAVORITES_KEY = '@news_app_favorites';

// Получить все избранные статьи
export const getFavorites = async (): Promise<Article[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Get favorites error:', error);
    return [];
  }
};

// Добавить в избранное
export const addToFavorites = async (article: Article): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some((fav) => fav.url === article.url);
    
    if (!exists) {
      favorites.push(article);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Add to favorites error:', error);
  }
};

// Удалить из избранного
export const removeFromFavorites = async (url: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((fav) => fav.url !== url);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Remove from favorites error:', error);
  }
};

// Проверить, в избранном ли статья
export const isFavorite = async (url: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.some((fav) => fav.url === url);
  } catch (error) {
    console.error('Check favorite error:', error);
    return false;
  }
};
