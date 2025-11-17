/**
 * Сервис работы с новостным API
 * 
 * Взаимодействует с NewsAPI.org для получения новостей с поддержкой:
 * - Топовые заголовки по странам и категориям
 * - Поиск новостей с фильтрацией
 * - Сортировка и пагинация
 * 
 * API Documentation: https://newsapi.org/docs
 */

import axios from 'axios';
import { API_KEY, BASE_URL, PAGE_SIZE } from '../config/api';
import { NewsResponse } from '../types/news';
import { shouldUseProxy } from '../utils/platformUtils';

/**
 * Интерфейс фильтров для поиска новостей
 */
export interface NewsFilters {
  /** Поисковый запрос (ключевые слова) */
  query?: string;
  /** Категория новостей (business, entertainment, general, health, science, sports, technology) */
  category?: string;
  /** Дата начала (ISO 8601 формат, например: 2024-01-01T00:00:00Z) */
  fromDate?: string;
  /** Дата окончания (ISO 8601 формат) */
  toDate?: string;
  /** Метод сортировки результатов */
  sortBy?: 'publishedAt' | 'relevancy' | 'popularity';
}

/**
 * Получает топовые новостные заголовки
 * 
 * Использует эндпоинт /top-headlines для получения актуальных новостей.
 * Поддерживает фильтрацию по стране (по умолчанию US), категории и поисковому запросу.
 * 
 * @param query - Поисковый запрос (опционально). Если указан, игнорирует параметр country.
 * @param page - Номер страницы для пагинации (начиная с 1)
 * @param category - Категория новостей ('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology', 'all')
 * @returns Promise<NewsResponse> - Объект с массивом статей и общим количеством результатов
 * 
 * @throws {Error} При ошибке сети или проблемах с API
 * 
 * @example
 * // Получить топ новости США
 * const news = await fetchTopHeadlines('', 1);
 * 
 * // Получить технологические новости
 * const techNews = await fetchTopHeadlines('', 1, 'technology');
 * 
 * // Поиск по запросу
 * const searchResults = await fetchTopHeadlines('Bitcoin', 1);
 */
export const fetchTopHeadlines = async (
  query: string = '',
  page: number = 1,
  category?: string
): Promise<NewsResponse> => {
  try {
    // Всегда используем прямой доступ к NewsAPI
    // NewsAPI поддерживает CORS для браузерных запросов
    const params: any = {
      apiKey: API_KEY,
      pageSize: PAGE_SIZE,
      page,
      language: 'en', // Язык новостей - английский
    };

    // Если указан запрос, используем его; иначе берем новости по стране
    if (query) {
      params.q = query;
    } else {
      params.country = 'us'; // По умолчанию новости США
    }

    // Фильтрация по категории
    if (category && category !== 'all') {
      params.category = category;
    }

    const response = await axios.get(`${BASE_URL}/top-headlines`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

/**
 * Выполняет расширенный поиск новостей с фильтрацией
 * 
 * Использует эндпоинт /everything для поиска по всему массиву статей NewsAPI.
 * Поддерживает фильтрацию по датам и различные методы сортировки.
 * 
 * @param query - Поисковый запрос (обязательный). Если пустой, использует 'news'.
 * @param page - Номер страницы для пагинации (начиная с 1)
 * @param filters - Объект с дополнительными фильтрами:
 *   - fromDate: начальная дата (ISO 8601)
 *   - toDate: конечная дата (ISO 8601)
 *   - sortBy: метод сортировки ('publishedAt', 'relevancy', 'popularity')
 * 
 * @returns Promise<NewsResponse> - Объект с массивом статей и общим количеством результатов
 * 
 * @throws {Error} При ошибке сети или проблемах с API
 * 
 * @example
 * // Простой поиск
 * const results = await searchNews('Tesla', 1);
 * 
 * // Поиск с фильтрацией по датам
 * const filtered = await searchNews('Bitcoin', 1, {
 *   fromDate: '2024-01-01T00:00:00Z',
 *   toDate: '2024-01-31T23:59:59Z',
 *   sortBy: 'popularity'
 * });
 */
export const searchNews = async (
  query: string,
  page: number = 1,
  filters?: NewsFilters
): Promise<NewsResponse> => {
  try {
    // Всегда используем прямой доступ к NewsAPI
    const params: any = {
      apiKey: API_KEY,
      q: query || 'news', // Запрос обязателен для эндпоинта /everything
      pageSize: PAGE_SIZE,
      page,
      sortBy: filters?.sortBy || 'publishedAt', // По умолчанию сортировка по дате публикации
    };

    // Фильтрация по дате начала
    if (filters?.fromDate) {
      params.from = filters.fromDate;
    }

    // Фильтрация по дате окончания
    if (filters?.toDate) {
      params.to = filters.toDate;
    }

    const response = await axios.get(`${BASE_URL}/everything`, { params });
    return response.data;
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};
