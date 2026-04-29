// ══════════════════════════════════════════════════
//  RÉSEAU — Constantes métier
// ══════════════════════════════════════════════════

export const CREDITS_PER_MINUTE = Number(process.env.EXPO_PUBLIC_CREDITS_PER_MINUTE) || 5;

export const CREDIT_PACKS = {
  pack10: { id: 'pack10', label: 'Pack Starter',  credits: 10, price: 2000, currency: 'XAF', popular: false },
  pack30: { id: 'pack30', label: 'Pack Populaire', credits: 30, price: 5000, currency: 'XAF', popular: true,  saving: '17%' },
  pack60: { id: 'pack60', label: 'Pack Pro',       credits: 60, price: 9000, currency: 'XAF', popular: false, saving: '25%' },
} as const;

export const PREMIUM_PLANS = {
  monthly:  { id: 'monthly',  label: 'Mensuel', price: 11.99, months: 1,  duration: '1 mois',   saving: '' },
  biannual: { id: 'biannual', label: '6 mois',  price: 42,    months: 6,  duration: '6 mois',   saving: 'Économisez 42%', popular: true },
  annual:   { id: 'annual',   label: 'Annuel',  price: 72,    months: 12, duration: '12 mois',  saving: 'Économisez 50%' },
} as const;

export const PAY_METHODS = {
  orange:     { id: 'orange',     label: 'Orange Money', icon: '🟠', channel: 'cm.orange' },
  mtn:        { id: 'mtn',        label: 'MTN MoMo',     icon: '🟡', channel: 'cm.mtn' },
  visa:       { id: 'visa',       label: 'Visa',         icon: '💳', channel: 'card' },
  mastercard: { id: 'mastercard', label: 'Mastercard',   icon: '💳', channel: 'card' },
} as const;

export const PREMIUM_FEATURES = [
  { icon: '💬', text: 'Messages illimités' },
  { icon: '👁️', text: 'Voir qui vous a aimé' },
  { icon: '🔍', text: 'Filtres de recherche avancés' },
  { icon: '✦',  text: 'Badge Premium visible' },
  { icon: '🚀', text: '1 boost profil / semaine' },
];

export const CREDIT_USES = [
  { icon: '💬', name: 'Message',       cost: 1 },
  { icon: '⭐', name: 'Super like',    cost: 2 },
  { icon: '🖼️', name: 'Photo privée', cost: 2 },
  { icon: '🚀', name: 'Boost profil', cost: 5 },
  { icon: '🎁', name: 'Cadeau',        cost: 3 },
];

export const REGISTRATION_STEPS = 6;

export const ALL_LANGS = [
  'Français','Anglais','Arabe','Mandarin','Espagnol','Portugais',
  'Allemand','Italien','Néerlandais','Japonais','Coréen','Hindi',
  'Haoussa','Swahili','Wolof','Bambara','Mooré','Lingala',
  'Kinyarwanda','Sango','Dioula','Fang','Yoruba','Igbo','Twi',
  'Peul','Berbère','Darija','Créole','Ourdou','Russe','Turc','Persan',
];

export const ALL_INTERESTS = [
  '🍽️ Restaurant','🏃 Running','🏋️ Gym / Fitness','🎬 Cinéma',
  '📚 Lecture','🥾 Randonnée','🎵 Musique','✈️ Voyages',
  '🎨 Art / Culture','🍷 Sorties','🏊 Natation','🧘 Yoga',
  '🎮 Jeux vidéo','🌿 Nature','🍳 Cuisine','🏄 Sports nautiques',
  '⚽ Football','🎭 Théâtre','🎤 Karaoké','🚴 Vélo',
];

export const DIAL_CODES = [
  // ── Afrique ───────────────────────────────────
  { code: '+237', flag: '🇨🇲', country: 'Cameroun' },
  { code: '+221', flag: '🇸🇳', country: 'Sénégal' },
  { code: '+225', flag: '🇨🇮', country: 'Côte d\'Ivoire' },
  { code: '+234', flag: '🇳🇬', country: 'Nigeria' },
  { code: '+233', flag: '🇬🇭', country: 'Ghana' },
  { code: '+250', flag: '🇷🇼', country: 'Rwanda' },
  { code: '+243', flag: '🇨🇩', country: 'RD Congo' },
  { code: '+242', flag: '🇨🇬', country: 'Congo' },
  { code: '+241', flag: '🇬🇦', country: 'Gabon' },
  { code: '+223', flag: '🇲🇱', country: 'Mali' },
  { code: '+226', flag: '🇧🇫', country: 'Burkina Faso' },
  { code: '+228', flag: '🇹🇬', country: 'Togo' },
  { code: '+229', flag: '🇧🇯', country: 'Bénin' },
  { code: '+227', flag: '🇳🇪', country: 'Niger' },
  { code: '+224', flag: '🇬🇳', country: 'Guinée' },
  { code: '+245', flag: '🇬🇼', country: 'Guinée-Bissau' },
  { code: '+240', flag: '🇬🇶', country: 'Guinée Équatoriale' },
  { code: '+235', flag: '🇹🇩', country: 'Tchad' },
  { code: '+236', flag: '🇨🇫', country: 'Centrafrique' },
  { code: '+239', flag: '🇸🇹', country: 'São Tomé' },
  { code: '+220', flag: '🇬🇲', country: 'Gambie' },
  { code: '+232', flag: '🇸🇱', country: 'Sierra Leone' },
  { code: '+231', flag: '🇱🇷', country: 'Liberia' },
  { code: '+238', flag: '🇨🇻', country: 'Cap-Vert' },
  { code: '+222', flag: '🇲🇷', country: 'Mauritanie' },
  { code: '+212', flag: '🇲🇦', country: 'Maroc' },
  { code: '+213', flag: '🇩🇿', country: 'Algérie' },
  { code: '+216', flag: '🇹🇳', country: 'Tunisie' },
  { code: '+218', flag: '🇱🇾', country: 'Libye' },
  { code: '+20',  flag: '🇪🇬', country: 'Égypte' },
  { code: '+249', flag: '🇸🇩', country: 'Soudan' },
  { code: '+211', flag: '🇸🇸', country: 'Soudan du Sud' },
  { code: '+251', flag: '🇪🇹', country: 'Éthiopie' },
  { code: '+253', flag: '🇩🇯', country: 'Djibouti' },
  { code: '+252', flag: '🇸🇴', country: 'Somalie' },
  { code: '+254', flag: '🇰🇪', country: 'Kenya' },
  { code: '+255', flag: '🇹🇿', country: 'Tanzanie' },
  { code: '+256', flag: '🇺🇬', country: 'Ouganda' },
  { code: '+257', flag: '🇧🇮', country: 'Burundi' },
  { code: '+258', flag: '🇲🇿', country: 'Mozambique' },
  { code: '+260', flag: '🇿🇲', country: 'Zambie' },
  { code: '+263', flag: '🇿🇼', country: 'Zimbabwe' },
  { code: '+265', flag: '🇲🇼', country: 'Malawi' },
  { code: '+267', flag: '🇧🇼', country: 'Botswana' },
  { code: '+264', flag: '🇳🇦', country: 'Namibie' },
  { code: '+27',  flag: '🇿🇦', country: 'Afrique du Sud' },
  { code: '+266', flag: '🇱🇸', country: 'Lesotho' },
  { code: '+268', flag: '🇸🇿', country: 'Eswatini' },
  { code: '+261', flag: '🇲🇬', country: 'Madagascar' },
  { code: '+230', flag: '🇲🇺', country: 'Maurice' },
  { code: '+269', flag: '🇰🇲', country: 'Comores' },
  { code: '+248', flag: '🇸🇨', country: 'Seychelles' },
  // ── Europe ────────────────────────────────────
  { code: '+33',  flag: '🇫🇷', country: 'France' },
  { code: '+32',  flag: '🇧🇪', country: 'Belgique' },
  { code: '+41',  flag: '🇨🇭', country: 'Suisse' },
  { code: '+352', flag: '🇱🇺', country: 'Luxembourg' },
  { code: '+44',  flag: '🇬🇧', country: 'Royaume-Uni' },
  { code: '+49',  flag: '🇩🇪', country: 'Allemagne' },
  { code: '+34',  flag: '🇪🇸', country: 'Espagne' },
  { code: '+39',  flag: '🇮🇹', country: 'Italie' },
  { code: '+351', flag: '🇵🇹', country: 'Portugal' },
  { code: '+31',  flag: '🇳🇱', country: 'Pays-Bas' },
  { code: '+46',  flag: '🇸🇪', country: 'Suède' },
  { code: '+47',  flag: '🇳🇴', country: 'Norvège' },
  { code: '+45',  flag: '🇩🇰', country: 'Danemark' },
  { code: '+358', flag: '🇫🇮', country: 'Finlande' },
  { code: '+43',  flag: '🇦🇹', country: 'Autriche' },
  { code: '+32',  flag: '🇧🇪', country: 'Belgique' },
  { code: '+353', flag: '🇮🇪', country: 'Irlande' },
  { code: '+48',  flag: '🇵🇱', country: 'Pologne' },
  { code: '+420', flag: '🇨🇿', country: 'Tchéquie' },
  { code: '+36',  flag: '🇭🇺', country: 'Hongrie' },
  { code: '+40',  flag: '🇷🇴', country: 'Roumanie' },
  { code: '+359', flag: '🇧🇬', country: 'Bulgarie' },
  { code: '+30',  flag: '🇬🇷', country: 'Grèce' },
  { code: '+90',  flag: '🇹🇷', country: 'Turquie' },
  { code: '+7',   flag: '🇷🇺', country: 'Russie' },
  { code: '+380', flag: '🇺🇦', country: 'Ukraine' },
  // ── Amériques ─────────────────────────────────
  { code: '+1',   flag: '🇺🇸', country: 'États-Unis' },
  { code: '+1',   flag: '🇨🇦', country: 'Canada' },
  { code: '+55',  flag: '🇧🇷', country: 'Brésil' },
  { code: '+52',  flag: '🇲🇽', country: 'Mexique' },
  { code: '+54',  flag: '🇦🇷', country: 'Argentine' },
  { code: '+57',  flag: '🇨🇴', country: 'Colombie' },
  { code: '+51',  flag: '🇵🇪', country: 'Pérou' },
  { code: '+56',  flag: '🇨🇱', country: 'Chili' },
  { code: '+58',  flag: '🇻🇪', country: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', country: 'Équateur' },
  { code: '+591', flag: '🇧🇴', country: 'Bolivie' },
  { code: '+595', flag: '🇵🇾', country: 'Paraguay' },
  { code: '+598', flag: '🇺🇾', country: 'Uruguay' },
  { code: '+509', flag: '🇭🇹', country: 'Haïti' },
  { code: '+596', flag: '🇲🇶', country: 'Martinique' },
  { code: '+590', flag: '🇬🇵', country: 'Guadeloupe' },
  { code: '+594', flag: '🇬🇫', country: 'Guyane française' },
  // ── Asie ──────────────────────────────────────
  { code: '+86',  flag: '🇨🇳', country: 'Chine' },
  { code: '+81',  flag: '🇯🇵', country: 'Japon' },
  { code: '+82',  flag: '🇰🇷', country: 'Corée du Sud' },
  { code: '+91',  flag: '🇮🇳', country: 'Inde' },
  { code: '+92',  flag: '🇵🇰', country: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', country: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', country: 'Népal' },
  { code: '+66',  flag: '🇹🇭', country: 'Thaïlande' },
  { code: '+84',  flag: '🇻🇳', country: 'Vietnam' },
  { code: '+62',  flag: '🇮🇩', country: 'Indonésie' },
  { code: '+63',  flag: '🇵🇭', country: 'Philippines' },
  { code: '+60',  flag: '🇲🇾', country: 'Malaisie' },
  { code: '+65',  flag: '🇸🇬', country: 'Singapour' },
  { code: '+95',  flag: '🇲🇲', country: 'Myanmar' },
  { code: '+855', flag: '🇰🇭', country: 'Cambodge' },
  { code: '+856', flag: '🇱🇦', country: 'Laos' },
  { code: '+880', flag: '🇧🇩', country: 'Bangladesh' },
  { code: '+93',  flag: '🇦🇫', country: 'Afghanistan' },
  { code: '+98',  flag: '🇮🇷', country: 'Iran' },
  { code: '+964', flag: '🇮🇶', country: 'Irak' },
  { code: '+963', flag: '🇸🇾', country: 'Syrie' },
  { code: '+961', flag: '🇱🇧', country: 'Liban' },
  { code: '+962', flag: '🇯🇴', country: 'Jordanie' },
  { code: '+972', flag: '🇮🇱', country: 'Israël' },
  { code: '+966', flag: '🇸🇦', country: 'Arabie Saoudite' },
  { code: '+971', flag: '🇦🇪', country: 'Émirats Arabes Unis' },
  { code: '+974', flag: '🇶🇦', country: 'Qatar' },
  { code: '+965', flag: '🇰🇼', country: 'Koweït' },
  { code: '+973', flag: '🇧🇭', country: 'Bahreïn' },
  { code: '+968', flag: '🇴🇲', country: 'Oman' },
  { code: '+967', flag: '🇾🇪', country: 'Yémen' },
  // ── Océanie ───────────────────────────────────
  { code: '+61',  flag: '🇦🇺', country: 'Australie' },
  { code: '+64',  flag: '🇳🇿', country: 'Nouvelle-Zélande' },
];

// Supabase table names
export const TABLES = {
  MEMBRES:        'membres',
  LIKES:          'likes',
  MESSAGES:       'messages',
  CONVERSATIONS:  'conversations',
  APPELS:         'appels',
  APPELS_ENTRANTS:'appels_entrants',
  TRANSACTIONS:   'transactions',
} as const;

// Photo CDN base URL — à remplacer par votre vrai CDN Supabase Storage
export const CDN_BASE = 'https://trfhvmbrvocfasxsnzux.supabase.co/storage/v1/object/public/profiles';
// Fallback avatar via DiceBear
export const AVATAR_FALLBACK = (name: string) =>
  `https://api.dicebear.com/8.x/personas/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a1230`;
