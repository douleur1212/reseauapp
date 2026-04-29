// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Chat (messagerie temps réel)
// ══════════════════════════════════════════════════

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@context/AuthContext';
import {
  fetchMessages, sendMessage,
  getOrCreateConversation, subscribeToMessages, markAsRead,
} from '@services/messages';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import type { Message } from '@/types';

export default function ChatScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const insets     = useSafeAreaInsets();
  const { otherUserId, otherUserName, otherUserPhoto } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [convId,   setConvId]   = useState<string | null>(null);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    initConversation();
  }, []);

  async function initConversation() {
    if (!user) return;
    try {
      const id = await getOrCreateConversation(
        user.id, user.prenom, otherUserId, otherUserName, otherUserPhoto
      );
      setConvId(id);
      const msgs = await fetchMessages(id);
      setMessages(msgs);
      await markAsRead(id, user.id);
    } catch (e: any) {
      console.error('Chat init error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  // Temps réel
  useEffect(() => {
    if (!convId) return;
    const channel = subscribeToMessages(convId, (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
      if (newMsg.recipient_id === user?.id) {
        markAsRead(convId, user!.id);
      }
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => { supabase.removeChannel(channel); };
  }, [convId]);

  const handleSend = useCallback(async () => {
    if (!text.trim() || !convId || !user || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      await sendMessage(convId, user.id, user.prenom, otherUserId, content);
    } catch (e: any) {
      console.error('Send error:', e.message);
      setText(content); // Restore on error
    } finally {
      setSending(false);
    }
  }, [text, convId, user, otherUserId, sending]);

  function renderMessage({ item }: { item: Message }) {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.content}
          </Text>
          <Text style={styles.bubbleTime}>
            {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.dark }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <LinearGradient
        colors={['rgba(11,7,20,0.98)', 'rgba(11,7,20,0.9)']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Image source={{ uri: otherUserPhoto }} style={styles.headerAvatar} contentFit="cover" />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerStatus}>🟢 En ligne</Text>
        </View>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => navigation.navigate('Call', { profile: { name: otherUserName, url: otherUserPhoto, id: otherUserId } })}
        >
          <Text style={styles.callBtnText}>📞</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.rose} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>💌</Text>
              <Text style={styles.emptyChatText}>Dites bonjour à {otherUserName} !</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Votre message…"
          placeholderTextColor={COLORS.muted}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.sendBtnGrad}>
            {sending
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.sendBtnText}>➤</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Supabase import needed for channel cleanup
import supabase from '@services/supabase';

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  backBtn:       { marginRight: 8, padding: 4 },
  backText:      { color: 'rgba(255,255,255,0.5)', fontSize: 22 },
  headerAvatar:  { width: 38, height: 38, borderRadius: 19, marginRight: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  headerInfo:    { flex: 1 },
  headerName:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerStatus:  { color: COLORS.green, fontSize: 11, marginTop: 1 },
  callBtn:       { backgroundColor: 'rgba(34,197,94,0.12)', borderRadius: 100, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  callBtnText:   { fontSize: 16 },

  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messagesList:  { padding: 16, paddingBottom: 8 },

  bubbleRow:     { marginBottom: 8 },
  bubbleRowMe:   { alignItems: 'flex-end' },
  bubbleRowThem: { alignItems: 'flex-start' },
  bubble:        { maxWidth: '72%', borderRadius: 18, padding: 10 },
  bubbleMe:      { backgroundColor: COLORS.rose, borderBottomRightRadius: 4 },
  bubbleThem:    { backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  bubbleText:    { fontSize: 14, lineHeight: 20 },
  bubbleTextMe:  { color: '#fff' },
  bubbleTextThem:{ color: 'rgba(255,255,255,0.9)' },
  bubbleTime:    { fontSize: 9, opacity: 0.4, marginTop: 4, alignSelf: 'flex-end' },

  emptyChat:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyChatEmoji:{ fontSize: 40, marginBottom: 12 },
  emptyChatText: { color: COLORS.muted, fontSize: 14 },

  inputRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(11,7,20,0.98)' },
  input:         { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 100, color: '#fff', paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn:       { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  sendBtnDisabled:{ opacity: 0.4 },
  sendBtnGrad:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
});
