// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Mon Profil
// ══════════════════════════════════════════════════
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { logout } from '@services/auth';
import { COLORS, SPACING, RADIUS } from '@constants/theme';

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion', style: 'destructive',
        onPress: async () => { try { await logout(); } catch (e: any) { Alert.alert('Erreur', e.message); } }
      },
    ]);
  }

  if (!user) return null;

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.dark3]} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={[COLORS.dark2, COLORS.dark3]} style={styles.heroBg}>
            <Image source={{ uri: user.photo || `https://api.dicebear.com/8.x/personas/svg?seed=${user.prenom}` }} style={styles.heroImg} contentFit="cover" />
          </LinearGradient>
          <View style={styles.heroInfo}>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroName}>{user.prenom} {user.nom}</Text>
              {user.certified && <Text style={styles.certStar}>✦</Text>}
            </View>
            <Text style={styles.heroSub}>{user.city}{user.country ? ', ' + user.country : ''}</Text>
            <View style={[styles.subBadge, user.sub ? styles.subBadgePro : styles.subBadgeFree]}>
              <Text style={[styles.subBadgeText, user.sub ? styles.subBadgeTextPro : styles.subBadgeTextFree]}>
                {user.sub ? '✦ Premium' : 'Compte Gratuit'}
              </Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.creditsCard}>
          <View>
            <Text style={styles.creditsLabel}>Crédits disponibles</Text>
            <Text style={styles.creditsValue}>⚡ {user.credits} crédits</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Credits')} style={styles.buyBtn}>
            <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.buyBtnGrad}>
              <Text style={styles.buyBtnText}>{user.sub ? 'Gérer' : 'Acheter'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        {user.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        ) : null}

        {/* Langues */}
        {user.langs && user.langs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Langues</Text>
            <View style={styles.chips}>
              {user.langs.map((l: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>🗣️ {l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!user.sub && (
            <TouchableOpacity style={styles.premiumBtn} onPress={() => navigation.navigate('Credits')}>
              <LinearGradient colors={[COLORS.gold, '#e6a817']} style={styles.premiumBtnGrad}>
                <Text style={styles.premiumBtnText}>👑 Passer Premium</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  scroll:         { padding: SPACING.md, paddingBottom: 40 },
  hero:           { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  heroBg:         { position: 'relative' },
  heroImg:        { width: '100%', height: 200 },
  heroInfo:       { padding: 16 },
  heroNameRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  heroName:       { fontSize: 22, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  certStar:       { color: COLORS.gold, fontSize: 16 },
  heroSub:        { color: COLORS.muted, fontSize: 13, marginBottom: 10 },
  subBadge:       { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  subBadgePro:    { backgroundColor: 'rgba(212,168,67,0.15)', borderColor: 'rgba(212,168,67,0.4)' },
  subBadgeFree:   { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' },
  subBadgeText:   { fontSize: 11, fontWeight: '700' },
  subBadgeTextPro:{ color: COLORS.gold },
  subBadgeTextFree:{ color: COLORS.muted },
  creditsCard:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16 },
  creditsLabel:   { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  creditsValue:   { color: COLORS.bleu, fontWeight: '700', fontSize: 18 },
  buyBtn:         { borderRadius: 100, overflow: 'hidden' },
  buyBtnGrad:     { paddingHorizontal: 20, paddingVertical: 10 },
  buyBtnText:     { color: '#fff', fontWeight: '700', fontSize: 13 },
  section:        { marginBottom: 16 },
  sectionTitle:   { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  bioText:        { color: 'rgba(255,255,255,0.7)', lineHeight: 20, fontSize: 14 },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  chipText:       { color: COLORS.muted, fontSize: 12 },
  actions:        { gap: 10, marginTop: 8 },
  premiumBtn:     { borderRadius: 100, overflow: 'hidden' },
  premiumBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  premiumBtnText: { color: '#1a1230', fontWeight: '800', fontSize: 15 },
  logoutBtn:      { paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100 },
  logoutText:     { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
});
