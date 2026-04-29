// ══════════════════════════════════════════════════
//  RÉSEAU — LoginScreen
// ══════════════════════════════════════════════════
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { login } from '@services/auth';
import { COLORS, RADIUS, SPACING } from '@constants/theme';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Champs requis', 'Email et mot de passe requis.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext détecte le changement de session automatiquement
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.dark3, COLORS.dark]} style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24, paddingHorizontal: SPACING.md }}>
          <Text style={{ color: COLORS.muted, fontSize: 14 }}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          <Text style={styles.logo}>Réseau</Text>
          <Text style={styles.subtitle}>Retrouvez l'amour authentique</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={COLORS.muted} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mot de passe" placeholderTextColor={COLORS.muted} secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.btnGrad}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Se connecter</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>Pas encore de compte ? S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  logo:      { fontSize: 42, fontFamily: 'PlayfairDisplay_700Bold', color: COLORS.rose, textAlign: 'center', marginBottom: 8 },
  subtitle:  { color: COLORS.muted, textAlign: 'center', marginBottom: 32, fontSize: 14 },
  input:     { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, color: '#fff', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12 },
  btn:       { borderRadius: 100, overflow: 'hidden', marginTop: 8 },
  btnGrad:   { paddingVertical: 16, alignItems: 'center' },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
  link:      { alignItems: 'center', marginTop: 16 },
  linkText:  { color: COLORS.muted, textDecorationLine: 'underline', fontSize: 13 },
});
