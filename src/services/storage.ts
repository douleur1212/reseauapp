// ══════════════════════════════════════════════════
//  RÉSEAU — Service Storage (photos Supabase)
//  Remplace les données base64 hardcodées HTML
//  par de vrais uploads vers Supabase Storage
// ══════════════════════════════════════════════════

import supabase from './supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const BUCKET = 'profiles';

// ── Upload d'un tableau de photos ─────────────────
export async function uploadPhotos(userId: string, uris: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    if (!uri) continue;

    try {
      const url = await uploadSinglePhoto(userId, uri, i);
      if (url) urls.push(url);
    } catch (e) {
      console.warn(`Photo ${i} upload failed:`, e);
    }
  }

  return urls;
}

// ── Upload d'une seule photo ───────────────────────
export async function uploadSinglePhoto(
  userId: string,
  uri: string,
  index: number
): Promise<string | null> {
  // Lire le fichier en base64
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';
  const filePath = `${userId}/photo_${index}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, decode(base64), {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  // Récupérer l'URL publique
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

// ── Supprimer une photo ────────────────────────────
export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}

// ── Extraire le path depuis une URL publique ──────
export function extractPathFromUrl(url: string): string {
  const parts = url.split(`/storage/v1/object/public/${BUCKET}/`);
  return parts[1] || '';
}
