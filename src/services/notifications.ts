// ══════════════════════════════════════════════════
//  RÉSEAU — Service Notifications Push
//  Résout le problème d'absence de notifications
//  dans l'app originale
// ══════════════════════════════════════════════════

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import supabase from './supabase';
import { TABLES } from '@constants/config';

// ── Configuration des notifications ───────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Enregistrer le device pour les push ───────────
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications nécessitent un vrai appareil.');
    return null;
  }

  // Demander la permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission notifications refusée.');
    return null;
  }

  // Configuration Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Réseau',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8305A',
    });

    await Notifications.setNotificationChannelAsync('calls', {
      name: 'Appels entrants',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#22c55e',
      sound: 'default',
    });
  }

  // Obtenir le token Expo Push
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  // Sauvegarder le token dans Supabase
  await supabase
    .from(TABLES.MEMBRES)
    .update({ push_token: token, push_platform: Platform.OS })
    .eq('id', userId);

  return token;
}

// ── Envoyer une notification locale ───────────────
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: object,
  channelId = 'default'
) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: 'default' },
    trigger: null, // Immédiat
  });
}

// ── Notification de match ─────────────────────────
export async function notifyMatch(matchName: string) {
  await sendLocalNotification(
    '💕 Nouveau match !',
    `Vous et ${matchName} vous êtes mutuellement likés !`,
    { type: 'match', name: matchName }
  );
}

// ── Notification de nouveau message ───────────────
export async function notifyNewMessage(fromName: string, preview: string) {
  await sendLocalNotification(
    `💬 ${fromName}`,
    preview,
    { type: 'message', from: fromName }
  );
}

// ── Notification d'appel entrant ──────────────────
export async function notifyIncomingCallLocal(callerName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📞 Appel entrant',
      body:  `${callerName} vous appelle…`,
      data:  { type: 'call', from: callerName },
      sound: 'default',
    },
    trigger: null,
  });
}

// ── Listener pour les notifications reçues ────────
export function addNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

// ── Listener pour les interactions (tap) ──────────
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ── Effacer le badge ──────────────────────────────
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}
