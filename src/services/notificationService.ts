import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@news_app_push_token';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Регистрация для push-уведомлений (только локальные в Expo Go)
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Запрашиваем разрешения на уведомления
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notifications permission not granted');
      return null;
    }

    // Настраиваем канал уведомлений для Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    console.log('✅ Local notifications configured successfully');
    return 'local-notifications-ready';
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return null;
  }
};

// Для production сборки (development build) используйте эту функцию:
export const registerForRemotePushNotifications = async (): Promise<string | null> => {
  try {
    // Эта функция работает только в development/production сборках, не в Expo Go
    // Раскомментируйте при создании нативной сборки:
    
    // const projectId = 'your-project-id'; // Получите из: eas project:info
    // const token = await Notifications.getExpoPushTokenAsync({ projectId });
    // await AsyncStorage.setItem(PUSH_TOKEN_KEY, token.data);
    // console.log('Push token:', token.data);
    // return token.data;
    
    console.log('Remote push requires development build');
    return null;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// Отправка локального уведомления
export const sendLocalNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Отправить немедленно
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

// Получить сохраненный push token
export const getSavedPushToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting saved push token:', error);
    return null;
  }
};
