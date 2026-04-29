// ══════════════════════════════════════════════════
//  RÉSEAU — Navigation principale
// ══════════════════════════════════════════════════

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import * as Linking from 'expo-linking';

import { useAuth } from '@context/AuthContext';
import { COLORS } from '@constants/theme';

// Screens
import DiscoverScreen   from '@screens/DiscoverScreen';
import MessagesScreen   from '@screens/MessagesScreen';
import ChatScreen       from '@screens/ChatScreen';
import HistoryScreen    from '@screens/HistoryScreen';
import ProfileScreen    from '@screens/ProfileScreen';
import LandingScreen    from '@screens/LandingScreen';
import LoginScreen      from '@screens/LoginScreen';
import RegisterScreen   from '@screens/RegisterScreen';
import CreditsScreen    from '@screens/CreditsScreen';
import ProfileDetailScreen from '@screens/ProfileDetailScreen';
import CallScreen       from '@screens/CallScreen';

// ── Deep linking config ───────────────────────────
const prefix = Linking.createURL('/');
const linkingConfig = {
  prefixes: [prefix, 'reseau://', 'https://reseau.website'],
  config: {
    screens: {
      Main: {
        screens: {
          Discover:  'discover',
          Messages:  'messages',
          History:   'history',
          Profile:   'profile',
        },
      },
      Credits: 'credits',
      Chat:    'chat/:conversationId',
      Call:    'call',
      'payment/return': 'payment/return',
    },
  },
};

const Stack  = createNativeStackNavigator();
const Tab    = createBottomTabNavigator();

// ── Icônes Tab Bar ────────────────────────────────
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Discover: '🔥',
    Messages: '💬',
    History:  '⭐',
    Profile:  '👤',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {icons[name]}
      </Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

// ── Bottom Tab Navigator ──────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:     false,
        tabBarStyle:     styles.tabBar,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor:   COLORS.rose,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen}  options={{ tabBarLabel: 'Découvrir' }} />
      <Tab.Screen name="Messages" component={MessagesScreen}  options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="History"  component={HistoryScreen}   options={{ tabBarLabel: 'Historique' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}   options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>Réseau</Text>
        <ActivityIndicator color={COLORS.rose} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth flow
          <>
            <Stack.Screen name="Landing"  component={LandingScreen} />
            <Stack.Screen name="Login"    component={LoginScreen}
              options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="Register" component={RegisterScreen}
              options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          // App flow
          <>
            <Stack.Screen name="Main"          component={MainTabs} />
            <Stack.Screen name="Credits"       component={CreditsScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="Chat"          component={ChatScreen}
              options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="Call"          component={CallScreen}
              options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: COLORS.rose,
  },
  tabBar: {
    backgroundColor: COLORS.dark,
    borderTopColor:  'rgba(255,255,255,0.07)',
    borderTopWidth:  1,
    height:          60,
    paddingBottom:   8,
    paddingTop:      4,
  },
  tabLabel: {
    fontSize:   9,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tabIcon: {
    alignItems:  'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
    opacity:  0.5,
  },
  tabEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabDot: {
    position:        'absolute',
    bottom:          -6,
    width:           20,
    height:          2,
    borderRadius:    2,
    backgroundColor: COLORS.rose,
  },
});
