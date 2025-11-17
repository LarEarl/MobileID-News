import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Alert, View, Text } from 'react-native';
import { NewsListScreen } from '../screens/NewsListScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { RootStackParamList } from './types';
import { getAuthState, logout } from '../services/authService';
import { registerForPushNotifications } from '../services/notificationService';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setupNotifications();
  }, []);

  const checkAuth = async () => {
    const authState = await getAuthState();
    setIsAuthenticated(authState.isAuthenticated);
    setLoading(false);
  };

  const setupNotifications = async () => {
    await registerForPushNotifications();
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setIsAuthenticated(false);
        },
      },
    ]);
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen
                {...props}
                onLoginSuccess={() => setIsAuthenticated(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="NewsList"
              component={NewsListScreen}
              options={({ navigation }) => ({
                title: 'News App',
                headerRight: () => (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Favorites')}
                      style={{ marginRight: 15 }}
                    >
                      <Text style={{ fontSize: 24 }}>⭐</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleLogout}
                      style={{ marginRight: 15 }}
                    >
                      <Text style={{ fontSize: 24 }}>🚪</Text>
                    </TouchableOpacity>
                  </View>
                ),
              })}
            />
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: 'Избранное' }}
            />
            <Stack.Screen
              name="ArticleDetail"
              component={ArticleDetailScreen}
              options={{ title: 'Статья' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
