// ══════════════════════════════════════════════════
//  RÉSEAU — HistoryScreen (Likés / Matchs)
// ══════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { fetchMyHistory } from '@services/profiles';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import { AVATAR_FALLBACK } from '@constants/config';

export function HistoryScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [tab, setTab]       = useState<'liked' | 'matches'>('liked');
  const [liked, setLiked]   = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchMyHistory(user.id, user.prenom).then(({ liked, matches }) => {
      setLiked(liked); setMatches(matches);
    }).finally(() => setLoading(false));
  }, [user]);

  const data = tab === 'liked' ? liked : matches;

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.dark3]} style={[styles.hContainer, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.hTitle}>Historique</Text>
      <View style={styles.hTabs}>
        {[['liked', '❤️ Likés'], ['matches', '✨ Matchs']] .map(([t, label]) => (
          <TouchableOpacity key={t} style={[styles.hTab, tab === t && styles.hTabActive]} onPress={() => setTab(t as any)}>
            <Text style={[styles.hTabText, tab === t && styles.hTabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading
        ? <ActivityIndicator color={COLORS.rose} style={{ marginTop: 40 }} />
        : <FlatList
            data={data}
            numColumns={2}
            keyExtractor={(item, i) => i.toString()}
            columnWrapperStyle={{ gap: 10 }}
            contentContainerStyle={{ padding: SPACING.md, gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.hCard}>
                <Image source={{ uri: AVATAR_FALLBACK(item.to_user_name || item.from_name) }} style={styles.hCardImg} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(11,7,20,0.9)']} style={styles.hCardShade} />
                <View style={styles.hCardInfo}>
                  <Text style={styles.hCardName}>{item.to_user_name || item.from_name}</Text>
                </View>
                <View style={[styles.hBadge, tab === 'matches' ? styles.hBadgeMatch : styles.hBadgeLike]}>
                  <Text style={styles.hBadgeText}>{tab === 'matches' ? '✨ Match' : '❤️ Liké'}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.hEmpty}>
                <Text style={styles.hEmptyEmoji}>{tab === 'liked' ? '❤️' : '✨'}</Text>
                <Text style={styles.hEmptyText}>{tab === 'liked' ? 'Aucun profil liké' : 'Aucun match pour l\'instant'}</Text>
              </View>
            }
          />
      }
    </LinearGradient>
  );
}
export default HistoryScreen;

const styles = StyleSheet.create({
  hContainer:   { flex: 1 },
  hTitle:       { fontSize: 22, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', paddingHorizontal: SPACING.md, paddingBottom: 12 },
  hTabs:        { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: 8, marginBottom: 8 },
  hTab:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  hTabActive:   { borderColor: 'rgba(232,48,90,0.45)', backgroundColor: 'rgba(232,48,90,0.1)' },
  hTabText:     { color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: '600' },
  hTabTextActive:{ color: '#fff' },
  hCard:        { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden', aspectRatio: 3 / 4, position: 'relative' },
  hCardImg:     { ...StyleSheet.absoluteFillObject },
  hCardShade:   { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  hCardInfo:    { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 },
  hCardName:    { fontSize: 12, fontWeight: '700', color: '#fff' },
  hBadge:       { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  hBadgeLike:   { backgroundColor: 'rgba(232,48,90,0.8)' },
  hBadgeMatch:  { backgroundColor: 'rgba(212,168,67,0.8)' },
  hBadgeText:   { color: '#fff', fontSize: 9, fontWeight: '800' },
  hEmpty:       { alignItems: 'center', paddingTop: 60 },
  hEmptyEmoji:  { fontSize: 40, marginBottom: 12 },
  hEmptyText:   { color: COLORS.muted, fontSize: 14 },
});
