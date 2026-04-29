// ══════════════════════════════════════════════════
//  RÉSEAU — Service Messagerie temps réel
// ══════════════════════════════════════════════════

import supabase from './supabase';
import { TABLES } from '@constants/config';
import type { Message, Conversation } from '@/types';

// ── Charger les conversations ──────────────────────
export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from(TABLES.CONVERSATIONS)
    .select(`
      id,
      other_user_id,
      other_user_name,
      other_user_photo,
      last_message,
      last_message_at,
      unread_count
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

// ── Charger les messages d'une conversation ────────
export async function fetchMessages(
  conversationId: string,
  limit = 50
): Promise<Message[]> {
  const { data, error } = await supabase
    .from(TABLES.MESSAGES)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).reverse();
}

// ── Envoyer un message ─────────────────────────────
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  recipientId: string,
  content: string
): Promise<Message> {
  const msg = {
    conversation_id: conversationId,
    sender_id:       senderId,
    sender_name:     senderName,
    recipient_id:    recipientId,
    content,
    read:            false,
    created_at:      new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLES.MESSAGES)
    .insert(msg)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Mettre à jour la conversation
  await supabase
    .from(TABLES.CONVERSATIONS)
    .update({
      last_message:    content,
      last_message_at: msg.created_at,
    })
    .eq('id', conversationId);

  return data;
}

// ── Créer ou récupérer une conversation ───────────
export async function getOrCreateConversation(
  userId: string,
  userName: string,
  otherUserId: string,
  otherUserName: string,
  otherUserPhoto?: string
): Promise<string> {
  // Chercher une conversation existante
  const { data: existing } = await supabase
    .from(TABLES.CONVERSATIONS)
    .select('id')
    .or(
      `and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),` +
      `and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`
    )
    .single();

  if (existing) return existing.id;

  // Créer une nouvelle conversation
  const { data, error } = await supabase
    .from(TABLES.CONVERSATIONS)
    .insert({
      user1_id:         userId,
      user2_id:         otherUserId,
      user1_name:       userName,
      user2_name:       otherUserName,
      other_user_id:    otherUserId,
      other_user_name:  otherUserName,
      other_user_photo: otherUserPhoto || '',
      last_message:     '',
      last_message_at:  new Date().toISOString(),
      unread_count:     0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

// ── Écouter les nouveaux messages (temps réel) ────
export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
) {
  return supabase
    .channel(`msgs:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.MESSAGES,
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload.new as Message)
    )
    .subscribe();
}

// ── Marquer les messages comme lus ────────────────
export async function markAsRead(conversationId: string, userId: string) {
  await supabase
    .from(TABLES.MESSAGES)
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('recipient_id', userId)
    .eq('read', false);

  await supabase
    .from(TABLES.CONVERSATIONS)
    .update({ unread_count: 0 })
    .eq('id', conversationId);
}
