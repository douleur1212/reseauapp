// ══════════════════════════════════════════════════
//  RÉSEAU — ProfileDetailScreen
// ══════════════════════════════════════════════════
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { likeProfile } from '@services/profiles';
import { notifyMatch } from '@services/notifications';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import type { Profile } from '@/types';

const { width: W } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const profile: Profile = route.params?.profile;
  const [photoIdx, setPhotoIdx] = useState(0);

  const photos = profile?.photos?.length ? profile.photos : [profile?.url];

  async function handleLike() {
    if (!user || !profile) return;
    if (!user.sub) { navigation.navigate('Credits'); return; }
    try {
      const { isMatch } = await likeProfile(user.id, user.prenom, profile);
      if (isMatch) {
        await notifyMatch(profile.name);
        Alert.alert('✨ C\'est un Match !', `Vous et ${profile.name} vous êtes mutuellement likés !`);
      } else {
        Alert.alert('❤️', `Vous avez liké ${profile.name} !`);
      }
    } catch (e: any) { Alert.alert('Erreur', e.message); }
  }

  if (!profile) return null;

  return (
    <View style={[styles.pdContainer, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Photo gallery */}
        <View style={styles.pdPhotoWrap}>
          <Image source={{ uri: photos[photoIdx] }} style={styles.pdPhoto} contentFit="cover" />
          <LinearGradient colors={['transparent', 'rgba(11,7,20,0.97)']} style={styles.pdPhotoGrad} />
          {/* Photo dots */}
          {photos.length > 1 && (
            <View style={styles.pdDots}>
              {photos.map((_: any, i: number) => (
                <TouchableOpacity key={i} style={[styles.pdDot, photoIdx === i && styles.pdDotActive]} onPress={() => setPhotoIdx(i)} />
              ))}
            </View>
          )}
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.pdBack, { top: 16 }]}>
            <Text style={styles.pdBackText}>←</Text>
          </TouchableOpacity>
          {/* Name overlay */}
          <View style={styles.pdNameOverlay}>
            <View style={styles.pdNameRow}>
              <Text style={styles.pdName}>{profile.name}, {profile.age}</Text>
              {profile.certified && <Text style={styles.pdCert}>✦</Text>}
            </View>
            <Text style={styles.pdCity}>📍 {profile.city}, {profile.country}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.pdBody}>
          {profile.bio ? (
            <View style={styles.pdBioWrap}>
              <Text style={styles.pdBio}>{profile.bio}</Text>
            </View>
          ) : null}

          <View style={styles.pdGrid}>
            <View style={styles.pdGridItem}>
              <Text style={styles.pdGridLabel}>Cherche</Text>
              <Text style={styles.pdGridValue}>Relation sérieuse</Text>
            </View>
            <View style={styles.pdGridItem}>
              <Text style={styles.pdGridLabel}>Statut</Text>
              <Text style={[styles.pdGridValue, { color: profile.online ? COLORS.green : COLORS.muted }]}>
                {profile.online ? '● En ligne' : '○ Hors ligne'}
              </Text>
            </View>
          </View>

          {profile.langs.length > 0 && (
            <View style={styles.pdSection}>
              <Text style={styles.pdSectionTitle}>Langues</Text>
              <View style={styles.pdChips}>
                {profile.langs.map((l: string, i: number) => (
                  <View key={i} style={styles.pdChip}><Text style={styles.pdChipText}>🗣️ {l}</Text></View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={[styles.pdActions, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.pdBtnPass}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.pdBtnPassText}>✕ Passer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pdBtnMsg}
          onPress={() => {
            if (!user?.sub) { navigation.navigate('Credits'); return; }
            navigation.navigate('Chat', { otherUserId: profile.id, otherUserName: profile.name, otherUserPhoto: profile.url });
          }}
        >
          <Text style={styles.pdBtnMsgText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pdBtnLike} onPress={handleLike}>
          <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.pdBtnLikeGrad}>
            <Text style={styles.pdBtnLikeText}>❤️ Liker</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pdContainer:    { flex: 1, backgroundColor: COLORS.dark },
  pdPhotoWrap:    { position: 'relative', height: W * 1.2 },
  pdPhoto:        { ...StyleSheet.absoluteFillObject },
  pdPhotoGrad:    { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  pdDots:         { position: 'absolute', top: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  pdDot:          { width: 30, height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  pdDotActive:    { backgroundColor: '#fff' },
  pdBack:         { position: 'absolute', left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  pdBackText:     { color: '#fff', fontSize: 18 },
  pdNameOverlay:  { position: 'absolute', bottom: 20, left: 20, right: 20 },
  pdNameRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pdName:         { fontSize: 28, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  pdCert:         { color: COLORS.gold, fontSize: 18 },
  pdCity:         { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },
  pdBody:         { padding: SPACING.md, paddingBottom: 100 },
  pdBioWrap:      { backgroundColor: 'rgba(232,48,90,0.04)', borderLeftWidth: 3, borderLeftColor: COLORS.rose, borderRadius: RADIUS.sm, padding: 14, marginBottom: 16 },
  pdBio:          { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  pdGrid:         { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pdGridItem:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.md, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  pdGridLabel:    { fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  pdGridValue:    { color: '#fff', fontSize: 13, fontWeight: '500' },
  pdSection:      { marginBottom: 16 },
  pdSectionTitle: { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  pdChips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pdChip:         { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  pdChipText:     { color: COLORS.muted, fontSize: 12 },
  pdActions:      { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: SPACING.md, paddingTop: 14, backgroundColor: 'rgba(11,7,20,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  pdBtnPass:      { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1.5, borderColor: 'rgba(248,113,113,0.3)', borderRadius: RADIUS.md },
  pdBtnPassText:  { color: '#f87171', fontWeight: '700', fontSize: 14 },
  pdBtnMsg:       { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(106,180,255,0.1)', borderWidth: 1.5, borderColor: 'rgba(106,180,255,0.28)', borderRadius: RADIUS.md },
  pdBtnMsgText:   { color: COLORS.bleu, fontWeight: '700', fontSize: 14 },
  pdBtnLike:      { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  pdBtnLikeGrad:  { paddingVertical: 14, alignItems: 'center' },
  pdBtnLikeText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
});
