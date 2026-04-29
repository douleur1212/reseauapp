// ══════════════════════════════════════════════════
//  RÉSEAU — LandingScreen (page d'accueil publique)
// ══════════════════════════════════════════════════
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS } from '@constants/theme';

export function LandingScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={['#1a1230', '#0B0714']} style={[styles.lContainer, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.lScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.lHero}>
          <Text style={styles.lBadge}>✦ Rencontres authentiques</Text>
          <Text style={styles.lH1}>Trouvez l'amour{'\n'}<Text style={styles.lH1Accent}>authentique</Text></Text>
          <Text style={styles.lSub}>La plateforme de rencontres sérieuses pour la diaspora africaine et francophone.</Text>
          <TouchableOpacity style={styles.lPrimaryBtn} onPress={() => navigation.navigate('Register')}>
            <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.lBtnGrad}>
              <Text style={styles.lBtnText}>Commencer gratuitement ✦</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.lSecondaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.lSecondaryText}>Se connecter</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.lFeatures}>
          {[
            ['💬', 'Messagerie privée', 'Échangez en toute sécurité'],
            ['📞', 'Appels audio', 'Appelez vos matchs avec des crédits'],
            ['✦', 'Profils certifiés', 'Rencontrez des membres vérifiés'],
            ['🔒', '100% sécurisé', 'Vos données sont protégées'],
          ].map(([icon, title, desc]) => (
            <View key={title} style={styles.lFeature}>
              <View style={styles.lFeatureIcon}><Text style={{ fontSize: 22 }}>{icon}</Text></View>
              <Text style={styles.lFeatureTitle}>{title}</Text>
              <Text style={styles.lFeatureDesc}>{desc}</Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.lStats}>
          {[['1 200+', 'Membres'], ['87%', 'Matchs'], ['4.9★', 'Note']].map(([n, l]) => (
            <View key={l} style={styles.lStat}>
              <Text style={styles.lStatN}>{n}</Text>
              <Text style={styles.lStatL}>{l}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

export default LandingScreen;

// ══════════════════════════════════════════════════
//  RÉSEAU — ProfileDetailScreen (fiche profil modale)
// ══════════════════════════════════════════════════
export { default as ProfileDetailScreen } from './ProfileDetailScreenImpl';

const styles = StyleSheet.create({
  lContainer:  { flex: 1 },
  lScroll:     { padding: SPACING.xl, paddingBottom: 40 },
  lHero:       { alignItems: 'center', paddingVertical: SPACING.xl },
  lBadge:      { color: COLORS.rose, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, backgroundColor: 'rgba(232,48,90,0.08)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(232,48,90,0.2)' },
  lH1:         { fontSize: 40, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', textAlign: 'center', lineHeight: 46, marginBottom: 16 },
  lH1Accent:   { color: COLORS.rose, fontStyle: 'italic' },
  lSub:        { color: COLORS.muted, textAlign: 'center', lineHeight: 22, fontSize: 15, marginBottom: 28 },
  lPrimaryBtn: { width: '100%', borderRadius: 100, overflow: 'hidden', marginBottom: 12 },
  lBtnGrad:    { paddingVertical: 17, alignItems: 'center' },
  lBtnText:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  lSecondaryBtn:{ paddingVertical: 14, alignItems: 'center', width: '100%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 100 },
  lSecondaryText:{ color: COLORS.muted, fontSize: 14 },
  lFeatures:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  lFeature:    { width: '47%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 14 },
  lFeatureIcon:{ width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(232,48,90,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  lFeatureTitle:{ color: '#fff', fontWeight: '700', fontSize: 13, marginBottom: 4 },
  lFeatureDesc:{ color: COLORS.muted, fontSize: 11, lineHeight: 16 },
  lStats:      { flexDirection: 'row', backgroundColor: 'rgba(26,18,48,0.95)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, overflow: 'hidden' },
  lStat:       { flex: 1, alignItems: 'center', paddingVertical: 16 },
  lStatN:      { fontSize: 22, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold' },
  lStatL:      { fontSize: 11, color: COLORS.muted, marginTop: 2 },
});
