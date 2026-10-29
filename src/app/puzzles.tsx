import { Redirect, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckBadge, LockIcon, ScorePill, StarRow, Txt } from '../components/ui';
import { DinoSvg } from '../dinos/DinoArt';
import { DINOS } from '../dinos/data';
import type { Dino } from '../dinos/types';
import { bestStars, isSolved, isUnlocked, totalScore, useProfiles } from '../state/profiles';
import { COLORS } from '../theme';

const GAP = 12;
const PADDING = 16;

export default function PuzzleListScreen() {
  const { current } = useProfiles();
  const { width } = useWindowDimensions();
  const [message, setMessage] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  if (!current) return <Redirect href="/" />;

  const columns = width >= 700 ? 5 : width >= 520 ? 4 : 3;
  const cardWidth = Math.floor((width - PADDING * 2 - GAP * (columns - 1)) / columns);
  const solvedCount = DINOS.filter((d) => isSolved(current, d.id)).length;

  const showLockedMessage = () => {
    setMessage('Bu puzzle kilitli! Önce bir öncekini tamamla.');
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setMessage(null), 2200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Txt bold style={styles.hello} numberOfLines={1}>
            Merhaba {current.name}!
          </Txt>
          <Txt style={styles.progress}>
            {solvedCount} / {DINOS.length} dinozor tamamlandı
          </Txt>
        </View>
        <ScorePill score={totalScore(current)} />
      </View>
      <Pressable onPress={() => router.dismissTo('/')} style={styles.switch} hitSlop={8} accessibilityRole="button">
        <Txt style={styles.switchText}>Oyuncu değiştir</Txt>
      </Pressable>

      <FlatList
        data={DINOS}
        key={columns}
        numColumns={columns}
        keyExtractor={(d) => d.id}
        contentContainerStyle={{ padding: PADDING, paddingBottom: 40, gap: GAP }}
        columnWrapperStyle={{ gap: GAP }}
        renderItem={({ item, index }) => {
          const solved = isSolved(current, item.id);
          const unlocked = isUnlocked(current, index);
          return (
            <PuzzleCard
              dino={item}
              index={index}
              width={cardWidth}
              solved={solved}
              unlocked={unlocked}
              stars={bestStars(current, item.id)}
              onPress={() => (unlocked ? router.push(`/puzzle/${item.id}`) : showLockedMessage())}
            />
          );
        }}
      />

      {message && (
        <View style={styles.toast} pointerEvents="none">
          <Txt bold style={styles.toastText}>
            {message}
          </Txt>
        </View>
      )}
    </SafeAreaView>
  );
}

function PuzzleCard({
  dino,
  index,
  width,
  solved,
  unlocked,
  stars,
  onPress,
}: {
  dino: Dino;
  index: number;
  width: number;
  solved: boolean;
  unlocked: boolean;
  stars: number;
  onPress: () => void;
}) {
  const shake = useState(() => new Animated.Value(0))[0];
  const pulse = useState(() => new Animated.Value(1))[0];
  const isNext = unlocked && !solved;

  useEffect(() => {
    if (!isNext) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isNext, pulse]);

  const press = () => {
    if (!unlocked) {
      Animated.sequence(
        [10, -10, 8, -8, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true })),
      ).start();
    }
    onPress();
  };

  const imageSize = width - 12;
  return (
    <Animated.View style={{ transform: [{ translateX: shake }, { scale: pulse }] }}>
      <Pressable
        onPress={press}
        accessibilityRole="button"
        accessibilityLabel={unlocked ? `${dino.name} puzzle` : `${index + 1}. puzzle kilitli`}
        style={({ pressed }) => [
          styles.card,
          { width },
          isNext && styles.cardNext,
          solved && styles.cardSolved,
          pressed && unlocked && { transform: [{ scale: 0.95 }] },
        ]}
      >
        <View style={[styles.thumb, { width: imageSize, height: imageSize }]}>
          <DinoSvg dino={dino} width={imageSize} style={!unlocked ? { opacity: 0.25 } : undefined} />
          {!unlocked && (
            <View style={[StyleSheet.absoluteFill, styles.lockOverlay]}>
              <LockIcon size={Math.min(44, imageSize * 0.4)} />
            </View>
          )}
        </View>
        <Txt bold style={[styles.cardName, !unlocked && { color: '#A79DBD' }]} numberOfLines={1}>
          {unlocked ? dino.name : `${index + 1}`}
        </Txt>
        {solved ? <StarRow count={stars} size={14} /> : <View style={{ height: 14 }} />}
        {solved && (
          <View style={styles.badge}>
            <CheckBadge size={30} />
          </View>
        )}
        {isNext && (
          <View style={styles.newTag}>
            <Txt bold style={styles.newTagText}>
              Sıradaki
            </Txt>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: PADDING, paddingTop: 8, gap: 12 },
  hello: { fontSize: 28, lineHeight: 38, color: COLORS.purple },
  progress: { fontSize: 15, color: COLORS.sub, marginTop: -4 },
  switch: { alignSelf: 'flex-start', marginLeft: PADDING, marginTop: 2 },
  switchText: { fontSize: 14, color: COLORS.blueDark, textDecorationLine: 'underline' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 6,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#E6D8B5',
  },
  cardNext: { borderWidth: 3, borderColor: COLORS.orange, borderBottomWidth: 6, padding: 3 },
  cardSolved: { borderBottomColor: '#BFE8D2' },
  thumb: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#EEE8F7' },
  lockOverlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(225,219,238,0.55)' },
  cardName: { fontSize: 16, lineHeight: 22, marginTop: 4 },
  badge: { position: 'absolute', top: -8, right: -8 },
  newTag: { position: 'absolute', top: -10, left: -6, backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 8 },
  newTagText: { color: '#FFFFFF', fontSize: 12, lineHeight: 18 },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: COLORS.text,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: { color: '#FFFFFF', fontSize: 17, textAlign: 'center' },
});
