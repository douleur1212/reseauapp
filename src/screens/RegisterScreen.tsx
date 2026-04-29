// ══════════════════════════════════════════════════
//  RÉSEAU — Écran Inscription (6 étapes)
//  Validation : email uniquement (Supabase Auth)
//  Téléphone : obligatoire, collecté mais pas vérifié SMS
// ══════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { register } from '@services/auth';
import { COLORS, SPACING, RADIUS } from '@constants/theme';
import { ALL_LANGS, ALL_INTERESTS, DIAL_CODES, REGISTRATION_STEPS } from '@constants/config';
import type { RegisterData } from '@/types';

const INITIAL: RegisterData = {
  prenom: '', nom: '', age: '', genre: '',
  taille: '', poids: '', religion: '',
  skin: '', eyes: '', hair: '', ethn: '',
  langs: [], prefs: [], relPref: '',
  sg: 'F', ar: '18-35 ans', sz: 'Monde entier', rt: 'Relation sérieuse',
  country: '', city: '', email: '', password: '',
  phoneNum: '', dialCode: '+237', bio: '',
  photos: [], mainIdx: 0,
};

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [step, setStep]       = useState(1);
  const [data, setData]       = useState<RegisterData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  function update(fields: Partial<RegisterData>) {
    setData(prev => ({ ...prev, ...fields }));
  }

  function toggleChip(field: 'langs' | 'prefs', value: string) {
    const current = data[field] as string[];
    update({
      [field]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value],
    });
  }

  function validateStep(): boolean {
    switch (step) {
      case 1:
        if (!data.prenom || !data.nom || !data.age || !data.genre) {
          Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.'); return false;
        }
        if (Number(data.age) < 18) {
          Alert.alert('Âge minimum', 'Vous devez avoir au moins 18 ans.'); return false;
        }
        return true;
      case 2:
        if (!data.skin || !data.eyes || !data.hair) {
          Alert.alert('Champs requis', 'Remplissez les champs de description physique.'); return false;
        }
        return true;
      case 3:
        if (data.langs.length === 0) {
          Alert.alert('Langues requises', 'Sélectionnez au moins une langue.'); return false;
        }
        return true;
      case 4: return true;
      case 5:
        if (!data.email || !data.password) {
          Alert.alert('Champs requis', 'Email et mot de passe sont obligatoires.'); return false;
        }
        if (!data.phoneNum) {
          Alert.alert('Téléphone requis', 'Votre numéro de téléphone est obligatoire.'); return false;
        }
        if (data.password.length < 6) {
          Alert.alert('Mot de passe trop court', 'Minimum 6 caractères.'); return false;
        }
        if (!/\S+@\S+\.\S+/.test(data.email)) {
          Alert.alert('Email invalide', 'Entrez un email valide.'); return false;
        }
        if (data.phoneNum.replace(/\D/g, '').length < 6) {
          Alert.alert('Téléphone invalide', 'Entrez un numéro valide.'); return false;
        }
        return true;
      case 6:
        if (data.photos.length < 4) {
          Alert.alert('Photos requises', `Ajoutez au moins 4 photos. (${data.photos.length}/4)`); return false;
        }
        return true;
      default: return true;
    }
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [3, 4], quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      update({ photos: [...data.photos, result.assets[0].uri] });
    }
  }

  async function handleFinish() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await register(data);
      Alert.alert(
        '✉️ Confirmez votre email',
        `Bienvenue ${data.prenom} !\n\nUn lien de confirmation a été envoyé à :\n${data.email}\n\nCliquez sur ce lien pour activer votre compte.`,
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep(s => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function renderStep() {
    switch (step) {
      case 1: return <Step1 data={data} update={update} />;
      case 2: return <Step2 data={data} update={update} />;
      case 3: return <Step3 data={data} toggleChip={toggleChip} update={update} />;
      case 4: return <Step4 data={data} update={update} />;
      case 5: return <Step5 data={data} update={update} />;
      case 6: return <Step6 data={data} onPickPhoto={pickPhoto} update={update} />;
      default: return null;
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.dark3, COLORS.dark]} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}>
            <Text style={styles.backBtn}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
        </View>

        <View style={styles.progress}>
          {Array.from({ length: REGISTRATION_STEPS }).map((_, i) => (
            <View key={i} style={[
              styles.progressDot,
              i + 1 < step  && styles.progressDone,
              i + 1 === step && styles.progressActive,
            ]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Étape {step}/{REGISTRATION_STEPS}</Text>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {renderStep()}

          {step < 6 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep} disabled={loading}>
              <LinearGradient colors={[COLORS.rose, COLORS.rose2]} style={styles.nextBtnGrad}>
                <Text style={styles.nextBtnText}>Suivant →</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleFinish} disabled={loading}>
              <LinearGradient colors={[COLORS.rose, COLORS.violet]} style={styles.nextBtnGrad}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.nextBtnText}>Créer mon compte ✦</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Déjà inscrit ? Se connecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ── Composants partagés ────────────────────────────

function Field({ children }: { children: React.ReactNode }) {
  return <View style={styles.field}>{children}</View>;
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {children}{required && <Text style={{ color: COLORS.rose }}> *</Text>}
    </Text>
  );
}

function StyledInput({ value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline }: any) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor={COLORS.muted}
      keyboardType={keyboardType} secureTextEntry={secureTextEntry}
      multiline={multiline} autoCapitalize="none"
    />
  );
}

function Select({ label, options, value, onSelect }: { label: string; options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.selectWrap}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectScroll}>
        {options.map(opt => (
          <TouchableOpacity key={opt}
            style={[styles.selectOption, value === opt && styles.selectOptionActive]}
            onPress={() => onSelect(opt)}>
            <Text style={[styles.selectOptionText, value === opt && styles.selectOptionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function ChipGroup({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <View style={styles.chips}>
      {items.map(item => (
        <TouchableOpacity key={item}
          style={[styles.chip, selected.includes(item) && styles.chipActive]}
          onPress={() => onToggle(item)}>
          <Text style={[styles.chipText, selected.includes(item) && styles.chipTextActive]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Étapes ─────────────────────────────────────────

function Step1({ data, update }: any) {
  return (
    <>
      <Text style={styles.stepTitle}>Étape 1 — Identité</Text>
      <View style={styles.row}>
        <Field><FieldLabel required>Prénom</FieldLabel><StyledInput value={data.prenom} onChangeText={(v: string) => update({ prenom: v })} placeholder="Prénom" /></Field>
        <Field><FieldLabel required>Nom</FieldLabel><StyledInput value={data.nom} onChangeText={(v: string) => update({ nom: v })} placeholder="Nom" /></Field>
      </View>
      <View style={styles.row}>
        <Field><FieldLabel required>Âge (18+)</FieldLabel><StyledInput value={data.age} onChangeText={(v: string) => update({ age: v })} placeholder="25" keyboardType="number-pad" /></Field>
        <Field>
          <FieldLabel required>Genre</FieldLabel>
          <View style={styles.genderRow}>
            {[['H','Homme'],['F','Femme'],['NB','Non-binaire']].map(([v,l]) => (
              <TouchableOpacity key={v} style={[styles.genderBtn, data.genre===v && styles.genderBtnActive]} onPress={() => update({ genre: v })}>
                <Text style={[styles.genderText, data.genre===v && styles.genderTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>
      </View>
      <Select label="Religion" options={['Chrétien·ne','Musulman·e','Juif·ve','Bouddhiste','Athée','Agnostique','Autre']} value={data.religion} onSelect={(v) => update({ religion: v })} />
    </>
  );
}

function Step2({ data, update }: any) {
  return (
    <>
      <Text style={styles.stepTitle}>Étape 2 — Apparence</Text>
      <Select label="Couleur de peau *" options={['Très claire','Claire','Dorée / Mate','Café au lait','Brune','Noire','Autre']} value={data.skin} onSelect={(v) => update({ skin: v })} />
      <Select label="Couleur des yeux *" options={['Noirs','Marrons','Noisette','Verts','Bleus','Gris','Autre']} value={data.eyes} onSelect={(v) => update({ eyes: v })} />
      <Select label="Couleur des cheveux *" options={['Noirs','Bruns','Châtains','Blonds','Roux','Gris / Blancs','Teintés','Rasés']} value={data.hair} onSelect={(v) => update({ hair: v })} />
      <Select label="Appartenance ethnique" options={['Africaine','Afro-caribéenne','Arabe','Asiatique','Caucasienne','Latino-américaine','Métisse','Autre']} value={data.ethn} onSelect={(v) => update({ ethn: v })} />
    </>
  );
}

function Step3({ data, toggleChip, update }: any) {
  return (
    <>
      <Text style={styles.stepTitle}>Étape 3 — Langues & Intérêts</Text>
      <FieldLabel required>Langues parlées</FieldLabel>
      <ChipGroup items={ALL_LANGS} selected={data.langs} onToggle={(v) => toggleChip('langs', v)} />
      <FieldLabel>Activités préférées</FieldLabel>
      <ChipGroup items={ALL_INTERESTS} selected={data.prefs} onToggle={(v) => toggleChip('prefs', v)} />
      <Select label="Religion partenaire souhaitée" options={['Indifférent','Chrétien·ne','Musulman·e','Juif·ve','Bouddhiste','Athée / Agnostique']} value={data.relPref} onSelect={(v) => update({ relPref: v })} />
    </>
  );
}

function Step4({ data, update }: any) {
  return (
    <>
      <Text style={styles.stepTitle}>Étape 4 — Ma recherche</Text>
      <Select label="Je cherche" options={['Un homme','Une femme','Les deux']} value={data.sg==='H'?'Un homme':data.sg==='F'?'Une femme':'Les deux'} onSelect={(v) => update({ sg: v==='Un homme'?'H':v==='Une femme'?'F':'T' })} />
      <Select label="Tranche d'âge" options={['18-25 ans','20-30 ans','25-35 ans','28-40 ans','30-45 ans','35-50 ans','Tout âge']} value={data.ar} onSelect={(v) => update({ ar: v })} />
      <Select label="Zone recherchée" options={['Monde entier','France','Belgique','Suisse','Canada','Afrique francophone','Maghreb','Europe']} value={data.sz} onSelect={(v) => update({ sz: v })} />
      <Select label="Type de relation" options={['Relation sérieuse','Amitié / Rencontre','Ouvert à tout']} value={data.rt} onSelect={(v) => update({ rt: v })} />
    </>
  );
}

function Step5({ data, update }: any) {
  return (
    <>
      <Text style={styles.stepTitle}>Étape 5 — Coordonnées</Text>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Votre email et téléphone ne sont jamais visibles par les autres membres.
        </Text>
      </View>

      <View style={styles.row}>
        <Field><FieldLabel>Pays</FieldLabel><StyledInput value={data.country} onChangeText={(v: string) => update({ country: v })} placeholder="Pays" /></Field>
        <Field><FieldLabel>Ville</FieldLabel><StyledInput value={data.city} onChangeText={(v: string) => update({ city: v })} placeholder="Votre ville" /></Field>
      </View>

      <Field>
        <FieldLabel required>Email</FieldLabel>
        <StyledInput value={data.email} onChangeText={(v: string) => update({ email: v })} placeholder="email@exemple.com" keyboardType="email-address" />
        <Text style={styles.fieldHint}>Un lien de confirmation vous sera envoyé par email.</Text>
      </Field>

      {/* Téléphone — obligatoire, sans vérification SMS */}
      <View style={styles.field}>
        <FieldLabel required>Numéro de téléphone</FieldLabel>
        <ScrollView horizontal style={styles.dialScroll} showsHorizontalScrollIndicator={false}>
          {DIAL_CODES.map(d => (
            <TouchableOpacity key={d.code + d.country}
              style={[styles.dialBtn, data.dialCode === d.code && styles.dialBtnActive]}
              onPress={() => update({ dialCode: d.code })}>
              <Text style={styles.dialBtnText}>{d.flag} {d.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.phoneInputRow}>
          <View style={styles.dialCodeDisplay}>
            <Text style={styles.dialCodeText}>{data.dialCode}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={data.phoneNum}
            onChangeText={(v: string) => update({ phoneNum: v.replace(/[^0-9]/g, '') })}
            placeholder="6 00 00 00 00"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
            maxLength={15}
          />
        </View>
        <Text style={styles.fieldHint}>🔒 Jamais partagé publiquement</Text>
      </View>

      <Field>
        <FieldLabel required>Mot de passe</FieldLabel>
        <StyledInput value={data.password} onChangeText={(v: string) => update({ password: v })} placeholder="Minimum 6 caractères" secureTextEntry />
      </Field>

      <Field>
        <FieldLabel>Bio (optionnel)</FieldLabel>
        <StyledInput value={data.bio} onChangeText={(v: string) => update({ bio: v })} placeholder="Qui êtes-vous ? Vos passions, vos valeurs… ✨" multiline />
      </Field>
    </>
  );
}

function Step6({ data, onPickPhoto, update }: any) {
  const filled = data.photos.filter(Boolean).length;
  return (
    <>
      <Text style={styles.stepTitle}>Étape 6 — Mes photos</Text>
      <View style={styles.photoProgress}>
        <Text style={styles.photoProgressText}>{filled}/4 minimum</Text>
        <View style={styles.photoProgressBar}>
          <View style={[styles.photoProgressFill, { width: `${Math.min(100, filled / 4 * 100)}%` }]} />
        </View>
        <Text style={[styles.photoProgressOk, { color: filled >= 4 ? COLORS.green : COLORS.rose }]}>
          {filled >= 4 ? '✓ OK' : 'Requis'}
        </Text>
      </View>
      <View style={styles.photoGrid}>
        {data.photos.map((uri: string, i: number) => (
          <View key={i} style={styles.photoSlot}>
            <Image source={{ uri }} style={styles.photoThumb} contentFit="cover" />
            {data.mainIdx === i && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>★</Text></View>}
            <TouchableOpacity style={styles.photoSetMain} onPress={() => update({ mainIdx: i })}>
              <Text style={styles.photoSetMainText}>Principale</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoDelete} onPress={() => update({ photos: data.photos.filter((_: any, idx: number) => idx !== i) })}>
              <Text style={styles.photoDeleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {data.photos.length < 6 && (
          <TouchableOpacity style={styles.photoAdd} onPress={onPickPhoto}>
            <Text style={styles.photoAddText}>＋</Text>
            <Text style={styles.photoAddLabel}>Ajouter</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.photoNote}>
        📸 Minimum 4 photos · Touchez "Principale" pour choisir votre photo de profil
        {filled >= 4 ? '\n✦ Profil certifié automatiquement !' : ''}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container:              { flex: 1 },
  header:                 { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingBottom: 8, gap: 12 },
  backBtn:                { color: COLORS.muted, fontSize: 14 },
  headerTitle:            { fontSize: 18, fontWeight: '700', color: '#fff' },
  progress:               { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 8 },
  progressDot:            { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressDone:           { backgroundColor: COLORS.rose2 },
  progressActive:         { backgroundColor: COLORS.rose, width: 22 },
  stepLabel:              { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  scroll:                 { padding: SPACING.md, paddingBottom: 40 },
  stepTitle:              { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  row:                    { flexDirection: 'row', gap: 12 },
  field:                  { flex: 1, marginBottom: 14 },
  label:                  { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  fieldHint:              { color: COLORS.muted2, fontSize: 11, marginTop: 5, lineHeight: 16 },
  input:                  { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  inputMulti:             { minHeight: 90, textAlignVertical: 'top' },
  genderRow:              { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  genderBtn:              { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' },
  genderBtnActive:        { borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.12)' },
  genderText:             { color: COLORS.muted, fontSize: 13 },
  genderTextActive:       { color: COLORS.rose },
  selectWrap:             { marginBottom: 14 },
  selectScroll:           { flexGrow: 0 },
  selectOption:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 8 },
  selectOptionActive:     { borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.12)' },
  selectOptionText:       { color: COLORS.muted, fontSize: 13 },
  selectOptionTextActive: { color: COLORS.rose },
  chips:                  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:                   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)' },
  chipActive:             { borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.12)' },
  chipText:               { color: COLORS.muted, fontSize: 12 },
  chipTextActive:         { color: COLORS.rose },
  privacyNote:            { backgroundColor: 'rgba(232,48,90,0.06)', borderWidth: 1, borderColor: 'rgba(232,48,90,0.2)', borderRadius: RADIUS.md, padding: 12, marginBottom: 14 },
  privacyText:            { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18 },
  dialScroll:             { marginBottom: 8 },
  dialBtn:                { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 6 },
  dialBtnActive:          { borderColor: COLORS.rose, backgroundColor: 'rgba(232,48,90,0.1)' },
  dialBtnText:            { color: COLORS.text, fontSize: 12 },
  phoneInputRow:          { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dialCodeDisplay:        { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 12, minWidth: 56, alignItems: 'center' },
  dialCodeText:           { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  phoneInput:             { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  nextBtn:                { marginTop: 20, borderRadius: 100, overflow: 'hidden' },
  nextBtnGrad:            { paddingVertical: 16, alignItems: 'center' },
  nextBtnText:            { color: '#fff', fontWeight: '700', fontSize: 15 },
  loginLink:              { alignItems: 'center', marginTop: 16 },
  loginLinkText:          { color: COLORS.muted, fontSize: 13, textDecorationLine: 'underline' },
  photoProgress:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  photoProgressText:      { color: COLORS.muted, fontSize: 12 },
  photoProgressBar:       { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 },
  photoProgressFill:      { height: 4, backgroundColor: COLORS.rose, borderRadius: 4 },
  photoProgressOk:        { fontSize: 12, fontWeight: '700' },
  photoGrid:              { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  photoSlot:              { width: '30%', aspectRatio: 3/4, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  photoThumb:             { ...StyleSheet.absoluteFillObject },
  mainBadge:              { position: 'absolute', top: 4, left: 4, backgroundColor: COLORS.gold, borderRadius: 100, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  mainBadgeText:          { color: '#fff', fontSize: 10 },
  photoSetMain:           { position: 'absolute', bottom: 22, left: 0, right: 0, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 3 },
  photoSetMainText:       { color: '#fff', fontSize: 9, fontWeight: '600' },
  photoDelete:            { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 100, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  photoDeleteText:        { color: '#fff', fontSize: 11 },
  photoAdd:               { width: '30%', aspectRatio: 3/4, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  photoAddText:           { color: COLORS.muted, fontSize: 28 },
  photoAddLabel:          { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  photoNote:              { color: COLORS.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
