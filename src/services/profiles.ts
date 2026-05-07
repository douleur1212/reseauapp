// ══════════════════════════════════════════════════
//  RÉSEAU — Service Profils
// ══════════════════════════════════════════════════

import supabase from './supabase';
import { TABLES, AVATAR_FALLBACK } from '@constants/config';
import type { Profile } from '@/types';

// ── Charger les profils depuis Supabase ────────────
export async function fetchProfiles(
  currentUserId: string,
  filters?: { genre?: string; pays?: string; ageMin?: number; ageMax?: number }
): Promise<Profile[]> {
  let query = supabase
    .from(TABLES.MEMBRES)
    .select('id, prenom, nom, age, genre, pays, ville, bio, langues, photo_url, photos_supplementaires, en_ligne, derniere_activite, credits')
    .neq('id', currentUserId)
    .eq('statut', 'actif')
    .limit(100);

  if (filters?.genre && filters.genre !== 'T') {
    query = query.eq('genre', filters.genre);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map(normalizeProfile);
}

// ── Normaliser un profil Supabase → type Profile ──
export function normalizeProfile(raw: any): Profile {
  return {
    id:         raw.id,
    name:       raw.prenom || raw.nom || 'Membre',
    prenom:     raw.prenom,
    nom:        raw.nom,
    age:        raw.age || 25,
    genre:      raw.genre,
    city:       raw.ville || '',
    country:    raw.pays || '',
    bio:        raw.bio || '',
    langs:      raw.langues || [],
    certified:  raw.certified || false,
    online:     raw.en_ligne || false,
    lastSeen:   raw.derniere_activite || null,
    credits:    raw.credits || 0,
    // Photos : utiliser photo_principale ou fallback avatar
    url:        raw.photo_url || AVATAR_FALLBACK(raw.prenom || 'user'),
    photos:     raw.photos_supplementaires || (raw.photo_url ? [raw.photo_url] : []),
  };
}

// ── Liker un profil ────────────────────────────────
export async function likeProfile(
  fromUserId: string,
  fromName: string,
  toProfile: Profile,
  isSuper = false
) {
  // Vérifier si déjà liké
  const { data: existing } = await supabase
    .from(TABLES.LIKES)
    .select('id')
    .eq('envoyeur_id', fromUserId)
    .eq('to_user_name', toProfile.name)
    .single();

  if (existing) return { alreadyLiked: true, isMatch: false };

  // Insérer le like
  await supabase.from(TABLES.LIKES).insert({
    envoyeur_id:   fromUserId,
    from_name:     fromName,
    to_user_name:  toProfile.name,
    to_user_id:    toProfile.id,
    super_like:    isSuper,
    created_at:    new Date().toISOString(),
  });

  // Vérifier si c'est un match (l'autre nous a aussi liké)
  const { data: mutual } = await supabase
    .from(TABLES.LIKES)
    .select('id')
    .eq('envoyeur_id', toProfile.id)
    .eq('to_user_name', fromName)
    .single();

  const isMatch = !!mutual;

  if (isMatch) {
    // Notifier le match dans la table
    await supabase.from('matches').upsert({
      user1_id:   fromUserId,
      user2_id:   toProfile.id,
      user1_name: fromName,
      user2_name: toProfile.name,
      created_at: new Date().toISOString(),
    });
  }

  return { alreadyLiked: false, isMatch };
}

// ── Charger mes likes / passés / matchs ───────────
export async function fetchMyHistory(userId: string, myPrenom: string) {
  const [likesRes, receivedRes] = await Promise.all([
    supabase
      .from(TABLES.LIKES)
      .select('to_user_name, to_user_id, super_like, created_at')
      .eq('envoyeur_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from(TABLES.LIKES)
      .select('from_name, envoyeur_id, created_at')
      .eq('to_user_name', myPrenom),
  ]);

  const liked   = likesRes.data || [];
  const received = receivedRes.data || [];
  const receivedNames = received.map((r: any) => r.from_name);
  const matches = liked.filter((l: any) => receivedNames.includes(l.to_user_name));

  return { liked, matches };
}

// ── Profil complet par ID ─────────────────────────
export async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from(TABLES.MEMBRES)
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return normalizeProfile(data);
}
