# ══════════════════════════════════════════════════
#  RÉSEAU — Secrets Supabase Edge Functions
#  Supabase → Settings → Edge Functions → Secrets
# ══════════════════════════════════════════════════

# ── Injectés automatiquement (ne pas ajouter) ────
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# SUPABASE_ANON_KEY

# ── Agora (appels audio) ──────────────────────────
# console.agora.io → ton projet → App Certificate
AGORA_APP_ID          = c6d8df27336c4b76ae8493e8210b4125
AGORA_APP_CERTIFICATE = [ton certificate]
# Si projet Agora en mode test : mettre DISABLED

# ── NotchPay (paiements) ─────────────────────────
# business.notchpay.co → Settings → API Keys → Hash key
NOTCHPAY_HASH_KEY = [ta hash key]

# ── SMS : PAS NÉCESSAIRE ──────────────────────────
# La vérification se fait par email (Supabase Auth).
# Twilio et Africa's Talking ne sont plus utilisés.
