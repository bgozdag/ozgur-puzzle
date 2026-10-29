import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Polygon, Rect } from 'react-native-svg';

import type { SceneKind } from './types';

// ---------------- Küçük sahne parçaları ----------------

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Gökyüzü: üstten alta yumuşak renk bantları. SVG degradesi yerine bant kullanılır;
 * degrade kimlikleri (url(#id)) bazı ortamlarda yanlış çözümlenebiliyor.
 */
function Sky({ top, bottom }: { top: string; bottom: string }) {
  const bands = 12;
  return (
    <G>
      {Array.from({ length: bands }, (_, i) => (
        <Rect key={i} x={0} y={(300 / bands) * i} width={300} height={300 / bands + 1} fill={mix(top, bottom, i / (bands - 1))} />
      ))}
    </G>
  );
}

function Cloud({ x, y, s = 1, color = '#FFFFFF', opacity = 0.95 }: { x: number; y: number; s?: number; color?: string; opacity?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <Circle cx={0} cy={0} r={13} fill={color} />
      <Circle cx={17} cy={-7} r={17} fill={color} />
      <Circle cx={36} cy={0} r={13} fill={color} />
      <Rect x={0} y={-2} width={36} height={15} rx={6} fill={color} />
    </G>
  );
}

function Sun({ x, y, r, color = '#FFD93D', rays = true }: { x: number; y: number; r: number; color?: string; rays?: boolean }) {
  return (
    <G>
      {rays &&
        Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 * Math.PI) / 180;
          return (
            <Path
              key={i}
              d={`M ${x + Math.cos(a) * (r + 5)} ${y + Math.sin(a) * (r + 5)} L ${x + Math.cos(a) * (r + 14)} ${y + Math.sin(a) * (r + 14)}`}
              stroke={color}
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
        })}
      <Circle cx={x} cy={y} r={r} fill={color} />
      <Circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.3} fill="#FFFFFF" opacity={0.35} />
    </G>
  );
}

function starPath(x: number, y: number, r: number, inner = 0.45) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = ((-90 + i * 36) * Math.PI) / 180;
    pts.push(`${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(' ');
}

function Star({ x, y, r, color = '#FFE873' }: { x: number; y: number; r: number; color?: string }) {
  return <Polygon points={starPath(x, y, r)} fill={color} />;
}

function Flower({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M 0 0 L 0 14" stroke="#3E9B3A" strokeWidth={2.5} />
      {[0, 72, 144, 216, 288].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return <Circle key={deg} cx={Math.cos(a) * 5} cy={Math.sin(a) * 5} r={4.2} fill={color} />;
      })}
      <Circle cx={0} cy={0} r={3} fill="#FFE066" />
    </G>
  );
}

function Tree({ x, y, s = 1, color = '#4CAF50' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-6} y={-40} width={12} height={40} rx={4} fill="#8D5A3B" />
      <Circle cx={0} cy={-58} r={26} fill={color} />
      <Circle cx={-18} cy={-44} r={17} fill={color} />
      <Circle cx={18} cy={-44} r={17} fill={color} />
      <Circle cx={-8} cy={-66} r={8} fill="#FFFFFF" opacity={0.18} />
    </G>
  );
}

function Pine({ x, y, s = 1, color = '#2E8B57', snow = false }: { x: number; y: number; s?: number; color?: string; snow?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-5} y={-14} width={10} height={14} fill="#7A4A2A" />
      <Path d="M -30 -14 L 0 -48 L 30 -14 Z" fill={color} />
      <Path d="M -24 -36 L 0 -68 L 24 -36 Z" fill={color} />
      <Path d="M -17 -56 L 0 -84 L 17 -56 Z" fill={color} />
      {snow && (
        <G fill="#FFFFFF">
          <Path d="M -9 -71 L 0 -84 L 9 -71 Q 0 -66 -9 -71 Z" />
          <Path d="M -14 -50 L 0 -68 L 14 -50 Q 0 -45 -14 -50 Z" />
          <Path d="M -18 -28 L 0 -48 L 18 -28 Q 0 -22 -18 -28 Z" />
        </G>
      )}
    </G>
  );
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const leaf = '#3DBE5A';
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M -4 0 Q -10 -40 2 -82 L 10 -80 Q 2 -40 6 0 Z" fill="#B07A4A" />
      <Path d="M 5 -80 Q -20 -100 -46 -82 Q -20 -88 5 -76 Z" fill={leaf} />
      <Path d="M 5 -80 Q 30 -102 56 -84 Q 30 -88 5 -76 Z" fill={leaf} />
      <Path d="M 5 -80 Q -10 -112 -30 -110 Q -10 -96 3 -78 Z" fill={leaf} />
      <Path d="M 5 -80 Q 24 -114 42 -106 Q 22 -96 7 -78 Z" fill={leaf} />
      <Circle cx={0} cy={-76} r={5} fill="#7A4A2A" />
      <Circle cx={9} cy={-75} r={5} fill="#7A4A2A" />
    </G>
  );
}

function Cactus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const c = '#4CAF50';
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Rect x={-9} y={-62} width={18} height={62} rx={9} fill={c} />
      <Path d="M -9 -28 L -20 -28 Q -26 -28 -26 -34 L -26 -46" stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />
      <Path d="M 9 -36 L 20 -36 Q 26 -36 26 -42 L 26 -52" stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />
      <Circle cx={0} cy={-64} r={5} fill="#FF7FA8" />
    </G>
  );
}

function Bird({ x, y, color = '#3B2C5E' }: { x: number; y: number; color?: string }) {
  return <Path d={`M ${x} ${y} q 6 -6 12 0 q 6 -6 12 0`} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />;
}

function Fish({ x, y, color, flip = false }: { x: number; y: number; color: string; flip?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <Path d="M -14 0 L -24 -8 L -24 8 Z" fill={color} />
      <Ellipse cx={0} cy={0} rx={15} ry={9} fill={color} />
      <Circle cx={7} cy={-2} r={2.5} fill="#FFFFFF" />
      <Circle cx={7.6} cy={-2} r={1.3} fill="#222" />
    </G>
  );
}

function Balloon({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <G>
      <Path d={`M ${x} ${y + 22} Q ${x - 6} ${y + 40} ${x + 2} ${y + 60}`} stroke="#8A7F9E" strokeWidth={1.5} fill="none" />
      <Ellipse cx={x} cy={y} rx={17} ry={21} fill={color} />
      <Path d={`M ${x - 4} ${y + 21} L ${x + 4} ${y + 21} L ${x} ${y + 26} Z`} fill={color} />
      <Ellipse cx={x - 6} cy={y - 8} rx={4} ry={6} fill="#FFFFFF" opacity={0.45} />
    </G>
  );
}

function Grass({ y, color }: { y: number; color: string }) {
  const xs = [12, 48, 86, 128, 170, 214, 252, 288];
  return (
    <G>
      {xs.map((x, i) => (
        <Path key={i} d={`M ${x - 6} ${y + (i % 3) * 14} l 3 -9 l 3 7 l 3 -10 l 3 12`} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      ))}
    </G>
  );
}

const ground = (y: number, fill: string, wave = 12) => (
  <Path d={`M 0 ${y} Q 150 ${y - wave} 300 ${y + 2} L 300 300 L 0 300 Z`} fill={fill} />
);

// ---------------- Sahneler ----------------

type SceneFn = () => ReactElement;

const SCENES: Record<SceneKind, SceneFn> = {
  meadow: () => (
    <G>
      <Sky top="#8ED8FF" bottom="#DDF5FF" />
      <Sun x={250} y={52} r={22} />
      <Cloud x={30} y={60} />
      <Cloud x={140} y={36} s={0.75} />
      <Path d="M 0 212 Q 80 170 160 206 Q 230 176 300 200 L 300 300 L 0 300 Z" fill="#A6E38A" />
      {ground(240, '#6CC551')}
      <Grass y={256} color="#4FA43B" />
      <Flower x={28} y={268} color="#FF6B6B" />
      <Flower x={78} y={284} color="#FFD93D" />
      <Flower x={248} y={272} color="#FF8FC7" />
      <Flower x={208} y={290} color="#B983FF" />
      <Flower x={122} y={282} color="#FFFFFF" />
    </G>
  ),
  volcano: () => (
    <G>
      <Sky top="#FFB27A" bottom="#FFE6B8" />
      <Cloud x={196} y={64} s={0.9} color="#B8A9A0" />
      <Cloud x={216} y={36} s={0.7} color="#CFC3BC" />
      <Path d="M 140 236 L 196 112 L 226 112 L 296 236 Z" fill="#8A5A44" />
      <Path d="M 196 112 Q 211 100 226 112 L 222 136 Q 215 126 210 146 Q 204 128 200 134 Z" fill="#FF5A36" />
      <Circle cx={190} cy={86} r={5} fill="#FF7A3D" />
      <Circle cx={234} cy={78} r={4} fill="#FF7A3D" />
      <Path d="M 0 220 Q 50 196 100 222 L 100 300 L 0 300 Z" fill="#B97A55" />
      {ground(238, '#C98B5B')}
      <Ellipse cx={40} cy={272} rx={18} ry={9} fill="#A8714C" />
      <Ellipse cx={268} cy={282} rx={14} ry={7} fill="#A8714C" />
      <Ellipse cx={90} cy={290} rx={10} ry={5} fill="#A8714C" />
    </G>
  ),
  sunset: () => (
    <G>
      <Sky top="#FF9ECF" bottom="#FFD88A" />
      <Circle cx={150} cy={210} r={56} fill="#FFF1A8" opacity={0.9} />
      <Bird x={40} y={70} />
      <Bird x={74} y={52} />
      <Bird x={238} y={80} />
      <Cloud x={200} y={40} s={0.8} color="#FFE3F1" />
      <Path d="M 0 214 Q 70 178 140 210 Q 220 170 300 206 L 300 300 L 0 300 Z" fill="#B88BDF" />
      {ground(242, '#9467C9')}
      <Grass y={258} color="#7A50B0" />
    </G>
  ),
  tropical: () => (
    <G>
      <Sky top="#7FD3F7" bottom="#E6F8FF" />
      <Cloud x={110} y={46} />
      <Cloud x={230} y={70} s={0.7} />
      <Path d="M 0 216 Q 60 196 120 214 L 120 300 L 0 300 Z" fill="#6ACB6A" />
      <Path d="M 180 218 Q 240 194 300 212 L 300 300 L 180 300 Z" fill="#6ACB6A" />
      {ground(240, '#F3D58A')}
      <Palm x={34} y={250} s={1.05} />
      <Palm x={278} y={258} s={0.85} />
      <Ellipse cx={150} cy={286} rx={20} ry={5} fill="#E2BE6C" />
    </G>
  ),
  sky: () => (
    <G>
      <Sky top="#5EC4FF" bottom="#C5EEFF" />
      <Sun x={48} y={48} r={20} />
      <Cloud x={200} y={40} s={0.8} />
      <Cloud x={230} y={200} s={0.7} opacity={0.7} />
      <Cloud x={20} y={190} s={0.6} opacity={0.7} />
      <Bird x={250} y={110} color="#2C5A8A" />
      <Bird x={34} y={120} color="#2C5A8A" />
      <Cloud x={-10} y={272} s={2} />
      <Cloud x={84} y={284} s={1.8} />
      <Cloud x={190} y={274} s={2.1} />
    </G>
  ),
  desert: () => (
    <G>
      <Sky top="#FFE08A" bottom="#FFF6D6" />
      <Sun x={244} y={60} r={28} color="#FFB703" />
      <Path d="M 0 224 Q 80 198 170 228 Q 240 204 300 222 L 300 300 L 0 300 Z" fill="#F2C46D" />
      {ground(244, '#E8AE52')}
      <Cactus x={38} y={252} />
      <Cactus x={272} y={246} s={0.75} />
      <Ellipse cx={110} cy={282} rx={12} ry={5} fill="#D4963C" />
      <Ellipse cx={210} cy={290} rx={16} ry={6} fill="#D4963C" />
    </G>
  ),
  river: () => (
    <G>
      <Sky top="#9EE2FF" bottom="#E3F7FF" />
      <Cloud x={40} y={50} />
      <Cloud x={200} y={64} s={0.8} />
      <Tree x={30} y={226} s={0.8} color="#3FA34D" />
      <Tree x={268} y={222} s={0.9} color="#3FA34D" />
      {ground(222, '#7ED957', 8)}
      <Path d="M 0 286 Q 90 252 170 268 Q 240 282 300 258 L 300 300 L 0 300 Z" fill="#4FB8F0" />
      <Path d="M 40 284 q 10 -4 20 0 M 160 278 q 10 -4 20 0 M 240 276 q 10 -4 20 0" stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </G>
  ),
  forest: () => (
    <G>
      <Sky top="#BDEFC9" bottom="#F0FFEF" />
      <Pine x={20} y={220} s={1.1} color="#2E7D4F" />
      <Pine x={70} y={210} s={0.8} color="#3A9160" />
      <Pine x={240} y={214} s={0.9} color="#3A9160" />
      <Pine x={286} y={222} s={1.15} color="#2E7D4F" />
      {ground(236, '#5DAA48')}
      <G>
        <Rect x={36} y={266} width={8} height={12} fill="#FFF1D6" />
        <Path d="M 28 268 Q 40 250 52 268 Z" fill="#FF5A5A" />
        <Circle cx={36} cy={262} r={2} fill="#FFFFFF" />
        <Circle cx={44} cy={264} r={1.6} fill="#FFFFFF" />
      </G>
      <G>
        <Rect x={256} y={276} width={7} height={10} fill="#FFF1D6" />
        <Path d="M 249 278 Q 260 262 270 278 Z" fill="#FF8A3D" />
      </G>
      <Grass y={256} color="#3F8A33" />
    </G>
  ),
  beach: () => (
    <G>
      <Sky top="#6FD0FF" bottom="#D6F5FF" />
      <Sun x={246} y={48} r={20} />
      <Cloud x={34} y={58} s={0.9} />
      <Rect x={0} y={188} width={300} height={44} fill="#3BA7E8" />
      <Path d="M 10 202 q 10 -5 20 0 M 90 212 q 10 -5 20 0 M 200 200 q 10 -5 20 0 M 260 214 q 10 -5 20 0" stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {ground(232, '#FBE3A1')}
      <Polygon points={starPath(38, 274, 13, 0.5)} fill="#FF8A5B" />
      <Path d="M 252 290 Q 262 266 274 290 Z" fill="#FFB3C8" />
      <Path d="M 258 290 L 263 274 M 268 290 L 263 274" stroke="#E07A98" strokeWidth={1.5} />
    </G>
  ),
  mountains: () => (
    <G>
      <Sky top="#A6DCFF" bottom="#EEF8FF" />
      <Cloud x={230} y={40} s={0.8} />
      <Path d="M 0 222 L 60 118 L 112 200 L 170 98 L 238 210 L 278 150 L 300 176 L 300 300 L 0 300 Z" fill="#8C9DC9" />
      <Path d="M 46 142 L 60 118 L 74 140 L 66 136 L 58 144 Z" fill="#FFFFFF" />
      <Path d="M 154 124 L 170 98 L 186 124 L 176 120 L 168 128 L 162 120 Z" fill="#FFFFFF" />
      <Path d="M 268 166 L 278 150 L 288 164 L 280 162 Z" fill="#FFFFFF" />
      {ground(238, '#86D46B')}
      <Grass y={254} color="#5DAA48" />
      <Flower x={40} y={276} color="#FFD93D" />
      <Flower x={262} y={282} color="#FF6B6B" />
    </G>
  ),
  nest: () => (
    <G>
      <Sky top="#2B2F77" bottom="#6A5BB5" />
      <Circle cx={244} cy={58} r={24} fill="#FFF4C2" />
      <Circle cx={236} cy={52} r={5} fill="#EADFA6" />
      <Circle cx={252} cy={66} r={3.5} fill="#EADFA6" />
      <Star x={40} y={40} r={7} />
      <Star x={100} y={70} r={5} />
      <Star x={170} y={30} r={6} />
      <Star x={60} y={130} r={4} />
      <Star x={276} y={130} r={5} />
      <Path d="M 0 220 Q 80 196 150 214 Q 230 192 300 216 L 300 300 L 0 300 Z" fill="#3E6B4E" />
      {ground(250, '#2F5640')}
      <Ellipse cx={150} cy={246} rx={100} ry={24} fill="#9C6B3E" />
      <Path d="M 60 240 Q 100 254 150 250 Q 200 254 240 240 M 70 252 Q 110 262 150 258 Q 196 262 232 252" stroke="#7A4E28" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M 54 236 L 80 246 M 222 248 L 250 238 M 100 262 L 120 256" stroke="#7A4E28" strokeWidth={3} strokeLinecap="round" />
    </G>
  ),
  underwater: () => (
    <G>
      <Sky top="#5FD0FA" bottom="#1E6FC4" />
      <Polygon points="40,0 80,0 140,240 90,240" fill="#FFFFFF" opacity={0.1} />
      <Polygon points="180,0 210,0 250,220 210,220" fill="#FFFFFF" opacity={0.1} />
      <Fish x={50} y={70} color="#FFB03B" />
      <Fish x={262} y={136} color="#FF6F91" flip />
      <Fish x={70} y={150} color="#FFE066" />
      {[
        [244, 40, 6],
        [254, 22, 4],
        [30, 210, 5],
        [262, 74, 3],
      ].map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.8} />
      ))}
      {ground(256, '#F5D98B')}
      <Path d="M 26 266 Q 16 236 30 214 Q 40 236 32 266 Z" fill="#2EBF7A" />
      <Path d="M 44 270 Q 56 238 46 206 Q 64 236 52 270 Z" fill="#26A86A" />
      <Path d="M 254 270 Q 248 240 262 220 Q 268 246 262 270 Z" fill="#2EBF7A" />
      <Path d="M 270 270 L 272 240 M 272 252 L 282 238 M 272 258 L 262 246" stroke="#FF7FA8" strokeWidth={6} strokeLinecap="round" />
    </G>
  ),
  candy: () => (
    <G>
      <Sky top="#FFC6E8" bottom="#FFF2FB" />
      {['#FF6B6B', '#FFB347', '#FFE066', '#7CDB5A', '#6CC6FF', '#B983FF'].map((c, i) => (
        <Path key={c} d={`M ${20 + i * 9} 240 A ${130 - i * 9} ${130 - i * 9} 0 0 1 ${280 - i * 9} 240`} stroke={c} strokeWidth={9} fill="none" opacity={0.75} />
      ))}
      <Cloud x={14} y={226} s={1.1} />
      <Cloud x={244} y={226} s={1.1} />
      {ground(244, '#FFB3DA')}
      <G>
        <Rect x={32} y={226} width={4} height={40} fill="#FFFFFF" />
        <Circle cx={34} cy={222} r={14} fill="#FF6FB1" />
        <Path d="M 34 222 m -9 0 a 9 9 0 0 1 18 0 a 6 6 0 0 1 -12 0" stroke="#FFFFFF" strokeWidth={3} fill="none" />
      </G>
      <G>
        <Rect x={264} y={232} width={4} height={40} fill="#FFFFFF" />
        <Circle cx={266} cy={228} r={13} fill="#7EC8FF" />
        <Path d="M 266 228 m -8 0 a 8 8 0 0 1 16 0 a 5 5 0 0 1 -10 0" stroke="#FFFFFF" strokeWidth={3} fill="none" />
      </G>
      {[
        [80, 270, '#FFE066'],
        [120, 288, '#7CDB5A'],
        [200, 278, '#6CC6FF'],
        [236, 292, '#FF6B6B'],
      ].map(([x, y, c], i) => (
        <Circle key={i} cx={x as number} cy={y as number} r={4} fill={c as string} />
      ))}
    </G>
  ),
  snow: () => (
    <G>
      <Sky top="#9FD6FF" bottom="#EAF6FF" />
      <Path d="M 0 214 Q 80 184 160 208 Q 230 186 300 206 L 300 300 L 0 300 Z" fill="#E3F2FD" />
      <Pine x={36} y={236} s={1} color="#2E8B57" snow />
      <Pine x={268} y={242} s={0.85} color="#2E8B57" snow />
      {ground(240, '#FFFFFF')}
      {[
        [30, 40],
        [80, 80],
        [140, 30],
        [200, 60],
        [260, 30],
        [110, 130],
        [240, 120],
        [20, 150],
        [180, 100],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4.5} fill="#FFFFFF" />
      ))}
      <Ellipse cx={150} cy={276} rx={60} ry={6} fill="#D6EAF8" />
    </G>
  ),
  starry: () => (
    <G>
      <Sky top="#1B1446" bottom="#4B3B8F" />
      <Circle cx={60} cy={60} r={22} fill="#FFF4C2" />
      <Circle cx={70} cy={52} r={20} fill="#211852" />
      <Star x={150} y={40} r={9} />
      <Star x={250} y={70} r={7} />
      <Star x={200} y={130} r={5} />
      <Star x={30} y={140} r={5} />
      <Star x={110} y={110} r={4} />
      <Star x={280} y={20} r={4} />
      <Path d="M 0 212 Q 80 186 150 210 Q 220 188 300 214 L 300 300 L 0 300 Z" fill="#2E5E4E" />
      {ground(242, '#23483D')}
      {[
        [40, 230],
        [260, 236],
        [90, 270],
        [220, 280],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={3} fill="#FFF27A" opacity={0.9} />
      ))}
    </G>
  ),
  savanna: () => (
    <G>
      <Sky top="#FFC27A" bottom="#FFEBC2" />
      <Circle cx={80} cy={170} r={44} fill="#FF8F3D" opacity={0.85} />
      <Bird x={200} y={60} color="#7A4A2A" />
      <Bird x={230} y={46} color="#7A4A2A" />
      <Path d="M 0 214 Q 100 196 200 212 Q 260 204 300 210 L 300 300 L 0 300 Z" fill="#D9A55B" />
      <G>
        <Path d="M 262 236 L 258 186 L 252 172 M 258 192 L 268 176" stroke="#6B4F2A" strokeWidth={6} strokeLinecap="round" fill="none" />
        <Ellipse cx={258} cy={170} rx={36} ry={11} fill="#7A9A3A" />
        <Ellipse cx={244} cy={164} rx={20} ry={8} fill="#8CAD45" />
      </G>
      {ground(240, '#E3B464')}
      <Grass y={256} color="#B8873A" />
    </G>
  ),
  seaSky: () => (
    <G>
      <Sky top="#7ED3FF" bottom="#DDF5FF" />
      <Cloud x={24} y={44} s={0.9} />
      <Cloud x={220} y={34} s={0.75} />
      <Bird x={40} y={110} color="#2C5A8A" />
      <Rect x={0} y={218} width={300} height={82} fill="#2F9BE0" />
      <G>
        <Path d="M 228 222 L 272 222 L 264 232 L 236 232 Z" fill="#C0392B" />
        <Path d="M 250 220 L 250 180 L 270 216 Z" fill="#FFFFFF" />
        <Path d="M 248 220 L 248 186 L 232 216 Z" fill="#FFE3B3" />
      </G>
      {[
        [20, 246],
        [90, 266],
        [170, 244],
        [240, 270],
        [130, 288],
      ].map(([x, y], i) => (
        <Path key={i} d={`M ${x} ${y} q 10 -6 20 0 q 10 -6 20 0`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.85} />
      ))}
    </G>
  ),
  flowers: () => (
    <G>
      <Sky top="#A0E3FF" bottom="#E8FAFF" />
      <Sun x={40} y={46} r={18} />
      <Cloud x={190} y={50} s={0.85} />
      {ground(226, '#8EDB6A', 6)}
      {Array.from({ length: 18 }, (_, i) => {
        const colors = ['#FF6B6B', '#FFD93D', '#FF8FC7', '#B983FF', '#FFFFFF', '#FFA94D'];
        const x = 14 + ((i * 53) % 280);
        const y = 240 + ((i * 37) % 52);
        return <Flower key={i} x={x} y={y} color={colors[i % colors.length]} s={0.9 + (i % 3) * 0.12} />;
      })}
      <G>
        <Ellipse cx={60} cy={150} rx={8} ry={6} fill="#FF8FC7" transform="rotate(-20 60 150)" />
        <Ellipse cx={72} cy={150} rx={8} ry={6} fill="#FF8FC7" transform="rotate(20 72 150)" />
        <Ellipse cx={66} cy={151} rx={2} ry={7} fill="#3B2C5E" />
      </G>
      <G>
        <Ellipse cx={240} cy={120} rx={7} ry={5} fill="#FFD93D" transform="rotate(-20 240 120)" />
        <Ellipse cx={251} cy={120} rx={7} ry={5} fill="#FFD93D" transform="rotate(20 251 120)" />
        <Ellipse cx={245.5} cy={121} rx={2} ry={6} fill="#3B2C5E" />
      </G>
    </G>
  ),
  party: () => (
    <G>
      <Sky top="#FFF0C9" bottom="#FFE0F0" />
      <Path d="M 0 20 Q 150 70 300 20" stroke="#8A7F9E" strokeWidth={2} fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 16 + i * 34;
        const t = x / 300;
        const y = 20 + 100 * t * (1 - t);
        const c = ['#FF6B6B', '#FFD93D', '#6CC6FF', '#7CDB5A', '#B983FF'][i % 5];
        return <Path key={i} d={`M ${x - 10} ${y} L ${x + 10} ${y} L ${x} ${y + 20} Z`} fill={c} />;
      })}
      <Balloon x={40} y={100} color="#FF6B6B" />
      <Balloon x={262} y={92} color="#6CC6FF" />
      <Balloon x={232} y={140} color="#FFD93D" />
      {[
        [90, 120, '#B983FF'],
        [120, 200, '#7CDB5A'],
        [270, 190, '#FF6B6B'],
        [20, 200, '#FFD93D'],
        [200, 80, '#FF8FC7'],
      ].map(([x, y, c], i) => (
        <Rect key={i} x={x as number} y={y as number} width={7} height={4} fill={c as string} transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
      <Rect x={0} y={244} width={300} height={56} fill="#FFB86B" />
      <Path d="M 0 262 H 300 M 0 282 H 300" stroke="#F29E4C" strokeWidth={3} />
      <G>
        <Rect x={22} y={238} width={34} height={26} fill="#6CC6FF" />
        <Rect x={36} y={238} width={6} height={26} fill="#FF6B6B" />
        <Rect x={18} y={230} width={42} height={10} fill="#4FB0F0" />
        <Path d="M 39 230 Q 28 218 32 214 Q 38 214 39 230 Q 40 214 46 214 Q 50 218 39 230 Z" fill="#FF6B6B" />
      </G>
    </G>
  ),
  space: () => (
    <G>
      <Sky top="#0B1240" bottom="#2E2275" />
      {[
        [20, 30, 2],
        [90, 20, 1.5],
        [140, 60, 2],
        [210, 100, 1.5],
        [270, 140, 2],
        [30, 150, 1.5],
        [120, 170, 1.2],
        [240, 200, 1.5],
        [60, 200, 2],
      ].map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" />
      ))}
      <Star x={180} y={30} r={6} />
      <Star x={20} y={100} r={4} />
      <G>
        <Circle cx={60} cy={72} r={26} fill="#FF9E6D" />
        <Ellipse cx={60} cy={72} rx={44} ry={9} fill="none" stroke="#FFD18A" strokeWidth={5} transform="rotate(-18 60 72)" />
        <Circle cx={52} cy={64} r={5} fill="#FFFFFF" opacity={0.25} />
      </G>
      <Circle cx={256} cy={48} r={13} fill="#5EEAD4" />
      {ground(240, '#C9C3E6')}
      <Ellipse cx={50} cy={268} rx={16} ry={5} fill="#A9A1D2" />
      <Ellipse cx={248} cy={280} rx={22} ry={6} fill="#A9A1D2" />
      <Ellipse cx={160} cy={292} rx={10} ry={3} fill="#A9A1D2" />
    </G>
  ),
};

export function SceneArt({ kind }: { kind: SceneKind }) {
  return SCENES[kind]();
}
