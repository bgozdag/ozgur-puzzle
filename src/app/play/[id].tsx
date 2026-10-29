import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackIcon, BigButton, RoundIconButton, StarIcon, Txt } from '../../components/ui';
import { DINOS, getDino } from '../../dinos/data';
import { Confetti } from '../../game/Celebration';
import { GameBoard } from '../../game/GameBoard';
import { formatTime, isPieceCount, type PieceCount } from '../../game/scoring';
import { playSound, stopSound } from '../../sound';
import { isUnlocked, useProfiles, type RecordOutcome } from '../../state/profiles';
import { COLORS } from '../../theme';

export default function PlayScreen() {
  const params = useLocalSearchParams<{ id: string; pieces: string }>();
  const { current, recordResult } = useProfiles();
  const { width, height } = useWindowDimensions();
  const dino = getDino(params.id ?? '');
  const pieces = Number(params.pieces);
  const index = DINOS.findIndex((d) => d.id === params.id);

  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [result, setResult] = useState<RecordOutcome | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      stopSound('celebrate');
    },
    [],
  );

  const handleComplete = () => {
    if (!dino || !isPieceCount(pieces)) return;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const outcome = recordResult(dino.id, pieces, seconds);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    celebrateTimer.current = setTimeout(() => {
      setResult(outcome);
      playSound('celebrate');
    }, 450);
  };

  if (!current) return <Redirect href="/" />;
  if (!dino || !isPieceCount(pieces) || !isUnlocked(current, index)) return <Redirect href="/puzzles" />;

  const nextDino = DINOS[index + 1];

  const replay = () => {
    stopSound('celebrate');
    setResult(null);
    setPlaced(0);
    setStartedAt(Date.now());
    setRound((r) => r + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <RoundIconButton onPress={() => router.back()} label="Geri">
          <BackIcon />
        </RoundIconButton>
        <View style={styles.headerMid}>
          <Txt bold style={styles.title} numberOfLines={1}>
            {dino.name}
          </Txt>
          <Txt style={styles.counter}>
            {placed} / {pieces} parça
          </Txt>
        </View>
        <Timer key={round} startedAt={startedAt} stoppedAt={result ? startedAt + result.seconds * 1000 : null} />
      </View>

      <GameBoard
        key={round}
        dino={dino}
        pieces={pieces as PieceCount}
        done={!!result}
        onProgress={setPlaced}
        onComplete={handleComplete}
        onDinoTap={() => playSound('celebrate')}
        renderResult={(area) =>
          result && (
            <View style={{ position: 'absolute', left: area.x, top: area.y, width: area.w, height: area.h }}>
              <ResultCard
                name={current.name}
                result={result}
                onReplay={replay}
                onList={() => router.dismissTo('/puzzles')}
                onNext={nextDino ? () => router.dismissTo({ pathname: '/puzzle/[id]', params: { id: nextDino.id } }) : undefined}
              />
            </View>
          )
        }
      />

      {result && <Confetti width={width} height={height} />}
    </SafeAreaView>
  );
}

function Timer({ startedAt, stoppedAt }: { startedAt: number; stoppedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (stoppedAt) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [stoppedAt]);
  const seconds = ((stoppedAt ?? now) - startedAt) / 1000;
  return (
    <View style={styles.timer}>
      <Txt bold style={styles.timerText}>
        ⏱ {formatTime(seconds)}
      </Txt>
    </View>
  );
}

function ResultCard({
  name,
  result,
  onReplay,
  onList,
  onNext,
}: {
  name: string;
  result: RecordOutcome;
  onReplay: () => void;
  onList: () => void;
  onNext?: () => void;
}) {
  const pop = useState(() => [0, 1, 2].map(() => new Animated.Value(0)))[0];
  const slide = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(slide, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    Animated.stagger(
      260,
      pop.map((v) => Animated.spring(v, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true })),
    ).start();
  }, [pop, slide]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] },
      ]}
    >
      <Txt bold style={styles.cardTitle} numberOfLines={1} adjustsFontSizeToFit>
        Harika, {name}!
      </Txt>
      <View style={styles.stars}>
        {pop.map((v, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: v }, { translateY: i === 1 ? -8 : 0 }] }}>
            <StarIcon size={i === 1 ? 54 : 44} filled={i < result.stars} />
          </Animated.View>
        ))}
      </View>
      <Txt bold style={styles.points}>
        +{result.score} puan
      </Txt>
      <Txt style={styles.time}>Süre: {formatTime(result.seconds)}</Txt>
      {result.isRecord && result.hadPrevious && (
        <View style={styles.record}>
          <Txt bold style={styles.recordText}>
            Yeni rekor!
          </Txt>
        </View>
      )}
      {!result.isRecord && <Txt style={styles.time}>Rekorun daha yüksek, tekrar dene!</Txt>}
      <View style={styles.actions}>
        <BigButton label="Tekrar" onPress={onReplay} color={COLORS.blue} shade={COLORS.blueDark} style={styles.action} textStyle={styles.actionText} />
        <BigButton label="Puzzle'lar" onPress={onList} color={COLORS.purple} shade={COLORS.purpleDark} style={styles.action} textStyle={styles.actionText} />
        {onNext && <BigButton label="Sonraki ▶" onPress={onNext} color={COLORS.green} shade={COLORS.greenDark} style={styles.action} textStyle={styles.actionText} />}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 10 },
  headerMid: { flex: 1, alignItems: 'center' },
  title: { fontSize: 24, lineHeight: 32, color: COLORS.purple },
  counter: { fontSize: 15, lineHeight: 18, color: COLORS.sub },
  timer: { backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, minWidth: 82, alignItems: 'center' },
  timerText: { fontSize: 18, lineHeight: 26 },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderBottomWidth: 6,
    borderBottomColor: '#E6D8B5',
  },
  cardTitle: { fontSize: 28, lineHeight: 36, color: COLORS.orange },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginVertical: 2 },
  points: { fontSize: 26, lineHeight: 34, color: COLORS.greenDark },
  time: { fontSize: 15, lineHeight: 20, color: COLORS.sub },
  record: { backgroundColor: COLORS.pink, borderRadius: 12, paddingHorizontal: 12, marginTop: 4 },
  recordText: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
  action: { minHeight: 48, paddingHorizontal: 14, borderRadius: 16, borderBottomWidth: 5 },
  actionText: { fontSize: 18, lineHeight: 24 },
});
