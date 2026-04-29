// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Crédits & Premium
// ══════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@context/AuthContext';
import { initiateCreditPayment, initiatePremiumPayment } from '@services/payment';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import { CREDIT_PACKS, PREMIUM_PLANS, PAY_METHODS, PREMIUM_FEATURES, CREDIT_USES } from '@constants/config';

type Tab = 'credits' | 'premium';

export default function CreditsScreen() {
  const { user, updateCredits, updateSub } = useAuth();
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();

  const [tab,         setTab]         = useState<Tab>('credits');
  const [selectedPack, setPack]       = useState<string | null>(null);
  const [selectedPlan, setPlan]       = useState<string | null>(null);
  const [selectedMethod, setMethod]   = useState<string | null>(null);
  const [paying,      setPaying]      = useState(false);

  async function handleCreditPurchase() {
    if (!user || !selectedPack || !selectedMethod) return;
    const pack = CREDIT_PACKS[selectedPack as keyof typeof CREDIT_PACKS];
    setPaying(true);
    try {
      const { success } = await initiateCreditPayment(
        user.id, user.email, user.prenom, pack
      );
      if (success) {
        updateCredits((user.credits || 0) + pack.credits);
        Alert.alert('✅ Succès', `${pack.credits} crédits ajoutés à votre compte !`);
        navigation.goBack();
      } else {
        Alert.alert('⚠️ Paiement annulé', 'Le paiement n\'a pas été finalisé.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setPaying(false);
    }
  }

  async function handlePremiumPurchase() {
    if (!user || !selectedPlan || !selectedMethod) return;
    const plan = PREMIUM_PLANS[selectedPlan as keyof typeof PREMIUM_PLANS];
    setPaying(true);
    try {
      const { success } = await initiatePremiumPayment(
        user.id, user.email, user.prenom, plan
      );
      if (success) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + plan.months);
        updateSub(true, expiry.toISOString());
        Alert.alert('👑 Bienvenue Premium !', `Votre abonnement ${plan.label} est activé.`);
        navigation.goBack();
      } else {
        Alert.alert('⚠️ Paiement annulé', 'Le paiement n\'a pas été finalisé.');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crédits & Premium</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Solde : </Text>
          <Text style={styles.balanceValue}>⚡ {user?.credits || 0} crédits</Text>
          {user?.sub && <Text style={styles.premiumBadge}>  ✦ Premium</Text>}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['credits', 'premium'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); setPack(null); setPlan(null); setMethod(null); }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'credits' ? '⚡ Crédits' : '👑 Premium'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'credits' ? (
          <>
            {/* Usage info */}
            <Text style={styles.sectionLabel}>💡 À quoi servent les crédits ?</Text>
            <View style={styles.usageGrid}>
              {CREDIT_USES.map((u, i) => (
                <View key={i} style={styles.useCard}>
                  <Text style={styles.useIcon}>{u.icon}</Text>
                  <Text style={styles.useName}>{u.name}</Text>
                  <View style={styles.useCostBadge}>
                    <Text style={styles.useCostText}>{u.cost} cr</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Pack selection */}
            <Text style={styles.sectionLabel}>Choisir un pack</Text>
            <View style={styles.packsRow}>
              {Object.values(CREDIT_PACKS).map(pack => (
                <TouchableOpacity
                  key={pack.id}
                  style={[styles.packCard, selectedPack === pack.id && styles.packCardActive]}
                  onPress={() => setPack(pack.id)}
                >
                  {pack.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>🔥 Populaire</Text>
                    </View>
                  )}
                  <Text style={styles.packCredits}>⚡ {pack.credits}</Text>
                  <Text style={styles.packCreditsLabel}>crédits</Text>
                  <Text style={styles.packPrice}>{pack.price.toLocaleString('fr-FR')} {pack.currency}</Text>
                  {pack.saving && <Text style={styles.packSaving}>Économisez {pack.saving}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment method */}
            {selectedPack && (
              <>
                <Text style={styles.sectionLabel}>Mode de paiement</Text>
                <View style={styles.methodsRow}>
                  {Object.values(PAY_METHODS).map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                      onPress={() => setMethod(m.id)}
                    >
                      <Text style={styles.methodIcon}>{m.icon}</Text>
                      <Text style={styles.methodLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Pay button */}
            {selectedPack && selectedMethod && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={handleCreditPurchase}
                disabled={paying}
              >
                <LinearGradient colors={['#00b09b', '#1a6b3c']} style={styles.payBtnGrad}>
                  {paying
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.payBtnText}>
                        🔐 Payer {CREDIT_PACKS[selectedPack as keyof typeof CREDIT_PACKS]?.price.toLocaleString('fr-FR')} XAF avec NotchPay
                      </Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {/* Premium benefits */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>✦ Avantages Premium</Text>
              {PREMIUM_FEATURES.map((f, i) => (
                <View key={i} style={styles.benefitRow}>
                  <View style={styles.benefitCheck}><Text style={styles.benefitCheckText}>✓</Text></View>
                  <Text style={styles.benefitText}>{f.text}</Text>
                </View>
              ))}
            </View>

            {/* Plan selection */}
            <Text style={styles.sectionLabel}>Choisir un plan</Text>
            <View style={styles.plansRow}>
              {Object.values(PREMIUM_PLANS).map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, selectedPlan === plan.id && styles.planCardActive]}
                  onPress={() => setPlan(plan.id)}
                >
                  {'popular' in plan && plan.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: COLORS.gold }]}>
                      <Text style={[styles.popularText, { color: '#1a1230' }]}>⭐ Meilleure valeur</Text>
                    </View>
                  )}
                  <Text style={styles.planLabel}>{plan.label}</Text>
                  <Text style={styles.planPrice}>€{plan.price}</Text>
                  {plan.saving ? <Text style={styles.planSaving}>{plan.saving}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment method */}
            {selectedPlan && (
              <>
                <Text style={styles.sectionLabel}>Mode de paiement</Text>
                <View style={styles.methodsRow}>
                  {Object.values(PAY_METHODS).map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.methodCard, selectedMethod === m.id && styles.methodCardActive]}
                      onPress={() => setMethod(m.id)}
                    >
                      <Text style={styles.methodIcon}>{m.icon}</Text>
                      <Text style={styles.methodLabel}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Pay button */}
            {selectedPlan && selectedMethod && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={handlePremiumPurchase}
                disabled={paying}
              >
                <LinearGradient colors={[COLORS.gold, '#e6a817']} style={styles.payBtnGrad}>
                  {paying
                    ? <ActivityIndicator color="#1a1230" />
                    : <Text style={[styles.payBtnText, { color: '#1a1230' }]}>
                        👑 Activer Premium — €{PREMIUM_PLANS[selectedPlan as keyof typeof PREMIUM_PLANS]?.price}
                      </Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}

        <Text style={styles.secureNote}>
          🛡️ Sécurisé par NotchPay · SSL 256-bit · Orange Money · MTN MoMo · Carte
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.dark },
  header:        { paddingHorizontal: SPACING.md, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  closeBtn:      { alignSelf: 'flex-end', padding: 4, marginBottom: 4 },
  closeText:     { color: COLORS.muted, fontSize: 18 },
  title:         { fontSize: 20, fontWeight: '700', color: '#fff', fontFamily: 'PlayfairDisplay_700Bold', marginBottom: 6 },
  balanceRow:    { flexDirection: 'row', alignItems: 'center' },
  balanceLabel:  { color: COLORS.muted, fontSize: 13 },
  balanceValue:  { color: COLORS.bleu, fontWeight: '700', fontSize: 13 },
  premiumBadge:  { color: COLORS.gold, fontWeight: '700', fontSize: 13 },

  tabs:          { flexDirection: 'row', margin: SPACING.md, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: RADIUS.md, padding: 4, gap: 4 },
  tabBtn:        { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm, borderWidth: 1, borderColor: 'transparent' },
  tabBtnActive:  { backgroundColor: 'rgba(232,48,90,0.08)', borderColor: 'rgba(232,48,90,0.25)' },
  tabText:       { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.text },
  scroll:        { padding: SPACING.md, paddingBottom: 40 },

  sectionLabel:  { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 16 },

  usageGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  useCard:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 8 },
  useIcon:       { fontSize: 14 },
  useName:       { color: COLORS.text, fontSize: 12, flex: 1 },
  useCostBadge:  { backgroundColor: 'rgba(106,180,255,0.12)', borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 },
  useCostText:   { color: COLORS.bleu, fontSize: 11, fontWeight: '700' },

  packsRow:      { flexDirection: 'row', gap: 10 },
  packCard:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, alignItems: 'center' },
  packCardActive:{ borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.08)' },
  popularBadge:  { position: 'absolute', top: -10, backgroundColor: COLORS.rose, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  popularText:   { color: '#fff', fontSize: 9, fontWeight: '700' },
  packCredits:   { fontSize: 22, fontWeight: '700', color: COLORS.bleu },
  packCreditsLabel:{ fontSize: 10, color: COLORS.muted, marginBottom: 4 },
  packPrice:     { fontSize: 14, fontWeight: '700', color: COLORS.text },
  packSaving:    { fontSize: 10, color: COLORS.green, marginTop: 2 },

  methodsRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  methodCard:    { flex: 1, minWidth: '22%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 10, alignItems: 'center', gap: 4 },
  methodCardActive:{ borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.06)' },
  methodIcon:    { fontSize: 22 },
  methodLabel:   { color: COLORS.muted, fontSize: 10, textAlign: 'center' },

  payBtn:        { marginTop: 16, borderRadius: 100, overflow: 'hidden' },
  payBtnGrad:    { paddingVertical: 16, alignItems: 'center' },
  payBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },

  benefitsCard:  { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 16, marginBottom: 8 },
  benefitsTitle: { color: COLORS.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  benefitRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  benefitCheck:  { width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center', justifyContent: 'center' },
  benefitCheckText:{ color: COLORS.green, fontSize: 10, fontWeight: '700' },
  benefitText:   { color: COLORS.text, fontSize: 13 },

  plansRow:      { flexDirection: 'row', gap: 10 },
  planCard:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 14, alignItems: 'center' },
  planCardActive:{ borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.08)' },
  planLabel:     { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  planPrice:     { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  planSaving:    { fontSize: 10, color: COLORS.green },

  secureNote:    { textAlign: 'center', color: COLORS.muted2, fontSize: 11, marginTop: 24 },
});
