// ══════════════════════════════════════════════════
//  RÉSEAU — CallScreen (Appel audio Agora)
// ══════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { generateAgoraToken, logCompletedCall } from '@services/calls';
import { debitCredits } from '@services/payment';
import { COLORS, RADIUS } from '@constants/theme';
import { CREDITS_PER_MINUTE } from '@constants/config';

export default function CallScreen() {
  const { user, updateCredits } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const profile = route.params?.profile;

  const [status, setStatus]   = useState<'connecting' | 'active' | 'ended'>('connecting');
  const [muted, setMuted]     = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [credits, setCredits] = useState(user?.credits || 0);

  const t0Ref        = useRef<number>(Date.now());
  const timerRef     = useRef<NodeJS.Timeout | null>(null);
  const billingRef   = useRef<NodeJS.Timeout | null>(null);
  const engineRef    = useRef<any>(null); // RtcEngine instance

  useEffect(() => {
    initCall();
    return () => cleanup();
  }, []);

  async function initCall() {
    if (!user || !profile) return;

    // Vérifier les crédits avant de démarrer
    if (user.credits < CREDITS_PER_MINUTE) {
      Alert.alert(
        '💳 Crédits insuffisants',
        `Il faut au moins ${CREDITS_PER_MINUTE} crédits pour appeler.\nVous avez ${user.credits} crédit(s).`,
        [
          { text: 'Acheter des crédits', onPress: () => { navigation.goBack(); navigation.navigate('Credits'); } },
          { text: 'Annuler', onPress: () => navigation.goBack() },
        ]
      );
      return;
    }

    try {
      const channelName = `call_${user.id.slice(0, 8)}_${Date.now()}`;
      const uid = Math.floor(Math.random() * 99999);
      const token = await generateAgoraToken(channelName, uid);

      /*
       * ── Initialisation Agora (react-native-agora) ──
       *
       * import RtcEngine from 'react-native-agora';
       *
       * const engine = await RtcEngine.create(process.env.EXPO_PUBLIC_AGORA_APP_ID);
       * await engine.enableAudio();
       * await engine.setChannelProfile(0); // Communication
       * await engine.setClientRole(1);     // Broadcaster
       *
       * engine.addListener('UserOffline', () => endCall(true));
       * engine.addListener('JoinChannelSuccess', () => {
       *   setStatus('active');
       *   startBilling();
       * });
       *
       * await engine.joinChannel(token, channelName, null, uid);
       * engineRef.current = engine;
       */

      // ── SIMULATION pour tests sans react-native-agora installé ──
      setTimeout(() => {
        setStatus('active');
        startBilling();
      }, 1500);

    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de démarrer l\'appel : ' + e.message);
      navigation.goBack();
    }
  }

  function startBilling() {
    t0Ref.current = Date.now();

    // Timer UI
    timerRef.current = setInterval(() => {
      setSeconds(Math.floor((Date.now() - t0Ref.current) / 1000));
    }, 1000);

    // Débit crédits toutes les minutes
    billingRef.current = setInterval(async () => {
      if (!user) return;
      const newBalance = await debitCredits(user.id, CREDITS_PER_MINUTE);
      updateCredits(newBalance);
      setCredits(newBalance);
      if (newBalance < CREDITS_PER_MINUTE) {
        Alert.alert('⚠️ Crédits épuisés', 'Appel terminé — crédits insuffisants.');
        endCall(false);
      }
    }, 60000);
  }

  async function endCall(remote = false) {
    if (status === 'ended') return;
    setStatus('ended');
    cleanup();

    const dur = Math.floor((Date.now() - t0Ref.current) / 1000);
    const creditsUsed = Math.ceil(dur / 60) * CREDITS_PER_MINUTE;

    // Fermer Agora
    // await engineRef.current?.leaveChannel();
    // engineRef.current?.destroy();

    // Logger l'appel
    if (user && profile) {
      await logCompletedCall(user.id, profile.name, dur, creditsUsed).catch(() => {});
    }

    const mins = Math.floor(dur / 60);
    const secs = dur % 60;
    Alert.alert(
      remote ? '📵 Appel terminé' : '✅ Appel terminé',
      `Durée : ${mins}min ${secs}s\nCrédits débités : ${creditsUsed}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  }

  function cleanup() {
    if (timerRef.current)   clearInterval(timerRef.current);
    if (billingRef.current) clearInterval(billingRef.current);
  }

  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  if (!profile) return null;

  return (
    <LinearGradient colors={['rgba(10,5,25,0.97)', COLORS.dark3]} style={[styles.container, { paddingTop: insets.top }]}>
      {/* Status badge */}
      <View style={[styles.statusBadge, status === 'active' ? styles.statusActive : styles.statusConnecting]}>
        <Text style={[styles.statusText, { color: status === 'active' ? COLORS.green : COLORS.muted }]}>
          {status === 'connecting' ? '⏳ Connexion…' : status === 'active' ? '📞 Appel en cours…' : '📵 Terminé'}
        </Text>
      </View>

      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.url || '' }} style={styles.avatar} contentFit="cover" />
          {status === 'active' && (
            <View style={styles.pulseRing} />
          )}
        </View>
        <Text style={styles.calleeName}>{profile.name}</Text>
        <Text style={styles.calleeCity}>{profile.city || ''}</Text>
      </View>

      {/* Timer & credits */}
      <View style={styles.timerSection}>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>
        <Text style={styles.creditsInfo}>⚡ {credits} crédits · {CREDITS_PER_MINUTE} cr/min</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, muted && styles.ctrlBtnActive]}
          onPress={() => {
            setMuted(!muted);
            // engineRef.current?.muteLocalAudioStream(!muted);
          }}
        >
          <Text style={styles.ctrlIcon}>{muted ? '🔇' : '🎤'}</Text>
          <Text style={styles.ctrlLabel}>{muted ? 'Muet' : 'Micro'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.hangupBtn} onPress={() => endCall(false)}>
          <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.hangupGrad}>
            <Text style={styles.hangupIcon}>📵</Text>
            <Text style={styles.hangupLabel}>Raccrocher</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctrlBtn}>
          <Text style={styles.ctrlIcon}>🔊</Text>
          <Text style={styles.ctrlLabel}>Haut-parleur</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, alignItems: 'center', justifyContent: 'space-around', padding: 24 },
  statusBadge:     { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  statusActive:    { backgroundColor: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.4)' },
  statusConnecting:{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  statusText:      { fontSize: 12, fontWeight: '600' },
  profileSection:  { alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar:          { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.green },
  pulseRing:       { position: 'absolute', inset: -8, borderRadius: 58, borderWidth: 2, borderColor: 'rgba(34,197,94,0.35)' },
  calleeName:      { fontSize: 26, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 4 },
  calleeCity:      { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  timerSection:    { alignItems: 'center' },
  timer:           { fontSize: 42, fontWeight: '600', color: '#fff', fontVariant: ['tabular-nums'] },
  creditsInfo:     { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 6 },
  controls:        { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ctrlBtn:         { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: RADIUS.xl, padding: 16, width: 72 },
  ctrlBtnActive:   { backgroundColor: 'rgba(232,48,90,0.2)' },
  ctrlIcon:        { fontSize: 22, marginBottom: 4 },
  ctrlLabel:       { color: '#fff', fontSize: 10, fontWeight: '600' },
  hangupBtn:       { borderRadius: RADIUS.xl, overflow: 'hidden', width: 88 },
  hangupGrad:      { paddingVertical: 18, alignItems: 'center' },
  hangupIcon:      { fontSize: 26, marginBottom: 4 },
  hangupLabel:     { color: '#fff', fontSize: 10, fontWeight: '700' },
});
