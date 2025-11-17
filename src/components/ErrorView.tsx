import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  type?: 'network' | 'server' | 'notFound' | 'general';
  details?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  type = 'general',
  details,
}) => {
  const shakeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const getEmoji = () => {
    switch (type) {
      case 'network':
        return '📡';
      case 'server':
        return '🔧';
      case 'notFound':
        return '🔍';
      default:
        return '⚠️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Нет подключения';
      case 'server':
        return 'Ошибка сервера';
      case 'notFound':
        return 'Не найдено';
      default:
        return 'Ошибка';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.emoji}>{getEmoji()}</Text>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.message}>{message}</Text>
        {details && <Text style={styles.details}>{details}</Text>}
        
        {onRetry && (
          <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>🔄 Попробовать снова</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Советы:</Text>
          {type === 'network' && (
            <>
              <Text style={styles.tip}>• Проверьте подключение к интернету</Text>
              <Text style={styles.tip}>• Попробуйте переключить Wi-Fi/Мобильные данные</Text>
            </>
          )}
          {type === 'server' && (
            <>
              <Text style={styles.tip}>• Сервер временно недоступен</Text>
              <Text style={styles.tip}>• Попробуйте через несколько минут</Text>
            </>
          )}
          {type === 'notFound' && (
            <>
              <Text style={styles.tip}>• Попробуйте изменить поисковый запрос</Text>
              <Text style={styles.tip}>• Проверьте фильтры</Text>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

// Компактное отображение ошибки для inline использования
export const InlineError: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineEmoji}>⚠️</Text>
      <View style={styles.inlineContent}>
        <Text style={styles.inlineMessage}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.inlineRetry}>Повторить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  details: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    margin: 10,
  },
  inlineEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  inlineContent: {
    flex: 1,
  },
  inlineMessage: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  inlineRetry: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
