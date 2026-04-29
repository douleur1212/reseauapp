// ══════════════════════════════════════════════════
//  RÉSEAU — Edge Function : notchpay-webhook
//  Reçoit les callbacks de paiement NotchPay
//  et crédite automatiquement l'utilisateur
//  même si l'app est fermée au moment du paiement
// ══════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const NOTCHPAY_HASH = Deno.env.get('NOTCHPAY_HASH_KEY') ?? ''

const CREDIT_PACKS: Record<string, { credits: number }> = {
  pack10: { credits: 10 },
  pack30: { credits: 30 },
  pack60: { credits: 60 },
}

const PREMIUM_PLANS: Record<string, { months: number }> = {
  monthly:  { months: 1  },
  biannual: { months: 6  },
  annual:   { months: 12 },
}

serve(async (req) => {
  // NotchPay envoie des POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.text()
    const payload = JSON.parse(body)

    // ── Vérifier la signature NotchPay (sécurité) ──
    // NotchPay envoie un header x-notch-signature
    if (NOTCHPAY_HASH) {
      const signature = req.headers.get('x-notch-signature') ?? ''
      const expected  = await hmacSha256(NOTCHPAY_HASH, body)
      if (signature !== expected) {
        console.warn('Signature NotchPay invalide')
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const { event, data } = payload

    // On ne traite que les paiements complétés
    if (event !== 'payment.complete' && event !== 'charge.complete') {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const reference = data?.reference ?? data?.transaction?.reference
    if (!reference) {
      return new Response('Missing reference', { status: 400 })
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Récupérer la transaction en base
    const { data: tx, error: txErr } = await sb
      .from('transactions')
      .select('*')
      .eq('notch_ref', reference)
      .single()

    if (txErr || !tx) {
      // Chercher aussi par id direct
      const { data: tx2 } = await sb
        .from('transactions')
        .select('*')
        .eq('id', reference)
        .single()

      if (!tx2) {
        console.error('Transaction introuvable :', reference)
        return new Response('Transaction not found', { status: 404 })
      }
      return await processTransaction(sb, tx2)
    }

    return await processTransaction(sb, tx)

  } catch (err) {
    console.error('notchpay-webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function processTransaction(sb: any, tx: any): Promise<Response> {
  // Éviter le double traitement
  if (tx.status === 'completed') {
    return new Response(JSON.stringify({ already_processed: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    if (tx.type === 'credit') {
      await processCreditPayment(sb, tx)
    } else if (tx.type === 'premium') {
      await processPremiumPayment(sb, tx)
    }

    // Marquer la transaction comme complétée
    await sb
      .from('transactions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', tx.id)

    console.log(`✅ Transaction ${tx.id} traitée (${tx.type})`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    // Marquer comme échouée
    await sb
      .from('transactions')
      .update({ status: 'failed' })
      .eq('id', tx.id)

    throw err
  }
}

async function processCreditPayment(sb: any, tx: any): Promise<void> {
  const pack = CREDIT_PACKS[tx.pack_id]
  if (!pack) throw new Error(`Pack inconnu : ${tx.pack_id}`)

  // Récupérer le solde actuel
  const { data: membre } = await sb
    .from('membres')
    .select('credits')
    .eq('id', tx.user_id)
    .single()

  const currentCredits = membre?.credits ?? 0
  const newCredits     = currentCredits + pack.credits

  // Créditer
  const { error } = await sb
    .from('membres')
    .update({ credits: newCredits })
    .eq('id', tx.user_id)

  if (error) throw new Error('Erreur crédit : ' + error.message)

  console.log(`💰 ${pack.credits} crédits ajoutés → user ${tx.user_id} (total: ${newCredits})`)
}

async function processPremiumPayment(sb: any, tx: any): Promise<void> {
  const plan = PREMIUM_PLANS[tx.plan_id]
  if (!plan) throw new Error(`Plan inconnu : ${tx.plan_id}`)

  // Calculer la date d'expiration
  // Si l'utilisateur a déjà un abonnement actif → prolonger depuis la date d'expiration
  const { data: membre } = await sb
    .from('membres')
    .select('premium_expiry, abonnement')
    .eq('id', tx.user_id)
    .single()

  let baseDate = new Date()
  if (
    membre?.abonnement === 'premium' &&
    membre?.premium_expiry &&
    new Date(membre.premium_expiry) > new Date()
  ) {
    // Prolonger depuis la date d'expiration actuelle
    baseDate = new Date(membre.premium_expiry)
  }

  const expiry = new Date(baseDate)
  expiry.setMonth(expiry.getMonth() + plan.months)

  const { error } = await sb
    .from('membres')
    .update({
      abonnement:      'premium',
      premium_expiry:  expiry.toISOString(),
    })
    .eq('id', tx.user_id)

  if (error) throw new Error('Erreur premium : ' + error.message)

  console.log(`👑 Premium activé → user ${tx.user_id} jusqu'au ${expiry.toISOString()}`)
}

// ── HMAC-SHA256 pour vérifier la signature NotchPay ──
async function hmacSha256(key: string, data: string): Promise<string> {
  const enc     = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
