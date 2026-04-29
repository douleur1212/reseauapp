# 📱 Réseau App — React Native

Application de rencontres sérieuses pour la diaspora africaine et francophone.

---

## 🚀 Installation rapide

### 1. Prérequis
- Node.js 18+
- Expo CLI : `npm install -g @expo/eas-cli expo-cli`
- iOS : Xcode 15+ (Mac uniquement)
- Android : Android Studio + JDK 17

### 2. Installer les dépendances
```bash
cd reseau-app
npm install
```

### 3. Configurer les variables d'environnement
Renommez `.env.example` en `.env` et remplissez vos clés :
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
EXPO_PUBLIC_AGORA_APP_ID=votre_app_id
EXPO_PUBLIC_NOTCHPAY_PUBLIC_KEY=pk.xxx
```

> ⚠️ Ne committez JAMAIS le fichier `.env` sur Git.

### 4. Lancer en développement
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code)
npm start
```

---

## 📋 Structure du projet

```
reseau-app/
├── App.tsx                          # Entrée principale
├── app.json                         # Config Expo
├── .env                             # Variables d'environnement (⚠️ ne pas commiter)
├── src/
│   ├── screens/
│   │   ├── LandingScreen.tsx        # Page d'accueil publique
│   │   ├── LoginScreen.tsx          # Connexion
│   │   ├── RegisterScreen.tsx       # Inscription 6 étapes
│   │   ├── DiscoverScreen.tsx       # Swipe / Découvrir
│   │   ├── MessagesScreen.tsx       # Liste conversations
│   │   ├── ChatScreen.tsx           # Chat temps réel
│   │   ├── HistoryScreen.tsx        # Likés / Matchs
│   │   ├── ProfileScreen.tsx        # Mon profil
│   │   ├── ProfileDetailScreen.tsx  # Fiche profil membre
│   │   ├── CreditsScreen.tsx        # Achats crédits & Premium
│   │   └── CallScreen.tsx           # Appel audio Agora
│   ├── services/
│   │   ├── supabase.ts              # Client Supabase sécurisé
│   │   ├── auth.ts                  # Login / Register / Logout
│   │   ├── storage.ts               # Upload photos Supabase Storage
│   │   ├── profiles.ts              # Fetch profils, like, match
│   │   ├── messages.ts              # Messagerie temps réel
│   │   ├── payment.ts               # NotchPay (crédits + premium)
│   │   ├── calls.ts                 # Agora audio calls
│   │   ├── notifications.ts         # Push notifications Expo
│   │   └── sms.ts                   # Vérification SMS réelle
│   ├── context/
│   │   └── AuthContext.tsx          # État utilisateur global
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Stack + Bottom Tabs
│   ├── constants/
│   │   ├── theme.ts                 # Couleurs, typo, spacing
│   │   └── config.ts                # Packs, plans, langues…
│   └── types/
│       └── index.ts                 # Types TypeScript
```

---

## ✅ Problèmes résolus vs version HTML

| Problème | Solution appliquée |
|---|---|
| Tout dans un fichier | Architecture modulaire 15 fichiers |
| Données hardcodées | Fetch Supabase dynamique |
| Images sans URL | Supabase Storage avec upload réel |
| SMS simulé | Service Edge Function + Africa's Talking |
| Clés API en clair | Variables `.env` EXPO_PUBLIC_ |
| NotchPay window.open | WebBrowser.openAuthSessionAsync + deep link |
| Pas de push notifications | Expo Notifications + FCM/APNs |
| Agora SDK web | react-native-agora + instructions intégration |

---

## 🔧 Configuration Supabase

### Tables requises
Créez ces tables dans votre Supabase Dashboard :

```sql
-- Membres
CREATE TABLE membres (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  prenom TEXT, nom TEXT, email TEXT,
  telephone TEXT, genre TEXT, age INT,
  pays TEXT, ville TEXT, bio TEXT,
  langues TEXT[], centres_interet TEXT[],
  photo_principale TEXT, photos TEXT[],
  credits INT DEFAULT 0,
  abonnement TEXT DEFAULT 'gratuit',
  premium_expiry TIMESTAMPTZ,
  certified BOOL DEFAULT false,
  en_ligne BOOL DEFAULT false,
  last_seen TIMESTAMPTZ,
  push_token TEXT, push_platform TEXT,
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID, user2_id UUID,
  user1_name TEXT, user2_name TEXT,
  other_user_id UUID, other_user_name TEXT, other_user_photo TEXT,
  last_message TEXT, last_message_at TIMESTAMPTZ,
  unread_count INT DEFAULT 0
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID, sender_name TEXT,
  recipient_id UUID, content TEXT,
  read BOOL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envoyeur_id UUID, from_name TEXT,
  to_user_id UUID, to_user_name TEXT,
  super_like BOOL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id UUID, type TEXT,
  pack_id TEXT, plan_id TEXT,
  credits INT, amount NUMERIC, currency TEXT,
  notch_ref TEXT, status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appels
CREATE TABLE appels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID, to_name TEXT,
  duration_seconds INT, credits_debited INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appels entrants
CREATE TABLE appels_entrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID, from_name TEXT,
  to_name TEXT, channel TEXT, uid INT,
  status TEXT DEFAULT 'ringing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Codes SMS
CREATE TABLE sms_codes (
  phone TEXT PRIMARY KEY,
  code TEXT, expires_at TIMESTAMPTZ
);
```

### Storage Bucket
```
Créer un bucket public "profiles" dans Supabase Storage
```

---

## 📲 Build & Publication

### Configurer EAS
```bash
eas login
eas build:configure
```

Modifiez `extra.eas.projectId` dans `app.json` avec votre vrai ID.

### Build iOS (TestFlight / App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Build Android (Play Store)
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## 📞 Intégration Agora complète

Installez react-native-agora et décommentez le code dans `CallScreen.tsx` et `calls.ts` :

```bash
npm install react-native-agora
npx pod-install ios
```

---

## 📱 SMS réel (Africa's Talking)

1. Créer un compte sur [africastalking.com](https://africastalking.com)
2. Ajouter dans Supabase Dashboard → Edge Functions → Secrets :
   - `AT_USERNAME` = votre username
   - `AT_API_KEY` = votre API key
3. Déployer les Edge Functions (code dans `src/services/sms.ts`)

```bash
supabase functions deploy send-sms-code
supabase functions deploy verify-sms-code
```

---

## 🛡️ Sécurité

- ✅ Clés API dans variables d'environnement
- ✅ `.env` dans `.gitignore`
- ✅ Sessions Supabase dans AsyncStorage sécurisé
- ✅ Upload photos côté client → Supabase Storage
- ✅ Paiements vérifiés côté serveur (webhook)
- ✅ Deep links sécurisés pour retour paiement
