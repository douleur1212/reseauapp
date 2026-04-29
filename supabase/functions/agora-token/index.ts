// ══════════════════════════════════════════════════
//  RÉSEAU — Edge Function : agora-token
//  Génère un token RTC Agora sécurisé côté serveur
//  appelé par l'app avant chaque appel audio
// ══════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const AGORA_APP_ID          = Deno.env.get('AGORA_APP_ID')!
const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Génération token Agora RTC (algorithme officiel) ──
// Source : https://docs.agora.io/en/video-calling/get-started/authentication-workflow
function buildTokenWithUid(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number,          // 1 = Publisher, 2 = Subscriber
  privilegeExpireTs: number
): string {
  const VERSION         = '006'
  const SERVICE_TYPE    = 1    // RTC
  const PRIVILEGE_JOIN  = 1
  const PRIVILEGE_PUBLISH = 2

  const ts   = Math.floor(Date.now() / 1000)
  const salt = Math.floor(Math.random() * 0xFFFFFFFF)
  const expiredTs = ts + privilegeExpireTs

  // Construire le message à signer
  const privileges: Record<number, number> = {
    [PRIVILEGE_JOIN]:    expiredTs,
    [PRIVILEGE_PUBLISH]: role === 1 ? expiredTs : 0,
  }

  const msgBuf = packMessage(salt, ts, privileges, channelName, uid, appId)
  const signature = computeHmacSha256(appCertificate, msgBuf)

  const tokenBuf = packToken(VERSION, appId, signature, msgBuf)
  return VERSION + appId + toBase64(tokenBuf)
}

function packMessage(
  salt: number, ts: number,
  privileges: Record<number, number>,
  channelName: string, uid: number, appId: string
): Uint8Array {
  const encoder = new TextEncoder()
  const parts: Uint8Array[] = []

  parts.push(packUint32LE(salt))
  parts.push(packUint32LE(ts))
  parts.push(packPrivileges(privileges))
  parts.push(packString(channelName))
  parts.push(packUint32LE(uid))

  return concat(parts)
}

function packToken(version: string, appId: string, sig: Uint8Array, msg: Uint8Array): Uint8Array {
  const sigLen = new Uint8Array(2)
  new DataView(sigLen.buffer).setUint16(0, sig.length, true)
  const msgLen = new Uint8Array(2)
  new DataView(msgLen.buffer).setUint16(0, msg.length, true)
  return concat([sigLen, sig, msgLen, msg])
}

function packUint32LE(v: number): Uint8Array {
  const b = new Uint8Array(4)
  new DataView(b.buffer).setUint32(0, v, true)
  return b
}

function packString(s: string): Uint8Array {
  const enc = new TextEncoder().encode(s)
  const len = new Uint8Array(2)
  new DataView(len.buffer).setUint16(0, enc.length, true)
  return concat([len, enc])
}

function packPrivileges(priv: Record<number, number>): Uint8Array {
  const entries = Object.entries(priv)
  const count = new Uint8Array(2)
  new DataView(count.buffer).setUint16(0, entries.length, true)
  const parts = [count]
  for (const [key, val] of entries) {
    parts.push(packUint32LE(Number(key)))
    parts.push(packUint32LE(val))
  }
  return concat(parts)
}

function concat(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) { result.set(arr, offset); offset += arr.length }
  return result
}

async function computeHmacSha256(key: string, data: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data)
  return new Uint8Array(sig)
}

function toBase64(data: Uint8Array): string {
  let binary = ''
  data.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

// ── Version simplifiée sans certificat (mode test) ──
// Quand AGORA_APP_CERTIFICATE n'est pas défini,
// retourne un token vide valable pour les projets en mode test
function buildTestToken(): string {
  return ''
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { channelName, uid, role = 1 } = await req.json()

    if (!channelName || uid === undefined) {
      return new Response(
        JSON.stringify({ error: 'channelName et uid sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Si pas de certificat → mode test Agora (projet sans authentification activée)
    if (!AGORA_APP_CERTIFICATE || AGORA_APP_CERTIFICATE === 'DISABLED') {
      return new Response(
        JSON.stringify({ token: buildTestToken(), appId: AGORA_APP_ID }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Token valable 1 heure
    const EXPIRE_SECONDS = 3600
    const token = await buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      EXPIRE_SECONDS
    )

    return new Response(
      JSON.stringify({ token, appId: AGORA_APP_ID }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('agora-token error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
