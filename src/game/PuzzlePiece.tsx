import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';

import { DinoSvg } from '../dinos/DinoArt';
import type { Dino } from '../dinos/types';

export type Point = { x: number; y: number };
export type BoardRect = { x: number; y: number; size: number };

type Props = {
  id: number;
  dino: Dino;
  width: number;
  height: number;
  viewBox: string;
  /** Parçanın tahtadaki doğru yeri (sol üst köşe) */
  target: Point;
  start: Point;
  trayScale: number;
  area: { w: number; h: number };
  board: BoardRect;
  onGrab: () => void;
  onPlaced: (id: number) => void;
};

let zCounter = 10;

export const PuzzlePiece = memo(function PuzzlePiece(props: Props) {
  const { width: w, height: h, start, trayScale, dino, viewBox } = props;
  const pos = useState(() => new Animated.ValueXY(start))[0];
  const scale = useState(() => new Animated.Value(trayScale))[0];
  const [z, setZ] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [placed, setPlaced] = useState(false);

  const placedRef = useRef(false);
  const current = useRef<Point>(start);
  const home = useRef<Point>(start);
  const grabStart = useRef<Point>(start);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    const sub = pos.addListener((v) => {
      current.current = v;
    });
    return () => pos.removeListener(sub);
  }, [pos]);

  const responder = useMemo(() => {
    const settle = (dest: Point, toScale: number) => {
      Animated.parallel([
        Animated.spring(pos, { toValue: dest, useNativeDriver: false, friction: 7, tension: 80 }),
        Animated.spring(scale, { toValue: toScale, useNativeDriver: false, friction: 6 }),
      ]).start();
    };

    const drop = (dx: number, dy: number) => {
      const { target, board, area } = propsRef.current;
      const x = grabStart.current.x + dx;
      const y = grabStart.current.y + dy;
      setDragging(false);

      // Çocuklar için cömert bir yakalama mesafesi
      const snapDistance = Math.max(24, Math.min(w, h) * 0.38);
      if (Math.hypot(x - target.x, y - target.y) < snapDistance) {
        placedRef.current = true;
        setPlaced(true);
        settle(target, 1);
        propsRef.current.onPlaced(propsRef.current.id);
        return;
      }

      const cx = x + w / 2;
      const cy = y + h / 2;
      const overBoard = cx > board.x && cx < board.x + board.size && cy > board.y && cy < board.y + board.size;
      if (overBoard) {
        // Yanlış yere bırakıldı: parça hafifçe kenara geri döner
        settle(home.current, trayScale);
        return;
      }
      const hw = (w * trayScale) / 2;
      const hh = (h * trayScale) / 2;
      const ccx = Math.min(Math.max(cx, hw), area.w - hw);
      const ccy = Math.min(Math.max(cy, board.y + board.size + hh), area.h - hh);
      const dest = { x: ccx - w / 2, y: ccy - h / 2 };
      home.current = dest;
      settle(dest, trayScale);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !placedRef.current,
      onMoveShouldSetPanResponder: () => !placedRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        pos.stopAnimation();
        grabStart.current = { ...current.current };
        zCounter += 1;
        setZ(zCounter);
        setDragging(true);
        Animated.spring(scale, { toValue: 1.06, useNativeDriver: false, speed: 40 }).start();
        propsRef.current.onGrab();
      },
      onPanResponderMove: (_, g) => {
        pos.setValue({ x: grabStart.current.x + g.dx, y: grabStart.current.y + g.dy });
      },
      onPanResponderRelease: (_, g) => drop(g.dx, g.dy),
      onPanResponderTerminate: (_, g) => drop(g.dx, g.dy),
    });
  }, [pos, scale, w, h, trayScale]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.piece,
        {
          width: w,
          height: h,
          zIndex: placed ? 0 : z,
          transform: [{ translateX: pos.x }, { translateY: pos.y }, { scale }],
        },
        placed ? styles.placed : dragging ? styles.dragging : styles.loose,
      ]}
    >
      <PieceArt dino={dino} width={w} height={h} viewBox={viewBox} />
    </Animated.View>
  );
});

const PieceArt = memo(function PieceArt({ dino, width, height, viewBox }: { dino: Dino; width: number; height: number; viewBox: string }) {
  return <DinoSvg dino={dino} width={width} height={height} viewBox={viewBox} />;
});

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  loose: {
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  dragging: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFD23F',
  },
  placed: {
    borderRadius: 0,
    borderWidth: 0,
  },
});
