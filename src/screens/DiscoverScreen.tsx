// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Découvrir (Swipe)
// ══════════════════════════════════════════════════

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  ActivityIndicator, Alert, Animated, PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@context/AuthContext';
import { fetchProfiles, likeProfile } from '@services/profiles';
import { notifyMatch } from '@services/notifications';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import type { Profile } from '@/types';

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = W - 32;
const CARD_H = H * 0.62;
const SWIPE_THRESHOLD = 100;

export default function DiscoverScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [profiles, setProfiles]   = useState<Profile[]>([]);
  const [index, setIndex]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [matchProfile, setMatch]  = useState<Profile | null>(null);

  // Animation swipe
  const pan       = useRef(new Animated.ValueXY()).current;
  const rotation  = pan.x.interpolate({ inputRange: [-W, 0, W], outputRange: ['-20deg', '0deg', '20deg'] });
  const likeOpacity = pan.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchProfiles(user.id, { genre: user.genre === 'H' ? 'F' : 'H' });
      setProfiles(data.sort(() => Math.random() - 0.5));
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }

  const currentProfile = profiles[index];
  const nextProfile    = profiles[index + 1];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD)      { handleSwipe('right'); }
      else if (gesture.dx < -SWIPE_THRESHOLD){ handleSwipe('left'); }
      else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      }
    },
  });

  const handleSwipe = useCallback(async (dir: 'left' | 'right') => {
    if (!currentProfile || !user) return;

    const toX = dir === 'right' ? W * 1.5 : -W * 1.5;

    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      pan.setValue({ x: 0, y: 0 });
      setIndex(i => i + 1);
    });

    if (dir === 'right') {
      if (!user.sub) {
        navigation.navigate('Credits');
        return;
      }
      try {
        const { isMatch } = await likeProfile(user.id, user.prenom, currentProfile);
        if (isMatch) {
          setMatch(currentProfile);
          await notifyMatch(currentProfile.name);
        }
      } catch {}
    }
  }, [currentProfile, user, pan]);

  const handleSuperLike = useCallback(async () => {
    if (!currentProfile || !user) return;
    if (!user.sub) { navigation.navigate('Credits'); return; }
    await likeProfile(user.id, user.prenom, currentProfile, true);
    handleSwipe('right');
  }, [currentProfile, user, handleSwipe]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.rose} size="large" />
        <Text style={styles.loadingText}>Chargement des profils…</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <LinearGradient colors={[COLORS.dark, COLORS.dark3]} style={[styles.container, styles.center]}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyTitle}>Vous avez tout vu !</Text>
        <Text style={styles.emptyText}>Revenez demain pour de nouveaux profils.</Text>
        <TouchableOpacity style={styles.reloadBtn} onPress={() => { setIndex(0); loadProfiles(); }}>
          <Text style={styles.reloadBtnText}>🔄 Recommencer</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.dark3, COLORS.dark]} style={[styles.container, { paddingTop: insets.top + 8 }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Réseau</Text>
        <View style={styles.headerRight}>
          <View style={[styles.creditBadge, { opacity: user?.sub ? 1 : 0.5 }]}>
            <Text style={styles.creditText}>⚡ {user?.credits || 0}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Credits')} style={styles.premiumBtn}>
            <Text style={styles.premiumText}>{user?.sub ? '✦ Pro' : '✦ Premium'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card stack */}
      <View style={styles.deckContainer}>
        {/* Next card (behind) */}
        {nextProfile && (
          <View style={[styles.card, styles.cardBehind]}>
            <Image source={{ uri: nextProfile.url }} style={styles.cardPhoto} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(11,7,20,0.97)']} style={styles.cardGradient} />
          </View>
        )}

        {/* Current card (swipeable) */}
        <Animated.View
          style={[styles.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: rotation }] }]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: currentProfile.url }} style={styles.cardPhoto} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(11,7,20,0.97)']} style={styles.cardGradient} />

          {/* LIKE label */}
          <Animated.View style={[styles.swipeLabel, styles.likeLabel, { opacity: likeOpacity }]}>
            <Text style={[styles.swipeLabelText, { color: COLORS.green, borderColor: COLORS.green }]}>LIKE</Text>
          </Animated.View>

          {/* NOPE label */}
          <Animated.View style={[styles.swipeLabel, styles.nopeLabel, { opacity: nopeOpacity }]}>
            <Text style={[styles.swipeLabelText, { color: COLORS.rose, borderColor: COLORS.rose }]}>NOPE</Text>
          </Animated.View>

          {/* Card info */}
          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
              {currentProfile.certified && <Text style={styles.certBadge}>✦</Text>}
            </View>
            <View style={styles.cardMeta}>
              <View style={[styles.onlineDot, { backgroundColor: currentProfile.online ? COLORS.green : '#666' }]} />
              <Text style={styles.cardCity}>{currentProfile.city}, {currentProfile.country}</Text>
            </View>
            {currentProfile.bio ? (
              <Text style={styles.cardBio} numberOfLines={2}>{currentProfile.bio}</Text>
            ) : null}
          </View>

          {/* Open profile button */}
          <TouchableOpacity
            style={styles.openProfileBtn}
            onPress={() => navigation.navigate('ProfileDetail', { profile: currentProfile })}
          >
            <Text style={styles.openProfileText}>Voir le profil →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.btnPass]} onPress={() => handleSwipe('left')}>
          <Text style={styles.actionBtnText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.btnStar]} onPress={handleSuperLike}>
          <Text style={styles.actionBtnText}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.btnLike]} onPress={() => handleSwipe('right')}>
          <Text style={styles.actionBtnText}>❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.btnMsg]}
          onPress={() => {
            if (!user?.sub) { navigation.navigate('Credits'); return; }
            navigation.navigate('Chat', {
              otherUserId:   currentProfile.id,
              otherUserName: currentProfile.name,
              otherUserPhoto: currentProfile.url,
            });
          }}
        >
          <Text style={styles.actionBtnText}>💬</Text>
        </TouchableOpacity>
      </View>

      {/* Match Modal */}
      {matchProfile && (
        <View style={styles.matchOverlay}>
          <LinearGradient colors={['rgba(11,7,20,0.95)', COLORS.dark3]} style={styles.matchCard}>
            <Text style={styles.matchTitle}>✨ C'est un Match !</Text>
            <Image source={{ uri: matchProfile.url }} style={styles.matchPhoto} contentFit="cover" />
            <Text style={styles.matchName}>{matchProfile.name}</Text>
            <TouchableOpacity
              style={styles.matchMsgBtn}
              onPress={() => {
                setMatch(null);
                navigation.navigate('Chat', {
                  otherUserId:    matchProfile.id,
                  otherUserName:  matchProfile.name,
                  otherUserPhoto: matchProfile.url,
                });
              }}
            >
              <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.matchMsgBtnInner}>
                <Text style={styles.matchMsgBtnText}>💬 Envoyer un message</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatch(null)}>
              <Text style={styles.matchClose}>Continuer à swiper</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  center:       { alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  logo:         { fontSize: 22, color: COLORS.rose, fontFamily: 'PlayfairDisplay_700Bold' },
  headerRight:  { flexDirection: 'row', gap: 8, alignItems: 'center' },
  creditBadge:  { backgroundColor: 'rgba(106,180,255,0.12)', borderColor: 'rgba(106,180,255,0.3)', borderWidth: 1, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  creditText:   { color: COLORS.bleu, fontSize: 12, fontWeight: '700' },
  premiumBtn:   { backgroundColor: 'rgba(232,48,90,0.1)', borderColor: 'rgba(232,48,90,0.3)', borderWidth: 1, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  premiumText:  { color: COLORS.rose, fontSize: 12, fontWeight: '700' },

  deckContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card:          { position: 'absolute', width: CARD_W, height: CARD_H, borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: COLORS.dark3 },
  cardBehind:    { transform: [{ scale: 0.96 }, { translateY: 10 }], zIndex: 0 },
  cardPhoto:     { ...StyleSheet.absoluteFillObject },
  cardGradient:  { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  cardInfo:      { position: 'absolute', bottom: 52, left: 16, right: 16 },
  cardNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName:      { fontSize: 24, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  certBadge:     { color: COLORS.gold, fontSize: 16 },
  cardMeta:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot:     { width: 7, height: 7, borderRadius: 4 },
  cardCity:      { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  cardBio:       { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  openProfileBtn:{ position: 'absolute', bottom: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  openProfileText:{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },

  swipeLabel:    { position: 'absolute', top: 24 },
  likeLabel:     { left: 20, transform: [{ rotate: '-15deg' }] },
  nopeLabel:     { right: 20, transform: [{ rotate: '15deg' }] },
  swipeLabelText:{ fontSize: 22, fontWeight: '900', borderWidth: 3, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, letterSpacing: 2 },

  actions:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 24 },
  actionBtn:     { borderRadius: 50, borderWidth: 2, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(11,7,20,0.9)' },
  actionBtnText: { fontSize: 22 },
  btnPass:       { borderColor: 'rgba(248,113,113,0.4)', width: 52, height: 52 },
  btnStar:       { borderColor: 'rgba(212,168,67,0.4)', width: 46, height: 46 },
  btnLike:       { borderColor: 'rgba(232,48,90,0.55)', width: 64, height: 64, backgroundColor: 'rgba(232,48,90,0.09)' },
  btnMsg:        { borderColor: 'rgba(106,180,255,0.4)', width: 46, height: 46 },

  loadingText:   { color: COLORS.muted, marginTop: 12, fontSize: 14 },
  emptyEmoji:    { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptyText:     { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  reloadBtn:     { backgroundColor: 'rgba(232,48,90,0.15)', borderColor: 'rgba(232,48,90,0.4)', borderWidth: 1, borderRadius: 100, paddingHorizontal: 24, paddingVertical: 12 },
  reloadBtnText: { color: COLORS.rose, fontWeight: '600' },

  matchOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,5,20,0.93)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  matchCard:     { width: W * 0.85, borderRadius: RADIUS.xl, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(232,48,90,0.3)' },
  matchTitle:    { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 20, fontFamily: 'PlayfairDisplay_700Bold' },
  matchPhoto:    { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  matchName:     { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 24 },
  matchMsgBtn:   { width: '100%', borderRadius: 100, overflow: 'hidden', marginBottom: 12 },
  matchMsgBtnInner: { paddingVertical: 14, alignItems: 'center' },
  matchMsgBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  matchClose:    { color: COLORS.muted, fontSize: 13, paddingVertical: 8 },
});
