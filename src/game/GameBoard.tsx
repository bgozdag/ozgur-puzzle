import * as Haptics from 'expo-haptics';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { ART_SIZE, DinoSvg } from '../dinos/DinoArt';
import type { Dino } from '../dinos/types';
import { playSound } from '../sound';
import { COLORS } from '../theme';
import { DanceStage } from './Celebration';
import { pieceGrid, shuffle } from './layout';
import { PuzzlePiece, type BoardRect, type Point } from './PuzzlePiece';
import type { PieceCount } from './scoring';

type Props = {
  dino: Dino;
  pieces: PieceCount;
  done: boolean;
  onProgress: (placed: number) => void;
  onComplete: () => void;
  onDinoTap: () => void;
  /** Puzzle bittiğinde parça alanında gösterilecek içerik (sonuç kartı) */
  renderResult: (area: { x: number; y: number; w: number; h: number }) => ReactNode;
};

type Geometry = {
  board: BoardRect;
  tray: { x: number; y: number; w: number; h: number };
  trayScale: number;
  pieces: { id: number; w: number; h: number; viewBox: string; target: Point; start: Point }[];
};

function computeGeometry(area: { w: number; h: number }, count: PieceCount): Geometry {
  const size = Math.floor(Math.min(area.w - 24, area.h * 0.52));
  const board = { x: Math.round((area.w - size) / 2), y: 8, size };
  const trayY = board.y + size + 14;
  const tray = { x: 8, y: trayY, w: area.w - 16, h: area.h - trayY - 8 };

  const rects = pieceGrid(count).map((r) => ({ ...r, pw: r.w * size, ph: r.h * size }));
  const maxDim = Math.max(...rects.map((r) => Math.max(r.pw, r.ph)));
  // Parçalar parça alanına sığsın diye küçültülür; tutunca gerçek boyutlarına büyürler
  const fit = Math.sqrt((tray.w * tray.h * 0.6) / (size * size));
  const trayScale = Math.max(0.5, Math.min(1, fit, (tray.h * 0.8) / maxDim));

  const n = rects.length;
  const cols = Math.max(1, Math.round(Math.sqrt((n * tray.w) / tray.h)));
  const rows = Math.ceil(n / cols);
  const slotW = tray.w / cols;
  const slotH = tray.h / rows;
  const order = shuffle(rects.map((r) => r.id));
  const starts = new Map<number, Point>();
  order.forEach((id, k) => {
    const r = rects[id];
    const hw = (r.pw * trayScale) / 2;
    const hh = (r.ph * trayScale) / 2;
    let cx = tray.x + slotW * ((k % cols) + 0.5) + (Math.random() - 0.5) * slotW * 0.3;
    let cy = tray.y + slotH * (Math.floor(k / cols) + 0.5) + (Math.random() - 0.5) * slotH * 0.3;
    cx = Math.min(Math.max(cx, tray.x + hw), tray.x + tray.w - hw);
    cy = Math.min(Math.max(cy, tray.y + hh), tray.y + tray.h - hh);
    starts.set(id, { x: cx - r.pw / 2, y: cy - r.ph / 2 });
  });

  return {
    board,
    tray,
    trayScale,
    pieces: rects.map((r) => ({
      id: r.id,
      w: r.pw,
      h: r.ph,
      viewBox: `${r.x * ART_SIZE} ${r.y * ART_SIZE} ${r.w * ART_SIZE} ${r.h * ART_SIZE}`,
      target: { x: board.x + r.x * size, y: board.y + r.y * size },
      start: starts.get(r.id)!,
    })),
  };
}

export function GameBoard({ dino, pieces, done, onProgress, onComplete, onDinoTap, renderResult }: Props) {
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);
  const placed = useRef(new Set<number>());

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // İlk ölçüm sabit kalır ki parçalar oyun sırasında yer değiştirmesin
    setArea((prev) => prev ?? { w: width, h: height });
  };

  const geo = useMemo(() => (area ? computeGeometry(area, pieces) : null), [area, pieces]);

  const handlePlaced = useCallback(
    (id: number) => {
      if (placed.current.has(id)) return;
      placed.current.add(id);
      playSound('snap');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onProgress(placed.current.size);
      if (placed.current.size === pieces) onComplete();
    },
    [onProgress, onComplete, pieces],
  );

  const handleGrab = useCallback(() => playSound('pick'), []);

  return (
    <View style={styles.area} onLayout={onLayout}>
      {geo && area && (
        <>
          <View style={[styles.board, { left: geo.board.x, top: geo.board.y, width: geo.board.size, height: geo.board.size }]}>
            {!done && (
              <>
                <DinoSvg dino={dino} width={geo.board.size} style={{ opacity: 0.22 }} />
                <Svg width={geo.board.size} height={geo.board.size} style={StyleSheet.absoluteFill}>
                  {geo.pieces.map((p) => (
                    <Rect
                      key={p.id}
                      x={p.target.x - geo.board.x}
                      y={p.target.y - geo.board.y}
                      width={p.w}
                      height={p.h}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeDasharray="6 5"
                    />
                  ))}
                </Svg>
              </>
            )}
          </View>

          {!done && <View style={[styles.tray, { left: geo.tray.x, top: geo.tray.y, width: geo.tray.w, height: geo.tray.h }]} />}

          {!done &&
            geo.pieces.map((p) => (
              <PuzzlePiece
                key={p.id}
                id={p.id}
                dino={dino}
                width={p.w}
                height={p.h}
                viewBox={p.viewBox}
                target={p.target}
                start={p.start}
                trayScale={geo.trayScale}
                area={area}
                board={geo.board}
                onGrab={handleGrab}
                onPlaced={handlePlaced}
              />
            ))}

          {done && (
            <>
              <View style={{ position: 'absolute', left: geo.board.x, top: geo.board.y }}>
                <DanceStage dino={dino} size={geo.board.size} onTap={onDinoTap} />
              </View>
              {renderResult(geo.tray)}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1 },
  board: {
    position: 'absolute',
    backgroundColor: COLORS.board,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0,
  },
  tray: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 2,
    borderColor: 'rgba(139,108,240,0.18)',
    borderStyle: 'dashed',
  },
});
