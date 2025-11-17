import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  checkBiometricsAvailability,
  authenticateWithBiometrics,
  saveAuthState,
} from '../services/authService';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string>('');

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const { available, biometryType } = await checkBiometricsAvailability();
    setBiometricsAvailable(available);
    setBiometryType(biometryType || '');
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const success = await authenticateWithBiometrics();
      
      if (success) {
        await saveAuthState({
          isAuthenticated: true,
          biometricsEnabled: true,
        });
        onLoginSuccess();
      } else {
        Alert.alert('Ошибка', 'Не удалось пройти биометрическую аутентификацию');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при аутентификации');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleLogin = async () => {
    setLoading(true);
    try {
      await saveAuthState({
        isAuthenticated: true,
        biometricsEnabled: false,
      });
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  const getBiometryLabel = () => {
    switch (biometryType) {
      case 'FaceID':
        return '🔐 Войти через Face ID';
      case 'TouchID':
      case 'Biometrics':
        return '🔐 Войти через отпечаток пальца';
      default:
        return '🔐 Войти через биометрию';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📰 NewsApp</Text>
        <Text style={styles.subtitle}>Добро пожаловать!</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            {biometricsAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
              >
                <Text style={styles.biometricButtonText}>
                  {getBiometryLabel()}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.simpleButton}
              onPress={handleSimpleLogin}
            >
              <Text style={styles.simpleButtonText}>
                {biometricsAvailable ? '👤 Войти без биометрии' : '👤 Войти'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 60,
  },
  biometricButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 280,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  biometricButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  simpleButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 280,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  simpleButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
