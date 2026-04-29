-- ══════════════════════════════════════════════════
--  RÉSEAU — 04_realtime.sql
--  Coller dans : Supabase → SQL Editor → New query
--  Exécuter en QUATRIÈME
-- ══════════════════════════════════════════════════

BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime
  ADD TABLE messages, appels_entrants, conversations, matches;
