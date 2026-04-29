// ══════════════════════════════════════════════════
//  RÉSEAU — Types TypeScript
// ══════════════════════════════════════════════════

export interface Profile {
  id:        string;
  name:      string;
  prenom:    string;
  nom:       string;
  age:       number;
  genre:     'H' | 'F' | 'NB';
  city:      string;
  country:   string;
  bio:       string;
  langs:     string[];
  certified: boolean;
  online:    boolean;
  lastSeen:  string | null;
  credits:   number;
  url:       string;   // photo principale
  photos:    string[]; // galerie
}

export interface User {
  id:              string;
  email:           string;
  prenom:          string;
  nom:             string;
  age?:            number;
  genre?:          string;
  city?:           string;
  country?:        string;
  bio?:            string;
  langs?:          string[];
  certified:       boolean;
  credits:         number;
  sub:             boolean; // est Premium
  premium_expiry?: string | null;
  photo?:          string;
  photos?:         string[];
  push_token?:     string;
}

export interface Message {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  sender_name:     string;
  recipient_id:    string;
  content:         string;
  read:            boolean;
  created_at:      string;
}

export interface Conversation {
  id:               string;
  other_user_id:    string;
  other_user_name:  string;
  other_user_photo: string;
  last_message:     string;
  last_message_at:  string;
  unread_count:     number;
}

export interface Transaction {
  id:         string;
  user_id:    string;
  type:       'credit' | 'premium';
  pack_id?:   string;
  plan_id?:   string;
  credits?:   number;
  amount:     number;
  currency:   string;
  notch_ref:  string;
  status:     'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface CallState {
  active:    boolean;
  channel:   string | null;
  who:       Profile | null;
  t0:        number | null;
  mins:      number;
  muted:     boolean;
  bTimer:    ReturnType<typeof setInterval> | null;
  sTimer:    ReturnType<typeof setInterval> | null;
}

export interface RegisterData {
  // Étape 1
  prenom:    string;
  nom:       string;
  age:       string;
  genre:     string;
  taille?:   string;
  poids?:    string;
  religion?: string;
  // Étape 2
  skin?:     string;
  eyes?:     string;
  hair?:     string;
  ethn?:     string;
  // Étape 3
  langs:     string[];
  prefs:     string[];
  relPref?:  string;
  // Étape 4
  sg?:       string;
  ar?:       string;
  searchSkins?: string[];
  sz?:       string;
  rt?:       string;
  // Étape 5
  country?:  string;
  city?:     string;
  email:     string;
  password:  string;
  phoneNum?: string;
  dialCode?: string;
  phone?:    string;
  bio?:      string;
  // Étape 6
  photos:    string[];   // URIs locaux avant upload
  mainIdx:   number;
  // Interne
  phoneVerified?: boolean;
}

export type TabName = 'discover' | 'messages' | 'history' | 'profile';
export type AuthScreen = 'login' | 'register' | null;
export type HistoryTab = 'liked' | 'passed' | 'matches';
export type PayTab = 'credits' | 'premium' | 'history';
