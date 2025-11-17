import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';

export interface FilterOptions {
  category: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'publishedAt' | 'relevancy' | 'popularity';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'business', label: 'Бизнес' },
  { id: 'entertainment', label: 'Развлечения' },
  { id: 'general', label: 'Общие' },
  { id: 'health', label: 'Здоровье' },
  { id: 'science', label: 'Наука' },
  { id: 'sports', label: 'Спорт' },
  { id: 'technology', label: 'Технологии' },
];

const DATE_RANGES = [
  { id: 'all', label: 'Все время' },
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: 'За неделю' },
  { id: 'month', label: 'За месяц' },
];

const SORT_OPTIONS = [
  { id: 'publishedAt', label: 'По дате' },
  { id: 'relevancy', label: 'По релевантности' },
  { id: 'popularity', label: 'По популярности' },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      category: 'all',
      dateRange: 'all',
      sortBy: 'publishedAt',
    };
    setFilters(defaultFilters);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Фильтры</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            {/* Категории */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Категория</Text>
              <View style={styles.optionsGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.optionButton,
                      filters.category === cat.id && styles.optionButtonActive,
                    ]}
                    onPress={() => setFilters({ ...filters, category: cat.id })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.category === cat.id && styles.optionTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Период */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Период</Text>
              <View style={styles.optionsGrid}>
                {DATE_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.id}
                    style={[
                      styles.optionButton,
                      filters.dateRange === range.id && styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        dateRange: range.id as FilterOptions['dateRange'],
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.dateRange === range.id && styles.optionTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Сортировка */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Сортировка</Text>
              <View style={styles.optionsGrid}>
                {SORT_OPTIONS.map((sort) => (
                  <TouchableOpacity
                    key={sort.id}
                    style={[
                      styles.optionButton,
                      filters.sortBy === sort.id && styles.optionButtonActive,
                    ]}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        sortBy: sort.id as FilterOptions['sortBy'],
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.sortBy === sort.id && styles.optionTextActive,
                      ]}
                    >
                      {sort.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#FFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
