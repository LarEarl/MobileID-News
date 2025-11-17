import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Article } from '../types/news';
import { fetchTopHeadlines, searchNews, NewsFilters } from '../services/newsService';
import { NewsCard } from '../components/NewsCard';
import { SearchBar } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { FilterModal, FilterOptions } from '../components/FilterModal';
import { RootStackParamList } from '../navigation/types';

type NewsListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewsList'
>;

interface Props {
  navigation: NewsListScreenNavigationProp;
}

export const NewsListScreen: React.FC<Props> = ({ navigation }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<'network' | 'server' | 'notFound' | 'general' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    dateRange: 'all',
    sortBy: 'publishedAt',
  });

  const getDateRangeFilters = (range: FilterOptions['dateRange']): Pick<NewsFilters, 'fromDate' | 'toDate'> => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return {
          fromDate: today.toISOString(),
          toDate: now.toISOString(),
        };
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          fromDate: weekAgo.toISOString(),
          toDate: now.toISOString(),
        };
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return {
          fromDate: monthAgo.toISOString(),
          toDate: now.toISOString(),
        };
      default:
        return {};
    }
  };

  const loadNews = async (pageNum: number = 1, query: string = '') => {
    try {
      setError(null);
      const dateFilters = getDateRangeFilters(filters.dateRange);
      
      const response = query || filters.dateRange !== 'all'
        ? await searchNews(query || 'news', pageNum, {
            ...dateFilters,
            sortBy: filters.sortBy,
          })
        : await fetchTopHeadlines('', pageNum, filters.category);

      if (pageNum === 1) {
        setArticles(response.articles);
      } else {
        setArticles((prev) => [...prev, ...response.articles]);
      }
    } catch (err: any) {
      // Определяем тип ошибки
      let errorType: 'network' | 'server' | 'general' = 'general';
      
      if (err.message?.includes('Network') || err.code === 'ECONNABORTED') {
        errorType = 'network';
      } else if (err.response?.status >= 500) {
        errorType = 'server';
      }
      
      setError(errorType);
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadNews(1, searchQuery);
  }, [filters]);

  const handleSearch = () => {
    setLoading(true);
    setPage(1);
    loadNews(1, searchQuery);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadNews(1, searchQuery);
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sortBy !== 'publishedAt') count++;
    return count;
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNews(nextPage, searchQuery);
  };

  const handleArticlePress = (article: Article) => {
    navigation.navigate('ArticleDetail', { article });
  };

  if (loading && articles.length === 0) {
    return <LoadingSpinner message="Загрузка новостей..." overlay />;
  }

  if (error && articles.length === 0) {
    return <ErrorView errorType={error} onRetry={() => loadNews()} />;
  }

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={handleSearch}
      />
      
      {/* Кнопка фильтра */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          🔍 Фильтры
          {activeFiltersCount > 0 && (
            <Text style={styles.filterBadge}> ({activeFiltersCount})</Text>
          )}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={articles}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={({ item }) => (
          <NewsCard article={item} onPress={() => handleArticlePress(item)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Статьи не найдены</Text>
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filterBadge: {
    color: '#FFD700',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
