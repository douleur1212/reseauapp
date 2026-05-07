// ══════════════════════════════════════════════════
//  RÉSEAU — Contexte Auth global
// ══════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@services/supabase';
import { fetchMyProfile, setOnlineStatus } from '@services/auth';
import { registerForPushNotifications } from '@services/notifications';
import type { User } from '@/types';

interface AuthContextType {
  user:          User | null;
  loading:       boolean;
  refreshUser:   () => Promise<void>;
  updateCredits: (credits: number) => void;
  updateSub:     (sub: boolean, expiry?: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user:          null,
  loading:       true,
  refreshUser:   async () => {},
  updateCredits: () => {},
  updateSub:     () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUserId: string, email: string) => {
    try {
      const profile = await fetchMyProfile(authUserId);
      if (profile) {
        setUser({
          id:              profile.id,
          email:           email,
          prenom:          profile.prenom || '',
          nom:             profile.nom || '',
          age:             profile.age,
          genre:           profile.genre,
          city:            profile.ville,
          country:         profile.pays,
          bio:             profile.bio,
          langs:           profile.langues || [],
          certified:       profile.certified || false,
          credits:         profile.credits || 0,
          sub:             profile.abonnement === 'premium' && (
                             !profile.premium_expiry ||
                             new Date(profile.premium_expiry) > new Date()
                           ),
          premium_expiry:  profile.premium_expiry,
          photo:           profile.photo_url || '',
          photos:          profile.photos || [],
          push_token:      profile.push_token,
        });
        // Marquer en ligne
        await setOnlineStatus(authUserId, true);
        // Enregistrer les push notifications
        await registerForPushNotifications(authUserId);
      }
    } catch (e) {
      console.error('[Auth] loadProfile error:', e);
    }
  }, []);

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '').finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Session prolongée silencieusement
      }
    });

    return () => {
      subscription.unsubscribe();
      // Marquer hors ligne à la fermeture
      if (user?.id) setOnlineStatus(user.id, false);
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await loadProfile(authUser.id, authUser.email || '');
  }, [loadProfile]);

  const updateCredits = useCallback((credits: number) => {
    setUser(prev => prev ? { ...prev, credits } : prev);
  }, []);

  const updateSub = useCallback((sub: boolean, expiry?: string) => {
    setUser(prev => prev ? { ...prev, sub, premium_expiry: expiry } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, updateCredits, updateSub }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
