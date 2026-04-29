-- ══════════════════════════════════════════════════
--  RÉSEAU — 02_indexes.sql
--  Coller dans : Supabase → SQL Editor → New query
--  Exécuter en DEUXIÈME (après les tables)
-- ══════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_membres_statut       ON membres(statut);
CREATE INDEX IF NOT EXISTS idx_membres_genre        ON membres(genre);
CREATE INDEX IF NOT EXISTS idx_membres_en_ligne     ON membres(en_ligne);
CREATE INDEX IF NOT EXISTS idx_membres_pays         ON membres(pays);
CREATE INDEX IF NOT EXISTS idx_membres_push_token   ON membres(push_token) WHERE push_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conv        ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient   ON messages(recipient_id, read);
CREATE INDEX IF NOT EXISTS idx_messages_sender      ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_likes_envoyeur       ON likes(envoyeur_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user        ON likes(to_user_name);
CREATE INDEX IF NOT EXISTS idx_likes_to_user_id     ON likes(to_user_id);

CREATE INDEX IF NOT EXISTS idx_matches_user1        ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2        ON matches(user2_id);

CREATE INDEX IF NOT EXISTS idx_convs_user1          ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_convs_user2          ON conversations(user2_id);

CREATE INDEX IF NOT EXISTS idx_appels_from          ON appels(from_user);
CREATE INDEX IF NOT EXISTS idx_appels_entrants_to   ON appels_entrants(to_name, status);

CREATE INDEX IF NOT EXISTS idx_transactions_user    ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_notch   ON transactions(notch_ref);
CREATE INDEX IF NOT EXISTS idx_transactions_status  ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_sms_codes_expires    ON sms_codes(expires_at);
