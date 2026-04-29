// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Messages (liste des conversations)
// ══════════════════════════════════════════════════
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { fetchConversations } from '@services/messages';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import type { Conversation } from '@/types';

export default function MessagesScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [convs, setConvs]     = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [user])
  );

  async function loadConversations() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchConversations(user.id);
      setConvs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function renderConv({ item }: { item: Conversation }) {
    const hasUnread = item.unread_count > 0;
    const timeStr = item.last_message_at
      ? new Date(item.last_message_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <TouchableOpacity
        style={[styles.convRow, hasUnread && styles.convRowUnread]}
        onPress={() => navigation.navigate('Chat', {
          otherUserId:    item.other_user_id,
          otherUserName:  item.other_user_name,
          otherUserPhoto: item.other_user_photo,
        })}
      >
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.other_user_photo }} style={styles.avatar} contentFit="cover" />
          <View style={[styles.onlineDot, { backgroundColor: COLORS.green }]} />
        </View>
        <View style={styles.convInfo}>
          <Text style={styles.convName}>{item.other_user_name}</Text>
          <Text style={styles.convPreview} numberOfLines={1}>{item.last_message || '…'}</Text>
        </View>
        <View style={styles.convRight}>
          <Text style={styles.convTime}>{timeStr}</Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient colors={[COLORS.dark, COLORS.dark3]} style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Messages</Text>
      {loading
        ? <ActivityIndicator color={COLORS.rose} style={{ marginTop: 40 }} />
        : <FlatList
            data={convs}
            keyExtractor={c => c.id}
            renderItem={renderConv}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>Aucune conversation pour l'instant.</Text>
                <Text style={styles.emptySubtext}>Swipez des profils pour commencer à discuter !</Text>
              </View>
            }
          />
      }
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  title:          { fontSize: 22, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', paddingHorizontal: SPACING.md, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  list:           { padding: SPACING.md, gap: 8 },
  convRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.lg, padding: 14 },
  convRowUnread:  { borderColor: 'rgba(232,48,90,0.18)', backgroundColor: 'rgba(232,48,90,0.04)' },
  avatarWrap:     { position: 'relative' },
  avatar:         { width: 48, height: 48, borderRadius: 24 },
  onlineDot:      { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, borderWidth: 2, borderColor: COLORS.dark },
  convInfo:       { flex: 1 },
  convName:       { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  convPreview:    { color: 'rgba(255,255,255,0.38)', fontSize: 12 },
  convRight:      { alignItems: 'flex-end', gap: 4 },
  convTime:       { color: 'rgba(255,255,255,0.22)', fontSize: 10 },
  unreadBadge:    { backgroundColor: COLORS.rose, borderRadius: 100, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  unreadText:     { color: '#fff', fontSize: 10, fontWeight: '800' },
  empty:          { alignItems: 'center', paddingTop: 60 },
  emptyEmoji:     { fontSize: 40, marginBottom: 12 },
  emptyText:      { color: '#fff', fontWeight: '600', fontSize: 16, marginBottom: 6 },
  emptySubtext:   { color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
