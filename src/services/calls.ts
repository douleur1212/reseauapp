// ══════════════════════════════════════════════════
//  RÉSEAU — Service Appels Audio (Agora)
//  Note: Utilise react-native-agora au lieu du SDK web
// ══════════════════════════════════════════════════

import supabase from './supabase';
import { debitCredits } from './payment';
import { TABLES, CREDITS_PER_MINUTE } from '@constants/config';

const AGORA_APP_ID  = process.env.EXPO_PUBLIC_AGORA_APP_ID!;
const TOKEN_URL     = process.env.EXPO_PUBLIC_AGORA_TOKEN_URL!;
const SUPA_KEY      = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// ── Générer un token Agora via Supabase Edge Function ──
export async function generateAgoraToken(channelName: string, uid: number): Promise<string> {
  const resp = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${SUPA_KEY}`,
    },
    body: JSON.stringify({ channelName, uid, role: 1 }),
  });

  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data.token;
}

// ── Enregistrer un appel terminé ──────────────────
export async function logCompletedCall(
  fromUserId: string,
  toName: string,
  durationSeconds: number,
  creditsDebited: number
) {
  await supabase.from(TABLES.APPELS).insert({
    from_user:        fromUserId,
    to_name:          toName,
    duration_seconds: durationSeconds,
    credits_debited:  creditsDebited,
    created_at:       new Date().toISOString(),
  });
}

// ── Notifier un appel entrant ─────────────────────
export async function notifyIncomingCall(
  fromUserId: string,
  fromName: string,
  toName: string,
  channelName: string,
  uid: number
) {
  await supabase.from(TABLES.APPELS_ENTRANTS).insert({
    from_user:  fromUserId,
    from_name:  fromName,
    to_name:    toName,
    channel:    channelName,
    uid,
    status:     'ringing',
    created_at: new Date().toISOString(),
  });
}

// ── Écouter les appels entrants ───────────────────
export function subscribeToIncomingCalls(
  myPrenom: string,
  onCall: (call: any) => void
) {
  return supabase
    .channel(`incoming-calls:${myPrenom}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  TABLES.APPELS_ENTRANTS,
        filter: `to_name=eq.${myPrenom}`,
      },
      (payload) => {
        if (payload.new?.status === 'ringing') {
          onCall(payload.new);
        }
      }
    )
    .subscribe();
}

// ── Infos de configuration Agora ─────────────────
export function getAgoraConfig() {
  return {
    appId:          AGORA_APP_ID,
    channelProfile: 0, // Communication
    clientRole:     1, // Broadcaster
  };
}

/*
 ══════════════════════════════════════════════════
  INSTRUCTIONS D'INSTALLATION react-native-agora
 ══════════════════════════════════════════════════

  1. Installer le package :
     npm install react-native-agora

  2. Pour iOS, ajouter dans ios/Podfile :
     pod 'AgoraRtcEngine_iOS'

  3. Pour Android, dans android/build.gradle :
     maven { url "https://www.jitpack.io" }

  4. Utilisation dans le composant CallScreen :

  import RtcEngine, { RtcLocalView, RtcRemoteView } from 'react-native-agora';

  const engine = await RtcEngine.create(AGORA_APP_ID);
  await engine.enableAudio();
  await engine.setChannelProfile(0);
  await engine.setClientRole(1);

  engine.addListener('UserOffline', () => endCall());

  await engine.joinChannel(token, channelName, null, uid);
  // Pour quitter :
  await engine.leaveChannel();
  engine.destroy();

 ══════════════════════════════════════════════════
*/
