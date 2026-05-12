// ══════════════════════════════════════════════════
//  RÉSEAU — Point d'entrée principal
// ══════════════════════════════════════════════════

import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_400Italic, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from '@context/AuthContext';
import AppNavigator from '@navigation/AppNavigator';

// Garder le splash screen visible pendant le chargement
SplashScreen.preventAutoHideAsync();

export default function App() {
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
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
}

// ── Gestionnaire de notifications ─────────────────
function NotificationHandler() {
  useEffect(() => {
    // Notification reçue en foreground
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      console.log('[Push] Notification reçue:', data?.type);
    });

    // Tap sur une notification
    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('[Push] Tap sur notification:', data?.type);
      // Navigation selon le type :
      // if (data?.type === 'message') navigation.navigate('Chat', { ... })
      // if (data?.type === 'match')   navigation.navigate('History')
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return null;
}
