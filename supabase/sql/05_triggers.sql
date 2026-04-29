-- ══════════════════════════════════════════════════
--  RÉSEAU — Triggers automatiques
--  Ces triggers appellent les Edge Functions
--  pour envoyer des notifications push automatiquement
--  à chaque nouveau message, match ou appel entrant.
--
--  ⚠️  Coller dans Supabase → SQL Editor → New query
--  ⚠️  À exécuter APRÈS les tables et RLS
-- ══════════════════════════════════════════════════

-- ── Activer pg_net pour les appels HTTP depuis SQL ──
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ══ TRIGGER 1 : Nouveau message → push au destinataire ══
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_url     TEXT;
  v_key     TEXT;
  v_payload JSONB;
BEGIN
  v_url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification';
  v_key := current_setting('app.service_role_key', true);

  v_payload := jsonb_build_object(
    'type',      'message',
    'toUserId',  NEW.recipient_id,
    'title',     '💬 ' || NEW.sender_name,
    'body',      LEFT(NEW.content, 100),
    'data',      jsonb_build_object(
      'conversationId', NEW.conversation_id,
      'senderId',       NEW.sender_id,
      'senderName',     NEW.sender_name
    )
  );

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := v_payload::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- ══ TRIGGER 2 : Nouveau match → push aux deux membres ══
CREATE OR REPLACE FUNCTION notify_new_match()
RETURNS TRIGGER AS $$
DECLARE
  v_url  TEXT;
  v_key  TEXT;
BEGIN
  v_url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification';
  v_key := current_setting('app.service_role_key', true);

  -- Notifier user1
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'type',      'match',
      'toUserId',  NEW.user1_id,
      'title',     '✨ Nouveau match !',
      'body',      'Vous et ' || NEW.user2_name || ' vous êtes mutuellement likés !',
      'data',      jsonb_build_object('matchName', NEW.user2_name, 'matchId', NEW.user2_id)
    )::text
  );

  -- Notifier user2
  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'type',      'match',
      'toUserId',  NEW.user2_id,
      'title',     '✨ Nouveau match !',
      'body',      'Vous et ' || NEW.user1_name || ' vous êtes mutuellement likés !',
      'data',      jsonb_build_object('matchName', NEW.user1_name, 'matchId', NEW.user1_id)
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_match ON matches;
CREATE TRIGGER on_new_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_match();


-- ══ TRIGGER 3 : Appel entrant → push au destinataire ══
CREATE OR REPLACE FUNCTION notify_incoming_call()
RETURNS TRIGGER AS $$
DECLARE
  v_url      TEXT;
  v_key      TEXT;
  v_user_id  UUID;
BEGIN
  v_url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification';
  v_key := current_setting('app.service_role_key', true);

  -- Trouver l'ID de l'utilisateur destinataire par son prénom
  SELECT id INTO v_user_id
  FROM membres
  WHERE prenom = NEW.to_name
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'type',      'call',
      'toUserId',  v_user_id,
      'title',     '📞 Appel entrant',
      'body',      NEW.from_name || ' vous appelle…',
      'data',      jsonb_build_object(
        'channel',   NEW.channel,
        'uid',       NEW.uid,
        'fromName',  NEW.from_name,
        'fromUser',  NEW.from_user
      )
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_incoming_call ON appels_entrants;
CREATE TRIGGER on_incoming_call
  AFTER INSERT ON appels_entrants
  FOR EACH ROW
  WHEN (NEW.status = 'ringing')
  EXECUTE FUNCTION notify_incoming_call();


-- ══ TRIGGER 4 : Nouveau like → push (optionnel) ══
CREATE OR REPLACE FUNCTION notify_new_like()
RETURNS TRIGGER AS $$
DECLARE
  v_url     TEXT;
  v_key     TEXT;
BEGIN
  v_url := current_setting('app.supabase_url', true) || '/functions/v1/send-push-notification';
  v_key := current_setting('app.service_role_key', true);

  IF NEW.to_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'type',      'like',
      'toUserId',  NEW.to_user_id,
      'title',     CASE WHEN NEW.super_like THEN '⭐ Super Like !' ELSE '❤️ Quelqu''un vous a liké !' END,
      'body',      NEW.from_name || CASE WHEN NEW.super_like THEN ' vous a envoyé un Super Like' ELSE ' a liké votre profil' END,
      'data',      jsonb_build_object('fromName', NEW.from_name, 'fromId', NEW.envoyeur_id)
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_like ON likes;
CREATE TRIGGER on_new_like
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_like();


-- ══ Configurer les variables app pour les triggers ══
-- ⚠️  Remplacer les valeurs ci-dessous par les vôtres
--     (les mêmes que dans votre .env)
ALTER DATABASE postgres
  SET app.supabase_url     = 'https://VOTRE_PROJET.supabase.co';

ALTER DATABASE postgres
  SET app.service_role_key = 'VOTRE_SERVICE_ROLE_KEY';
