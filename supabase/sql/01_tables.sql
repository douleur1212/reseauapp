-- ══════════════════════════════════════════════════
--  RÉSEAU — 01_tables.sql
--  Coller dans : Supabase → SQL Editor → New query
--  Exécuter en PREMIER
-- ══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS membres (
  id                UUID PRIMARY KEY REFERENCES auth.users(id),
  prenom            TEXT,
  nom               TEXT,
  email             TEXT,
  telephone         TEXT,
  indicatif_pays    TEXT,
  genre             TEXT,
  age               INT,
  pays              TEXT,
  ville             TEXT,
  bio               TEXT,
  langues           TEXT[]      DEFAULT '{}',
  centres_interet   TEXT[]      DEFAULT '{}',
  photo_principale  TEXT,
  photos            TEXT[]      DEFAULT '{}',
  taille            INT,
  poids             INT,
  religion          TEXT,
  couleur_peau      TEXT,
  couleur_yeux      TEXT,
  couleur_cheveux   TEXT,
  appartenance_ethn TEXT,
  recherche_genre   TEXT,
  tranche_age       TEXT,
  relation_type     TEXT,
  zone_recherche    TEXT,
  religion_pref     TEXT,
  credits           INT         DEFAULT 0,
  abonnement        TEXT        DEFAULT 'gratuit',
  premium_expiry    TIMESTAMPTZ,
  certified         BOOLEAN     DEFAULT false,
  en_ligne          BOOLEAN     DEFAULT false,
  last_seen         TIMESTAMPTZ,
  push_token        TEXT,
  push_platform     TEXT,
  statut            TEXT        DEFAULT 'en_attente',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id          UUID,
  user2_id          UUID,
  user1_name        TEXT,
  user2_name        TEXT,
  other_user_id     UUID,
  other_user_name   TEXT,
  other_user_photo  TEXT,
  last_message      TEXT,
  last_message_at   TIMESTAMPTZ DEFAULT NOW(),
  unread_count      INT         DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID,
  sender_name      TEXT,
  recipient_id     UUID,
  content          TEXT,
  read             BOOLEAN     DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envoyeur_id    UUID,
  from_name      TEXT,
  to_user_id     UUID,
  to_user_name   TEXT,
  super_like     BOOLEAN     DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id    UUID,
  user2_id    UUID,
  user1_name  TEXT,
  user2_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id           TEXT        PRIMARY KEY,
  user_id      UUID,
  type         TEXT,
  pack_id      TEXT,
  plan_id      TEXT,
  credits      INT,
  amount       NUMERIC,
  currency     TEXT,
  notch_ref    TEXT,
  status       TEXT        DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appels (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user        UUID,
  to_name          TEXT,
  duration_seconds INT,
  credits_debited  INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appels_entrants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user   UUID,
  from_name   TEXT,
  to_name     TEXT,
  channel     TEXT,
  uid         INT,
  status      TEXT        DEFAULT 'ringing',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_codes (
  phone       TEXT        PRIMARY KEY,
  code        TEXT,
  expires_at  TIMESTAMPTZ
);
