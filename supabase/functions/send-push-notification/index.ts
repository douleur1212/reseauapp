// ══════════════════════════════════════════════════
//  RÉSEAU — Edge Function : send-push-notification
//  Envoie des notifications push via Expo Push API
//  Appelée par les triggers Supabase (nouveaux messages,
//  matchs, appels entrants) pour notifier en temps réel
// ══════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushPayload {
  type:       'message' | 'match' | 'call' | 'like'
  toUserId:   string
  title:      string
  body:       string
  data?:      Record<string, unknown>
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: PushPayload = await req.json()
    const { toUserId, title, body, data, type } = payload

    if (!toUserId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'toUserId, title et body sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer le token push du destinataire
    const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data: membre, error } = await sb
      .from('membres')
      .select('push_token, push_platform, prenom')
      .eq('id', toUserId)
      .single()

    if (error || !membre?.push_token) {
      // L'utilisateur n'a pas de token push (app non installée ou notifs désactivées)
      return new Response(
        JSON.stringify({ sent: false, reason: 'no_push_token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Construire le message Expo
    const message = {
      to:    membre.push_token,
      title,
      body,
      data:  { type, ...data },
      sound: 'default',
      badge: 1,
      // Priorité haute pour les appels entrants
      priority: type === 'call' ? 'high' : 'default',
      // Canal Android (défini dans notifications.ts)
      channelId: type === 'call' ? 'calls' : 'default',
    }

    // Envoyer via Expo Push API
    const resp = await fetch(EXPO_PUSH_URL, {
      method:  'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    const result = await resp.json()

    // Vérifier les erreurs Expo
    if (result?.data?.status === 'error') {
      console.error('Expo push error:', result.data.message)
      // Si token invalide → le supprimer
      if (result.data.details?.error === 'DeviceNotRegistered') {
        await sb
          .from('membres')
          .update({ push_token: null })
          .eq('id', toUserId)
      }
    }

    console.log(`📲 Push [${type}] envoyé → ${membre.prenom} (${toUserId})`)

    return new Response(
      JSON.stringify({ sent: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('send-push-notification error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
