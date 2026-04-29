-- ══════════════════════════════════════════════════
--  RÉSEAU — 06_storage.sql
--  Coller dans : Supabase → SQL Editor → New query
--  Exécuter en SIXIÈME
--
--  ⚠️  AVANT d'exécuter ce SQL :
--  1. Aller dans Supabase → Storage
--  2. Cliquer "New bucket"
--  3. Name: profiles
--  4. Public bucket: OUI (cocher)
--  5. Cliquer "Create bucket"
--  PUIS exécuter ce SQL
-- ══════════════════════════════════════════════════

CREATE POLICY "photos_publiques" ON storage.objects
  FOR SELECT USING (bucket_id = 'profiles');

CREATE POLICY "upload_photo_profil" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "modifier_ses_photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "supprimer_ses_photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profiles' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
