import { Platform } from 'react-native';

/**
 * Определяет, работает ли приложение в веб-браузере
 */
export const isWeb = Platform.OS === 'web';

/**
 * Возвращает базовый URL для API запросов
 * - На web использует Netlify Function для проксирования (обход CORS и ограничений NewsAPI)
 * - На мобильных платформах использует прямой доступ к NewsAPI
 */
export const getApiBaseUrl = (): string => {
  if (isWeb) {
    // В production используем Netlify Function
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return '/.netlify/functions/news-proxy';
    }
    // В development на localhost NewsAPI работает напрямую
    return 'https://newsapi.org/v2';
  }
  // На мобильных платформах используем прямой доступ
  return 'https://newsapi.org/v2';
};

/**
 * Определяет, нужно ли использовать прокси для запросов
 */
export const shouldUseProxy = (): boolean => {
  return isWeb && typeof window !== 'undefined' && window.location.hostname !== 'localhost';
};
