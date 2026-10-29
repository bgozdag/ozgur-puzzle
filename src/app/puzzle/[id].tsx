import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';

import { BackIcon, BigButton, RoundIconButton, StarRow, Txt } from '../../components/ui';
import { DinoSvg } from '../../dinos/DinoArt';
import { DINOS, getDino } from '../../dinos/data';
import { pieceGrid } from '../../game/layout';
import { PIECE_COUNTS, SCORING, formatMinutes, formatTime, type PieceCount } from '../../game/scoring';
import { isUnlocked, useProfiles } from '../../state/profiles';
import { COLORS } from '../../theme';

const BUTTON_COLORS: Record<PieceCount, [string, string]> = {
  8: [COLORS.green, COLORS.greenDark],
  14: [COLORS.blue, COLORS.blueDark],
  20: [COLORS.orange, COLORS.orangeDark],
  32: [COLORS.purple, COLORS.purpleDark],
};

const LEVEL_NAMES: Record<PieceCount, string> = { 8: 'Kolay', 14: 'Orta', 20: 'Zor', 32: 'Çok zor' };

export default function PieceSelectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { current } = useProfiles();
  const { width } = useWindowDimensions();
  const dino = getDino(id ?? '');
  const index = DINOS.findIndex((d) => d.id === id);

  if (!current) return <Redirect href="/" />;
  if (!dino || !isUnlocked(current, index)) return <Redirect href="/puzzles" />;

  const results = current.results[dino.id] ?? {};
  const preview = Math.min(width - 120, 260);
  const buttonWidth = Math.min((width - 16 * 2 - 12) / 2, 220);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <RoundIconButton onPress={() => router.back()} label="Geri">
          <BackIcon />
        </RoundIconButton>
        <Txt bold style={styles.title} numberOfLines={1}>
          {dino.name}
        </Txt>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.preview}>
          <DinoSvg dino={dino} width={preview} />
        </View>

        <Txt bold style={styles.question}>
          Kaç parça olsun?
        </Txt>

        <View style={styles.grid}>
          {PIECE_COUNTS.map((n) => {
            const best = results[n];
            const [color, shade] = BUTTON_COLORS[n];
            return (
              <BigButton
                key={n}
                onPress={() => router.push({ pathname: '/play/[id]', params: { id: dino.id, pieces: String(n) } })}
                color={color}
                shade={shade}
                style={[styles.countBtn, { width: buttonWidth }]}
                accessibilityLabel={`${n} parça`}
              >
                <View style={styles.countInner}>
                  <MiniGrid count={n} />
                  <View>
                    <Txt bold style={styles.countNumber}>
                      {n}
                    </Txt>
                    <Txt style={styles.countLabel}>parça</Txt>
                  </View>
                </View>
                <View style={styles.countFooter}>
                  {best ? <StarRow count={best.stars} size={16} /> : <Txt style={styles.levelName}>{LEVEL_NAMES[n]}</Txt>}
                </View>
              </BigButton>
            );
          })}
        </View>

        <View style={styles.table}>
          <Txt bold style={styles.tableTitle}>
            Puan tablosu
          </Txt>
          <View style={styles.tableHead}>
            <Txt style={[styles.cell, styles.cellFirst, styles.headText]}>Parça</Txt>
            <Txt style={[styles.cell, styles.headText]}>⭐⭐⭐</Txt>
            <Txt style={[styles.cell, styles.headText]}>⭐⭐</Txt>
            <Txt style={[styles.cell, styles.headText]}>⭐</Txt>
            <Txt style={[styles.cell, styles.headText]}>Rekor</Txt>
          </View>
          {PIECE_COUNTS.map((n) => {
            const { base, targetSeconds } = SCORING[n];
            const best = results[n];
            return (
              <View key={n} style={styles.row}>
                <Txt bold style={[styles.cell, styles.cellFirst]}>
                  {n}
                </Txt>
                <View style={styles.cellBox}>
                  <Txt bold style={styles.points}>
                    {base * 3}
                  </Txt>
                  <Txt style={styles.small}>{formatMinutes(targetSeconds)} içinde</Txt>
                </View>
                <View style={styles.cellBox}>
                  <Txt bold style={styles.points}>
                    {base * 2}
                  </Txt>
                  <Txt style={styles.small}>{formatMinutes(targetSeconds * 2)} içinde</Txt>
                </View>
                <View style={styles.cellBox}>
                  <Txt bold style={styles.points}>
                    {base}
                  </Txt>
                  <Txt style={styles.small}>daha uzun</Txt>
                </View>
                <View style={styles.cellBox}>
                  {best ? (
                    <>
                      <Txt bold style={[styles.points, { color: COLORS.greenDark }]}>
                        {best.score}
                      </Txt>
                      <Txt style={styles.small}>{formatTime(best.seconds)}</Txt>
                    </>
                  ) : (
                    <Txt style={styles.small}>–</Txt>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniGrid({ count }: { count: PieceCount }) {
  const size = 40;
  return (
    <Svg width={size} height={size}>
      {pieceGrid(count).map((r) => (
        <Rect
          key={r.id}
          x={r.x * size + 1}
          y={r.y * size + 1}
          width={r.w * size - 2}
          height={r.h * size - 2}
          rx={1.5}
          fill="rgba(255,255,255,0.85)"
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 },
  title: { flex: 1, textAlign: 'center', fontSize: 30, lineHeight: 40, color: COLORS.purple },
  content: { alignItems: 'center', padding: 16, paddingBottom: 40 },
  preview: { borderRadius: 24, overflow: 'hidden', borderWidth: 5, borderColor: '#FFFFFF' },
  question: { fontSize: 26, lineHeight: 34, marginTop: 14, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  countBtn: { minHeight: 96, flexDirection: 'column', paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  countInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countNumber: { color: '#FFFFFF', fontSize: 34, lineHeight: 38 },
  countLabel: { color: '#FFFFFF', fontSize: 15, lineHeight: 18 },
  countFooter: { height: 22, justifyContent: 'center' },
  levelName: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, opacity: 0.9 },
  table: { marginTop: 24, backgroundColor: COLORS.card, borderRadius: 18, padding: 12, width: '100%', maxWidth: 480 },
  tableTitle: { fontSize: 18, lineHeight: 26, marginBottom: 4, textAlign: 'center' },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EEE4CC', paddingBottom: 4 },
  headText: { fontSize: 13, color: COLORS.sub, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F5EEDC' },
  cell: { flex: 1, textAlign: 'center', fontSize: 16 },
  cellFirst: { flex: 0.7 },
  cellBox: { flex: 1, alignItems: 'center' },
  points: { fontSize: 16, lineHeight: 20, color: COLORS.orangeDark },
  small: { fontSize: 11, lineHeight: 14, color: COLORS.sub },
});
