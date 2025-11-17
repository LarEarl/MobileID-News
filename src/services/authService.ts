/**
 * Сервис аутентификации
 * 
 * Управляет биометрической аутентификацией (Face ID / Touch ID / Fingerprint)
 * и сохранением состояния входа пользователя в приложение.
 * 
 * Используемые технологии:
 * - expo-local-authentication: биометрическая аутентификация
 * - AsyncStorage: постоянное хранение состояния авторизации
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

/** Ключ для хранения состояния аутентификации в AsyncStorage */
const AUTH_KEY = '@news_app_auth';

/**
 * Интерфейс состояния аутентификации
 */
export interface AuthState {
  /** Статус аутентификации пользователя */
  isAuthenticated: boolean;
  /** Включена ли биометрическая аутентификация */
  biometricsEnabled: boolean;
}

/**
 * Проверяет доступность биометрической аутентификации на устройстве
 * 
 * Проверяет:
 * - Наличие биометрического оборудования (сенсор отпечатков, Face ID камера)
 * - Наличие зарегистрированных биометрических данных
 * - Определяет тип биометрии (Face ID, Touch ID, Fingerprint)
 * 
 * @returns Promise с объектом:
 *   - available: true если биометрия доступна
 *   - biometryType: тип биометрии ('FaceID', 'TouchID', 'Biometrics')
 * 
 * @example
 * const { available, biometryType } = await checkBiometricsAvailability();
 * if (available) {
 *   console.log(`Доступна биометрия: ${biometryType}`);
 * }
 */
export const checkBiometricsAvailability = async (): Promise<{
  available: boolean;
  biometryType?: string;
}> => {
  try {
    // Проверяем наличие оборудования для биометрии
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    // Проверяем, что пользователь зарегистрировал биометрические данные
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const available = hasHardware && isEnrolled;
    
    if (available) {
      // Определяем тип поддерживаемой биометрии
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let biometryType = 'Biometrics';
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = 'FaceID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = 'TouchID';
      }
      
      return { available: true, biometryType };
    }
    
    return { available: false };
  } catch (error) {
    console.error('Biometrics check error:', error);
    return { available: false };
  }
};

/**
 * Выполняет биометрическую аутентификацию пользователя
 * 
 * Отображает системный диалог для подтверждения биометрии.
 * Поддерживает fallback на пароль устройства, если биометрия не сработала.
 * 
 * @returns Promise<boolean> - true если аутентификация успешна
 * 
 * @example
 * const success = await authenticateWithBiometrics();
 * if (success) {
 *   console.log('Пользователь аутентифицирован');
 * }
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Подтвердите вход',
      cancelLabel: 'Отмена',
      fallbackLabel: 'Использовать пароль',
      disableDeviceFallback: false, // Разрешаем fallback на PIN/пароль
    });
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Сохраняет состояние аутентификации в постоянное хранилище
 * 
 * Использует AsyncStorage для сохранения состояния между сессиями приложения.
 * 
 * @param state - Объект с состоянием аутентификации
 * 
 * @example
 * await saveAuthState({ isAuthenticated: true, biometricsEnabled: true });
 */
export const saveAuthState = async (state: AuthState): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Save auth state error:', error);
  }
};

/**
 * Получает сохраненное состояние аутентификации из хранилища
 * 
 * @returns Promise<AuthState> - Объект с состоянием аутентификации.
 *   Если данных нет, возвращает дефолтное состояние (не аутентифицирован).
 * 
 * @example
 * const authState = await getAuthState();
 * if (authState.isAuthenticated) {
 *   // Пользователь уже вошел
 * }
 */
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Get auth state error:', error);
  }
  // Возвращаем дефолтное состояние, если данных нет
  return { isAuthenticated: false, biometricsEnabled: false };
};

/**
 * Выполняет выход пользователя из системы
 * 
 * Сбрасывает состояние аутентификации в AsyncStorage.
 * После вызова этой функции пользователю потребуется снова войти в систему.
 * 
 * @example
 * await logout();
 * navigation.navigate('Login');
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ isAuthenticated: false, biometricsEnabled: false })
    );
  } catch (error) {
    console.error('Logout error:', error);
  }
};
