import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text, Animated } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Загрузка новостей...',
  size = 'large',
  overlay = false,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const containerStyle = overlay
    ? [styles.container, styles.overlay]
    : styles.container;

  return (
    <View style={containerStyle}>
      <View style={styles.content}>
        <Animated.View style={[styles.circle, { transform: [{ scale: pulseAnim }] }]}>
          <ActivityIndicator size={size} color="#007AFF" />
        </Animated.View>
        <Text style={styles.text}>{message}</Text>
        <View style={styles.dotsContainer}>
          <Text style={styles.dots}>●●●</Text>
        </View>
      </View>
    </View>
  );
};

// Компактный спиннер для inline использования
export const InlineSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color="#007AFF" />
      {message && <Text style={styles.inlineText}>{message}</Text>}
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
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dotsContainer: {
    marginTop: 8,
  },
  dots: {
    fontSize: 20,
    color: '#007AFF',
    letterSpacing: 4,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  inlineText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});
