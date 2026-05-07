// ══════════════════════════════════════════════════
//  RÉSEAU — Service d'authentification
// ══════════════════════════════════════════════════

import supabase from './supabase';
import { TABLES } from '@constants/config';
import { uploadPhotos } from './storage';
import type { RegisterData } from '@/types';

// ── Connexion ──────────────────────────────────────
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
  return data;
}

// ── Inscription complète ───────────────────────────
export async function register(regData: RegisterData) {
  // 1. Créer le compte Auth Supabase
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: regData.email,
    password: regData.password,
    options: {
      emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_SCHEME}://auth/confirm`,
      data: {
        prenom: regData.prenom,
        nom: regData.nom,
      },
    },
  });

  if (authErr) throw new Error(translateAuthError(authErr.message));
  const userId = authData.user?.id;
  if (!userId) throw new Error('Identifiant utilisateur non reçu.');

  // 2. Uploader les photos vers Supabase Storage
  let photoUrls: string[] = [];
  if (regData.photos && regData.photos.length > 0) {
    photoUrls = await uploadPhotos(userId, regData.photos);
  }

  // 3. Insérer le profil dans la table membres
  const telephone = `${regData.dialCode || ''}${regData.phoneNum || ''}`;
  const { error: insertErr } = await supabase.from(TABLES.MEMBRES).insert({
    id:                userId,
    prenom:            regData.prenom,
    nom:               regData.nom,
    email:             regData.email,
    telephone,
    indicatif_pays:    regData.dialCode || '',
    genre:             regData.genre,
    age:               Number(regData.age),
    pays:              regData.country || '',
    ville:             regData.city || '',
    bio:               regData.bio || '',
    langues:           regData.langs || [],
    centres_interet:   regData.prefs || [],
    taille:            regData.taille ? Number(regData.taille) : null,
    poids:             regData.poids ? Number(regData.poids) : null,
    religion:          regData.religion || '',
    couleur_peau:      regData.skin || '',
    couleur_yeux:      regData.eyes || '',
    couleur_cheveux:   regData.hair || '',
    appartenance_ethn: regData.ethn || '',
    recherche_genre:   regData.sg || '',
    tranche_age:       regData.ar || '',
    relation_type:     regData.rt || '',
    zone_recherche:    regData.sz || '',
    religion_pref:     regData.relPref || '',
    photos:            photoUrls,
    photo_url:  photoUrls[regData.mainIdx ?? 0] || photoUrls[0] || '',
    credits:           0,
    abonnement:        'gratuit',
    statut:            'en_attente',
    email_verifie:     false,
    en_ligne:          false,
    certified:         photoUrls.length >= 4,
    created_at:        new Date().toISOString(),
  });

  if (insertErr) throw new Error('Erreur de création du profil : ' + insertErr.message);

  return { userId, email: regData.email, prenom: regData.prenom };
}

// ── Déconnexion ────────────────────────────────────
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// ── Profil courant ─────────────────────────────────
export async function fetchMyProfile(userId: string) {
  const { data, error } = await supabase
    .from(TABLES.MEMBRES)
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Mettre à jour le statut en ligne ──────────────
export async function setOnlineStatus(userId: string, online: boolean) {
  await supabase
    .from(TABLES.MEMBRES)
    .update({ en_ligne: online, derniere_activite: new Date().toISOString() })
    .eq('id', userId);
}

// ── Traduction des erreurs Auth ────────────────────
function translateAuthError(msg: string): string {
  if (msg.includes('User already registered'))  return 'Cet email est déjà utilisé.';
  if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed'))       return 'Confirmez votre email avant de vous connecter.';
  if (msg.includes('Password should be'))       return 'Mot de passe trop court (minimum 6 caractères).';
  return msg;
}
