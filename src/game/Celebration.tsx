import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { DinoSvg } from '../dinos/DinoArt';
import type { Dino } from '../dinos/types';

/** Tamamlanan resimdeki dinozor, arka planın önünde dans eder. Dokununca takla atar. */
export function DanceStage({ dino, size, onTap }: { dino: Dino; size: number; onTap: () => void }) {
  const beat = useState(() => new Animated.Value(0))[0];
  const spin = useState(() => new Animated.Value(0))[0];
  const intro = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(intro, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.timing(beat, { toValue: 1, duration: 1100, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [beat, intro]);

  const tap = () => {
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }).start();
    onTap();
  };

  const steps = [0, 0.25, 0.5, 0.75, 1];
  const jump = beat.interpolate({ inputRange: steps, outputRange: [0, -size * 0.09, 0, -size * 0.09, 0] });
  const wiggle = beat.interpolate({ inputRange: steps, outputRange: ['0deg', '-9deg', '0deg', '9deg', '0deg'] });
  const squashY = beat.interpolate({ inputRange: [0, 0.07, 0.25, 0.43, 0.5, 0.57, 0.75, 0.93, 1], outputRange: [0.9, 1, 1.05, 1, 0.9, 1, 1.05, 1, 0.9] });
  const squashX = beat.interpolate({ inputRange: [0, 0.07, 0.25, 0.43, 0.5, 0.57, 0.75, 0.93, 1], outputRange: [1.08, 1, 0.97, 1, 1.08, 1, 0.97, 1, 1.08] });
  const spinDeg = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const sway = beat.interpolate({ inputRange: steps, outputRange: [0, -size * 0.04, 0, size * 0.04, 0] });

  return (
    <Pressable onPress={tap} style={{ width: size, height: size }} accessibilityLabel={`${dino.name} dans ediyor`}>
      <View style={[StyleSheet.absoluteFill, styles.frame]}>
        <DinoSvg dino={dino} width={size} layer="scene" />
      </View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: intro }, { translateY: jump }, { translateX: sway }, { rotate: spinDeg }] }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transformOrigin: '50% 82%', transform: [{ rotate: wiggle }, { scaleX: squashX }, { scaleY: squashY }] },
          ]}
        >
          <DinoSvg dino={dino} width={size} layer="character" />
        </Animated.View>
      </Animated.View>
      <MusicNotes size={size} />
    </Pressable>
  );
}

function MusicNotes({ size }: { size: number }) {
  const notes = useMemo(
    () => [
      { x: 0.12, delay: 0, glyph: '♪', color: '#FF5D8F' },
      { x: 0.78, delay: 500, glyph: '♫', color: '#6C63FF' },
      { x: 0.32, delay: 1000, glyph: '♪', color: '#FF8A3D' },
      { x: 0.62, delay: 1500, glyph: '♫', color: '#2EC4B6' },
    ],
    [],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {notes.map((n, i) => (
        <FloatingNote key={i} left={n.x * size} bottom={size * 0.35} rise={size * 0.4} delay={n.delay} glyph={n.glyph} color={n.color} />
      ))}
    </View>
  );
}

function FloatingNote({ left, bottom, rise, delay, glyph, color }: { left: number; bottom: number; rise: number; delay: number; glyph: string; color: string }) {
  const t = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, delay]);
  return (
    <Animated.Text
      style={[
        styles.note,
        {
          left,
          bottom,
          color,
          opacity: t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -rise] }) },
            { rotate: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-15deg', '15deg', '-10deg'] }) },
          ],
        },
      ]}
    >
      {glyph}
    </Animated.Text>
  );
}

const CONFETTI_COLORS = ['#FF5D8F', '#FFD23F', '#4CC38A', '#4FB0F0', '#8B6CF0', '#FF8A3D'];

/** Render sırasında kullanılabilen, her seferinde aynı sonucu veren sözde rastgele sayı (0..1) */
const noise = (i: number, k: number) => {
  const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

export function Confetti({ width, height, count = 40 }: { width: number; height: number; count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: noise(i, 1) * width,
        delay: noise(i, 2) * 1600,
        duration: 2200 + noise(i, 3) * 1800,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 8 + noise(i, 4) * 6,
        h: 5 + noise(i, 5) * 6,
        drift: (noise(i, 6) - 0.5) * 80,
        turns: 1 + noise(i, 7) * 3,
        round: i % 4 === 0,
      })),
    [width, count],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiBit key={i} {...p} height={height} />
      ))}
    </View>
  );
}

function ConfettiBit(p: { x: number; delay: number; duration: number; color: string; w: number; h: number; drift: number; turns: number; round: boolean; height: number }) {
  const t = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(t, { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
      { iterations: 3 },
    );
    loop.start();
    return () => loop.stop();
  }, [t, p.delay, p.duration]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: p.x,
        top: -20,
        width: p.w,
        height: p.round ? p.w : p.h,
        borderRadius: p.round ? p.w / 2 : 2,
        backgroundColor: p.color,
        opacity: t.interpolate({ inputRange: [0, 0.02, 0.9, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.height + 40] }) },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.drift, 0] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 * p.turns}deg`] }) },
        ],
      }}
    />
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 12, overflow: 'hidden' },
  note: { position: 'absolute', fontSize: 34, fontWeight: '800' },
});
