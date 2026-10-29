import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton, StarIcon, Txt } from '../components/ui';
import { DinoSvg } from '../dinos/DinoArt';
import { DINOS } from '../dinos/data';
import { totalScore, useProfiles } from '../state/profiles';
import { COLORS, FONTS } from '../theme';

export default function NameScreen() {
  const { profiles, login, selectProfile, removeProfile, ready } = useProfiles();
  const [name, setName] = useState('');

  const start = () => {
    if (!name.trim()) return;
    login(name);
    setName('');
    router.push('/puzzles');
  };

  const pick = (id: string) => {
    selectProfile(id);
    router.push('/puzzles');
  };

  const confirmRemove = (id: string, profileName: string) => {
    Alert.alert('Oyuncuyu sil', `${profileName} ve tüm puanları silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => removeProfile(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Txt bold style={styles.title}>
            Dino Yapboz
          </Txt>
          <View style={styles.hero}>
            <DinoSvg dino={DINOS[0]} width={220} />
          </View>

          <Txt bold style={styles.label}>
            Adın ne?
          </Txt>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Adını yaz"
            placeholderTextColor="#B4A8CC"
            style={styles.input}
            maxLength={16}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={start}
          />
          <BigButton label="Haydi Başla!" onPress={start} disabled={!name.trim()} color={COLORS.green} shade={COLORS.greenDark} style={styles.startBtn} />

          {ready && profiles.length > 0 && (
            <View style={styles.players}>
              <Txt style={styles.playersTitle}>Daha önce oynayanlar</Txt>
              <View style={styles.chips}>
                {profiles.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => pick(p.id)}
                    onLongPress={() => confirmRemove(p.id, p.name)}
                    style={({ pressed }) => [styles.chip, pressed && { transform: [{ scale: 0.95 }] }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name} olarak oyna`}
                  >
                    <Txt bold style={styles.chipName}>
                      {p.name}
                    </Txt>
                    <View style={styles.chipScore}>
                      <StarIcon size={16} />
                      <Txt style={styles.chipScoreText}>{totalScore(p)}</Txt>
                    </View>
                  </Pressable>
                ))}
              </View>
              <Txt style={styles.hint}>Silmek için isme basılı tut</Txt>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 24, alignItems: 'center' },
  title: { fontSize: 44, lineHeight: 56, color: COLORS.orange, marginTop: 8 },
  hero: { borderRadius: 32, overflow: 'hidden', marginVertical: 12, borderWidth: 5, borderColor: '#FFFFFF' },
  label: { fontSize: 26, lineHeight: 34, marginTop: 8 },
  input: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#EBDDBA',
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 6,
  },
  startBtn: { marginTop: 16, width: '100%', maxWidth: 360 },
  players: { marginTop: 28, width: '100%', maxWidth: 420, alignItems: 'center' },
  playersTitle: { fontSize: 18, color: COLORS.sub },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 8 },
  chip: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#E6D8B5',
  },
  chipName: { fontSize: 20, lineHeight: 28, color: COLORS.purple },
  chipScore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipScoreText: { fontSize: 14, color: COLORS.sub },
  hint: { fontSize: 13, color: COLORS.sub, marginTop: 8 },
});
