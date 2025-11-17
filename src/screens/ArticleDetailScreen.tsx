import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { formatDate } from '../utils/dateUtils';
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '../services/favoritesService';
import {
  downloadArticleImage,
  shareFile,
  pickDocument,
} from '../services/fileService';
import { sendLocalNotification } from '../services/notificationService';

type ArticleDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ArticleDetail'
>;

type ArticleDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ArticleDetail'
>;

interface Props {
  navigation: ArticleDetailScreenNavigationProp;
  route: ArticleDetailScreenRouteProp;
}

export const ArticleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { article } = route.params;
  const [showWebView, setShowWebView] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    const status = await isFavorite(article.url);
    setFavorite(status);
  };

  const handleToggleFavorite = async () => {
    if (favorite) {
      await removeFromFavorites(article.url);
      setFavorite(false);
      Alert.alert('Удалено', 'Статья удалена из избранного');
    } else {
      await addToFavorites(article);
      setFavorite(true);
      Alert.alert('Добавлено', 'Статья добавлена в избранное');
      await sendLocalNotification(
        'Добавлено в избранное',
        article.title
      );
    }
  };

  const handleDownloadImage = async () => {
    if (!article.urlToImage) {
      Alert.alert('Ошибка', 'У этой статьи нет изображения');
      return;
    }

    Alert.alert(
      'Скачать изображение',
      'Вы хотите скачать изображение этой статьи?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Скачать',
          onPress: async () => {
            const fileUri = await downloadArticleImage(
              article.urlToImage!,
              article.title
            );
            if (fileUri) {
              Alert.alert(
                'Успешно',
                'Изображение скачано!',
                [
                  { text: 'OK' },
                  {
                    text: 'Поделиться',
                    onPress: () => shareFile(fileUri),
                  },
                ]
              );
            } else {
              Alert.alert('Ошибка', 'Не удалось скачать изображение');
            }
          },
        },
      ]
    );
  };

  const handleUploadFile = async () => {
    const result = await pickDocument();
    if (result && !result.canceled && result.assets) {
      const file = result.assets[0];
      Alert.alert(
        'Файл выбран',
        `${file.name || 'Файл'} готов к отправке`,
        [
          { text: 'OK' },
          {
            text: 'Поделиться',
            onPress: () => file.uri && shareFile(file.uri),
          },
        ]
      );
    }
  };

  if (showWebView) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowWebView(false)}
        >
          <Text style={styles.closeButtonText}>← Назад к статье</Text>
        </TouchableOpacity>
        <WebView source={{ uri: article.url }} style={styles.webView} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {article.urlToImage && (
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.meta}>
          <Text style={styles.source}>{article.source.name}</Text>
          <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
        </View>

        {article.author && (
          <Text style={styles.author}>By {article.author}</Text>
        )}

        {article.description && (
          <Text style={styles.description}>{article.description}</Text>
        )}

        {article.content && (
          <Text style={styles.articleContent}>
            {article.content.replace(/\[\+\d+ chars\]/, '')}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, favorite && styles.favoriteActive]}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.actionButtonText}>
              {favorite ? '⭐ Убрать из избранного' : '☆ В избранное'}
            </Text>
          </TouchableOpacity>

          {article.urlToImage && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadImage}
            >
              <Text style={styles.actionButtonText}>📥 Скачать изображение</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUploadFile}
          >
            <Text style={styles.actionButtonText}>📤 Выбрать файл</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.readMoreButton}
          onPress={() => setShowWebView(true)}
        >
          <Text style={styles.readMoreText}>Читать полную статью</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    lineHeight: 32,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  source: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  articleContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    marginBottom: 20,
  },
  actionButtons: {
    marginVertical: 20,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  favoriteActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  actionButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
  readMoreButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
