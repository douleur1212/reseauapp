// ══════════════════════════════════════════════════
//  RÉSEAU — Service Paiement NotchPay
//  Corrige le problème window.open → WebBrowser natif
//  avec deep link de retour vers l'app
// ══════════════════════════════════════════════════

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import supabase from './supabase';
import { TABLES } from '@constants/config';

const NOTCHPAY_API   = 'https://api.notchpay.co';
const PUBLIC_KEY     = process.env.EXPO_PUBLIC_NOTCHPAY_PUBLIC_KEY!;
const APP_SCHEME     = process.env.EXPO_PUBLIC_APP_SCHEME || 'reseau';

function genTxId() {
  return 'NP' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ── Initialiser un paiement crédits ────────────────
export async function initiateCreditPayment(
  userId: string,
  userEmail: string,
  userName: string,
  pack: { id: string; credits: number; price: number; currency: string }
): Promise<{ success: boolean; txId: string }> {
  const txId = genTxId();
  const returnUrl = Linking.createURL('payment/return', { queryParams: { txId, type: 'credit', pack: pack.id } });

  const payload = {
    amount:      pack.price,
    currency:    pack.currency,
    description: `${pack.credits} crédits – Réseau`,
    reference:   txId,
    callback:    process.env.EXPO_PUBLIC_NOTCHPAY_WEBHOOK_URL,
    return_url:  returnUrl,
    customer: {
      name:  userName,
      email: userEmail,
    },
  };

  const resp = await fetch(`${NOTCHPAY_API}/payments`, {
    method:  'POST',
    headers: {
      Authorization:  PUBLIC_KEY,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `Erreur HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const authUrl = data?.transaction?.authorization_url || data?.authorization_url;
  if (!authUrl) throw new Error('URL de paiement non reçue de NotchPay.');

  // Enregistrer la transaction en pending
  await supabase.from(TABLES.TRANSACTIONS).insert({
    id:           txId,
    user_id:      userId,
    type:         'credit',
    pack_id:      pack.id,
    credits:      pack.credits,
    amount:       pack.price,
    currency:     pack.currency,
    notch_ref:    data.transaction?.reference || txId,
    status:       'pending',
    created_at:   new Date().toISOString(),
  });

  // Ouvrir le checkout dans le navigateur natif avec retour dans l'app
  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

  if (result.type === 'success') {
    // Vérifier le paiement
    const verified = await verifyPayment(txId, data.transaction?.reference || txId);
    if (verified) {
      // Créditer l'utilisateur
      await creditUser(userId, pack.credits, txId);
      return { success: true, txId };
    }
  }

  return { success: false, txId };
}

// ── Initialiser un abonnement Premium ─────────────
export async function initiatePremiumPayment(
  userId: string,
  userEmail: string,
  userName: string,
  plan: { id: string; label: string; price: number; months: number }
): Promise<{ success: boolean; txId: string }> {
  const txId = genTxId();
  // Convertir EUR → XAF (taux approximatif)
  const amountXAF = Math.round(plan.price * 655.957);
  const returnUrl = Linking.createURL('payment/return', { queryParams: { txId, type: 'premium', plan: plan.id } });

  const payload = {
    amount:      amountXAF,
    currency:    'XAF',
    description: `Premium ${plan.label} – Réseau`,
    reference:   txId,
    callback:    process.env.EXPO_PUBLIC_NOTCHPAY_WEBHOOK_URL,
    return_url:  returnUrl,
    customer: {
      name:  userName,
      email: userEmail,
    },
  };

  const resp = await fetch(`${NOTCHPAY_API}/payments`, {
    method:  'POST',
    headers: {
      Authorization:  PUBLIC_KEY,
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `Erreur HTTP ${resp.status}`);
  }

  const data = await resp.json();
  const authUrl = data?.transaction?.authorization_url || data?.authorization_url;
  if (!authUrl) throw new Error('URL de paiement non reçue de NotchPay.');

  await supabase.from(TABLES.TRANSACTIONS).insert({
    id:         txId,
    user_id:    userId,
    type:       'premium',
    plan_id:    plan.id,
    amount:     plan.price,
    currency:   'EUR',
    notch_ref:  data.transaction?.reference || txId,
    status:     'pending',
    created_at: new Date().toISOString(),
  });

  const result = await WebBrowser.openAuthSessionAsync(authUrl, returnUrl);

  if (result.type === 'success') {
    const verified = await verifyPayment(txId, data.transaction?.reference || txId);
    if (verified) {
      await activatePremium(userId, plan.months, txId);
      return { success: true, txId };
    }
  }

  return { success: false, txId };
}

// ── Vérifier un paiement avec NotchPay ────────────
async function verifyPayment(txId: string, notchRef: string): Promise<boolean> {
  try {
    const resp = await fetch(`${NOTCHPAY_API}/payments/${notchRef}`, {
      headers: { Authorization: PUBLIC_KEY, Accept: 'application/json' },
    });
    const data = await resp.json();
    return data?.transaction?.status === 'complete';
  } catch {
    return false;
  }
}

// ── Créditer un utilisateur ────────────────────────
async function creditUser(userId: string, credits: number, txId: string) {
  // Récupérer le solde actuel
  const { data } = await supabase
    .from(TABLES.MEMBRES)
    .select('credits')
    .eq('id', userId)
    .single();

  const current = data?.credits || 0;
  const newBalance = current + credits;

  await supabase
    .from(TABLES.MEMBRES)
    .update({ credits: newBalance })
    .eq('id', userId);

  // Marquer la transaction comme complétée
  await supabase
    .from(TABLES.TRANSACTIONS)
    .update({ status: 'completed' })
    .eq('id', txId);
}

// ── Activer l'abonnement Premium ──────────────────
async function activatePremium(userId: string, months: number, txId: string) {
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + months);

  await supabase
    .from(TABLES.MEMBRES)
    .update({
      abonnement:       'premium',
      premium_expiry:   expiry.toISOString(),
    })
    .eq('id', userId);

  await supabase
    .from(TABLES.TRANSACTIONS)
    .update({ status: 'completed' })
    .eq('id', txId);
}

// ── Débiter des crédits (appels, messages…) ────────
export async function debitCredits(userId: string, amount: number): Promise<number> {
  const { data } = await supabase
    .from(TABLES.MEMBRES)
    .select('credits')
    .eq('id', userId)
    .single();

  const current = data?.credits || 0;
  const newBalance = Math.max(0, current - amount);

  await supabase
    .from(TABLES.MEMBRES)
    .update({ credits: newBalance })
    .eq('id', userId);

  return newBalance;
}

// ── Charger l'historique des transactions ─────────
export async function fetchTransactionHistory(userId: string) {
  const { data, error } = await supabase
    .from(TABLES.TRANSACTIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
