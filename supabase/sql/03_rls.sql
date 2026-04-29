-- ══════════════════════════════════════════════════
--  RÉSEAU — 03_rls.sql
--  Coller dans : Supabase → SQL Editor → New query
--  Exécuter en TROISIÈME
-- ══════════════════════════════════════════════════

ALTER TABLE membres          ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE appels           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appels_entrants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_codes        ENABLE ROW LEVEL SECURITY;

-- ── MEMBRES ──────────────────────────────────────
CREATE POLICY "profils_actifs_visibles" ON membres
  FOR SELECT USING (statut = 'actif' OR auth.uid() = id);

CREATE POLICY "creer_son_profil" ON membres
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "modifier_son_profil" ON membres
  FOR UPDATE USING (auth.uid() = id);

-- ── CONVERSATIONS ─────────────────────────────────
CREATE POLICY "voir_ses_conversations" ON conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "creer_conversation" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "maj_conversation" ON conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ── MESSAGES ──────────────────────────────────────
CREATE POLICY "voir_ses_messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "envoyer_message" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "marquer_lu" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- ── LIKES ─────────────────────────────────────────
CREATE POLICY "voir_ses_likes" ON likes
  FOR SELECT USING (auth.uid() = envoyeur_id OR auth.uid() = to_user_id);

CREATE POLICY "liker_profil" ON likes
  FOR INSERT WITH CHECK (auth.uid() = envoyeur_id);

-- ── MATCHES ───────────────────────────────────────
CREATE POLICY "voir_ses_matchs" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "creer_match" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ── TRANSACTIONS ──────────────────────────────────
CREATE POLICY "voir_ses_transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "creer_transaction" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "maj_transaction" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- ── APPELS ────────────────────────────────────────
CREATE POLICY "voir_ses_appels" ON appels
  FOR SELECT USING (auth.uid() = from_user);

CREATE POLICY "logger_appel" ON appels
  FOR INSERT WITH CHECK (auth.uid() = from_user);

-- ── APPELS ENTRANTS ───────────────────────────────
CREATE POLICY "recevoir_appels" ON appels_entrants
  FOR SELECT USING (true);

CREATE POLICY "notifier_appel" ON appels_entrants
  FOR INSERT WITH CHECK (auth.uid() = from_user);

-- ── SMS CODES ─────────────────────────────────────
-- Uniquement accessible par les Edge Functions (service role)
CREATE POLICY "sms_service_only" ON sms_codes
  FOR ALL USING (false);
