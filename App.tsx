// ══════════════════════════════════════════════════
//  RÉSEAU — Point d'entrée principal
// ══════════════════════════════════════════════════

import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Italic, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '@context/AuthContext';
import AppNavigator from '@navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [error, setError] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Italic,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0714', padding: 20, paddingTop: 60 }}>
        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          ERREUR AU DÉMARRAGE
        </Text>
        <ScrollView>
          <Text style={{ color: 'white', fontSize: 13 }}>{error}</Text>
        </ScrollView>
      </View>
    );
  }

  if (!fontsLoaded && !fontError) return null;

  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <StatusBar style="light" backgroundColor="#0B0714" />
            <AppNavigator />
            <NotificationHandler />
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  } catch (e: any) {
    setError(e?.message || String(e));
    return null;
  }
}

function NotificationHandler() {
  useEffect(() => {
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      console.log('[Push] Notification reçue:', data?.type);
    });
    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[Push] Tap sur notification:', data?.type);
    });
    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
  return null;
}