/**
 * Сервис работы с файлами
 * 
 * Управляет загрузкой, выбором и обменом файлами:
 * - Скачивание файлов (изображений) из интернета
 * - Выбор документов из файловой системы устройства
 * - Обмен файлами через системный диалог Share
 * 
 * Используемые технологии:
 * - expo-file-system v19: работа с файловой системой (новый API с Paths и File)
 * - expo-document-picker: выбор документов
 * - expo-sharing: системный диалог обмена файлами
 */

import { Paths, File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

/**
 * Скачивает файл по URL и сохраняет в документы приложения
 * 
 * Использует новый API expo-file-system v19:
 * - Paths.document для получения пути к директории документов
 * - File класс для создания и записи файлов
 * 
 * @param url - URL файла для скачивания
 * @param filename - Имя файла для сохранения (с расширением)
 * @returns Promise<string | null> - URI сохраненного файла или null при ошибке
 * 
 * @example
 * const uri = await downloadFile('https://example.com/image.jpg', 'news_image.jpg');
 * if (uri) {
 *   console.log('Файл сохранен:', uri);
 * }
 */
export const downloadFile = async (
  url: string,
  filename: string
): Promise<string | null> => {
  try {
    // Создаем новый файл в директории документов
    const file = new File(Paths.document, filename);
    await file.create();
    
    // Загружаем файл по URL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Записываем данные в файл
    await file.write(uint8Array);
    
    console.log('File downloaded to:', file.uri);
    return file.uri;
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
};

/**
 * Открывает системный диалог выбора документа
 * 
 * Позволяет пользователю выбрать любой файл из файловой системы устройства.
 * Файл автоматически копируется в кэш-директорию приложения.
 * 
 * @returns Promise<DocumentPickerResult | null> - Результат с информацией о выбранном файле или null при ошибке
 * 
 * @example
 * const result = await pickDocument();
 * if (result && !result.canceled) {
 *   console.log('Выбран файл:', result.assets[0].name);
 * }
 */
export const pickDocument = async (): Promise<DocumentPicker.DocumentPickerResult | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Все типы файлов
      copyToCacheDirectory: true, // Копировать в кэш для безопасного доступа
    });
    
    return result;
  } catch (error) {
    console.error('Document picker error:', error);
    return null;
  }
};

/**
 * Открывает системный диалог обмена файлом
 * 
 * Позволяет поделиться файлом через различные приложения
 * (мессенджеры, email, облачные хранилища и т.д.)
 * 
 * @param fileUri - URI файла для обмена
 * @returns Promise<boolean> - true если обмен успешен, false при ошибке или недоступности функции
 * 
 * @example
 * const success = await shareFile(fileUri);
 * if (success) {
 *   console.log('Файл отправлен');
 * }
 */
export const shareFile = async (fileUri: string): Promise<boolean> => {
  try {
    // Проверяем доступность функции обмена на платформе
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.log('Sharing is not available on this platform');
      return false;
    }
    
    // Открываем системный диалог Share
    await Sharing.shareAsync(fileUri);
    return true;
  } catch (error) {
    console.error('Share error:', error);
    return false;
  }
};

/**
 * Скачивает изображение из новостной статьи
 * 
 * Автоматически генерирует имя файла на основе заголовка статьи,
 * очищая его от специальных символов и ограничивая длину.
 * 
 * @param imageUrl - URL изображения для загрузки
 * @param articleTitle - Заголовок статьи для генерации имени файла
 * @returns Promise<string | null> - URI сохраненного изображения или null при ошибке
 * 
 * @example
 * const uri = await downloadArticleImage(
 *   'https://example.com/image.jpg',
 *   'Важные новости сегодня'
 * );
 */
export const downloadArticleImage = async (
  imageUrl: string,
  articleTitle: string
): Promise<string | null> => {
  try {
    // Генерируем безопасное имя файла из заголовка статьи
    const filename = `${articleTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.jpg`;
    return await downloadFile(imageUrl, filename);
  } catch (error) {
    console.error('Download article image error:', error);
    return null;
  }
};

/**
 * Получает информацию о файле
 * 
 * Проверяет существование файла и получает его размер в байтах.
 * 
 * @param fileUri - URI файла для проверки
 * @returns Promise<{exists: boolean; size: number | null} | null> - Объект с информацией или null при ошибке
 * 
 * @example
 * const info = await getFileInfo(fileUri);
 * if (info?.exists) {
 *   console.log(`Размер файла: ${info.size} байт`);
 * }
 */
export const getFileInfo = async (fileUri: string): Promise<{exists: boolean; size: number | null} | null> => {
  try {
    const file = new File(fileUri);
    const exists = file.exists;
    let size = null;
    
    // Получаем размер только если файл существует
    if (exists) {
      size = file.size;
    }
    
    return { exists, size };
  } catch (error) {
    console.error('Get file info error:', error);
    return null;
  }
};
