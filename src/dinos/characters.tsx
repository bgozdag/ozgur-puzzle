import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';

import { Cheek, E, Eye, Line, P, Silhouette, Spots, leg, spikes, type Shape } from './shapes';
import type { Anchors, Dino, Palette } from './types';

type Built = { element: ReactElement; anchors: Anchors };

const HORN = '#FFF1CC';

// ---------------- İki ayaklılar (T-Rex ve akrabaları) ----------------

type BipedOpts = {
  teeth?: boolean;
  backSpikes?: boolean;
  crest?: boolean;
  sail?: boolean;
  dome?: boolean;
  feathers?: boolean;
  longSnout?: boolean;
};

function biped(p: Palette, o: BipedOpts, spotted: boolean): Built {
  const slim = !!o.feathers;
  const head = o.longSnout ? E(196, 108, 40, 32, p.body) : o.crest ? E(198, 108, 40, 33, p.body) : E(200, 106, 44, 35, p.body);
  const snout = o.longSnout
    ? { cx: 236, cy: 116, rx: 40, ry: 17 }
    : o.crest
      ? { cx: 232, cy: 118, rx: 30, ry: 19 }
      : slim
        ? { cx: 226, cy: 118, rx: 28, ry: 20 }
        : { cx: 228, cy: 118, rx: 30, ry: 23 };

  const shapes: Shape[] = [];
  if (o.sail) shapes.push(P('M 108 176 Q 96 92 146 80 Q 194 80 196 150 Z', p.accent));
  if (o.backSpikes) shapes.push(...spikes(150, 178, 48, 44, -172, -62, 4, 16, p.accent));
  if (o.crest) shapes.push(P('M 188 86 Q 160 38 108 42 Q 98 56 116 62 Q 158 64 182 104 Z', p.accent));
  if (o.feathers) {
    shapes.push(P('M 178 82 Q 166 56 152 60 Q 166 70 170 88 Z', p.accent));
    shapes.push(P('M 190 76 Q 190 50 176 48 Q 184 62 182 82 Z', p.accent));
    shapes.push(P('M 196 74 Q 206 52 196 44 Q 194 60 188 78 Z', p.accent));
  }
  shapes.push(
    P(
      slim
        ? 'M 118 160 Q 60 142 10 158 Q 6 168 16 170 Q 64 184 124 198 Z'
        : 'M 118 160 Q 66 162 20 206 Q 16 214 27 212 Q 80 200 124 210 Z',
      p.body,
    ),
    P('M 126 196 Q 118 236 130 245 L 160 245 Q 166 237 152 233 L 152 206 Z', p.dark),
    slim ? E(150, 176, 42, 38, p.body) : E(150, 178, 48, 44, p.body),
    P('M 152 200 Q 146 238 158 247 L 192 247 Q 198 238 182 234 L 180 206 Z', p.body),
    E(178, 140, 25, 32, p.body),
    head,
    E(snout.cx, snout.cy, snout.rx, snout.ry, p.body),
    P('M 186 166 Q 210 166 216 180 Q 211 188 203 181 Q 195 182 186 178 Z', p.body),
    E(166, 192, slim ? 22 : 25, slim ? 25 : 29, p.belly),
  );
  if (o.feathers) shapes.push(P('M 196 170 Q 214 168 220 186 Q 208 182 198 180 Z', p.accent));
  if (o.dome) {
    shapes.push(E(196, 80, 33, 23, p.accent));
    for (const [x, y] of [
      [164, 92],
      [170, 74],
      [184, 62],
      [208, 60],
      [224, 70],
    ] as const)
      shapes.push(E(x, y, 6, 6, p.accent));
  }

  const eye: [number, number, number] = o.longSnout ? [198, 96, 11] : [203, 94, 12];
  const mouthEnd = snout.cx + snout.rx - 6;
  const mouthY = snout.cy + snout.ry * 0.35;
  const mouth = `M ${snout.cx - 22} ${mouthY - 2} Q ${snout.cx + 2} ${mouthY + 13} ${mouthEnd} ${mouthY - 4}`;

  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      {o.sail && (
        <G>
          <Line d="M 128 128 L 122 104" color={p.line} w={2.5} opacity={0.35} />
          <Line d="M 146 126 L 146 90" color={p.line} w={2.5} opacity={0.35} />
          <Line d="M 166 128 L 172 96" color={p.line} w={2.5} opacity={0.35} />
          <Line d="M 182 136 L 188 116" color={p.line} w={2.5} opacity={0.35} />
        </G>
      )}
      {spotted && (
        <Spots
          color={p.accent}
          spots={[
            [124, 166, 7],
            [138, 150, 5],
            [122, 186, 5],
            [64, 186, 5],
            [86, 178, 6],
          ]}
        />
      )}
      <Line d="M 146 182 Q 166 188 188 180" color={p.line} w={2.5} opacity={0.2} />
      <Line d="M 145 196 Q 166 202 189 194" color={p.line} w={2.5} opacity={0.2} />
      <Line d="M 151 210 Q 166 214 182 209" color={p.line} w={2.5} opacity={0.2} />
      <Eye x={eye[0]} y={eye[1]} r={eye[2]} line={p.line} />
      <Line d={`M ${eye[0] - 12} ${eye[1] - 18} Q ${eye[0]} ${eye[1] - 24} ${eye[0] + 12} ${eye[1] - 18}`} color={p.line} w={3} />
      <Line d={mouth} color={p.line} w={3} />
      {o.teeth && (
        <G>
          <Path d={`M ${snout.cx - 4} ${mouthY + 5} l 4 7 l 4 -7 Z`} fill="#FFFFFF" stroke={p.line} strokeWidth={1.5} strokeLinejoin="round" />
          <Path d={`M ${snout.cx + 10} ${mouthY + 3} l 4 7 l 4 -7 Z`} fill="#FFFFFF" stroke={p.line} strokeWidth={1.5} strokeLinejoin="round" />
        </G>
      )}
      <Circle cx={snout.cx + snout.rx * 0.62} cy={snout.cy - snout.ry * 0.42} r={2.6} fill={p.line} />
      <Cheek x={snout.cx - 10} y={snout.cy + 6} />
      <Ellipse cx={186} cy={244} rx={3.5} ry={2.5} fill="#FFFFFF" opacity={0.9} />
      <Ellipse cx={177} cy={245} rx={3.5} ry={2.5} fill="#FFFFFF" opacity={0.9} />
    </G>
  );

  const top: [number, number] = o.dome ? [196, 58] : o.longSnout ? [194, 76] : o.crest ? [208, 76] : [200, 72];
  return { element, anchors: { top, eye, neck: [178, 160], head: [208, 108, 58] } };
}

// ---------------- Dört ayaklılar ----------------

const quadLegs = (p: Palette, top = 190, bottom = 246): { back: Shape[]; front: Shape[] } => ({
  back: [leg(80, top, bottom, 26, p.dark), leg(162, top, bottom, 26, p.dark)],
  front: [leg(102, top, bottom, 26, p.body), leg(186, top, bottom, 26, p.body)],
});

function trike(p: Palette, spotted: boolean): Built {
  const legs = quadLegs(p);
  const scallops: Shape[] = [];
  for (let i = 0; i < 9; i++) {
    const a = ((-160 + (220 * i) / 8) * Math.PI) / 180;
    scallops.push(E(208 + 42 * Math.cos(a), 140 + 47 * Math.sin(a), 9, 9, p.accent));
  }
  const shapes: Shape[] = [
    P('M 92 165 Q 46 168 16 204 Q 12 212 23 210 Q 58 198 96 200 Z', p.body),
    ...legs.back,
    E(140, 172, 72, 44, p.body),
    ...legs.front,
    E(150, 194, 48, 17, p.belly),
    ...scallops,
    E(208, 140, 40, 46, p.accent),
    E(226, 162, 34, 28, p.body),
    P('M 248 154 Q 278 160 268 184 Q 252 182 244 172 Z', p.belly),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      <Circle cx={208} cy={140} r={24} fill="none" stroke={p.line} strokeWidth={2.5} opacity={0.2} />
      {spotted && (
        <Spots
          color={p.accent}
          spots={[
            [110, 160, 8],
            [140, 148, 6],
            [160, 168, 7],
            [92, 180, 5],
          ]}
        />
      )}
      <Path d="M 212 134 L 232 88 L 228 138 Z" fill={HORN} stroke={p.line} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M 232 140 L 258 98 L 246 144 Z" fill={HORN} stroke={p.line} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M 252 154 L 262 132 L 263 158 Z" fill={HORN} stroke={p.line} strokeWidth={3} strokeLinejoin="round" />
      <Eye x={228} y={152} r={10} line={p.line} />
      <Line d="M 236 176 Q 248 183 258 176" color={p.line} w={3} />
      <Cheek x={240} y={170} />
      <Circle cx={262} cy={164} r={2.4} fill={p.line} />
    </G>
  );
  return { element, anchors: { top: [205, 92], eye: [228, 152, 10], neck: [196, 178], head: [222, 150, 52] } };
}

function stego(p: Palette, spotted: boolean): Built {
  const legs = quadLegs(p);
  const shapes: Shape[] = [
    ...spikes(140, 172, 72, 44, -168, -12, 6, 32, p.accent, 1.0),
    P('M 28 200 L 12 174 L 40 194 Z', p.accent),
    P('M 46 194 L 38 166 L 60 190 Z', p.accent),
    P('M 92 165 Q 46 168 16 204 Q 12 212 23 210 Q 58 198 96 200 Z', p.body),
    ...legs.back,
    E(140, 172, 72, 44, p.body),
    ...legs.front,
    E(150, 194, 48, 17, p.belly),
    E(204, 182, 24, 17, p.body),
    E(232, 188, 25, 19, p.body),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      {spotted && (
        <Spots
          color={p.accent}
          spots={[
            [110, 160, 8],
            [140, 150, 6],
            [168, 166, 7],
            [96, 182, 5],
          ]}
        />
      )}
      <Eye x={236} y={181} r={8.5} line={p.line} />
      <Line d="M 240 197 Q 248 200 254 193" color={p.line} w={3} />
      <Cheek x={244} y={194} s={0.8} />
      <Circle cx={254} cy={184} r={2.2} fill={p.line} />
    </G>
  );
  return { element, anchors: { top: [230, 168], eye: [236, 181, 8.5], neck: [206, 184], head: [232, 188, 32] } };
}

function ankylo(p: Palette, spotted: boolean): Built {
  const legs = quadLegs(p, 196, 246);
  const shapes: Shape[] = [
    ...spikes(140, 182, 78, 46, -176, -4, 7, 14, HORN),
    P('M 82 186 Q 48 190 32 186 Q 50 200 86 202 Z', p.body),
    E(26, 190, 17, 14, p.accent),
    ...legs.back,
    E(140, 182, 76, 40, p.body),
    ...legs.front,
    P('M 66 186 Q 70 132 140 128 Q 210 132 216 186 Q 140 200 66 186 Z', p.accent),
    P('M 216 184 L 206 168 L 224 180 Z', HORN),
    E(230, 196, 28, 20, p.body),
  ];
  const bumps: [number, number][] = [
    [100, 168],
    [124, 152],
    [156, 152],
    [180, 168],
    [116, 182],
    [140, 170],
    [164, 182],
    [140, 146],
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      {bumps.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={7} fill={p.belly} opacity={0.45} stroke={p.line} strokeWidth={2} strokeOpacity={0.3} />
      ))}
      {spotted && <Spots color={p.belly} spots={[[26, 190, 6]]} />}
      <Eye x={236} y={190} r={8.5} line={p.line} />
      <Line d="M 240 205 Q 249 208 256 201" color={p.line} w={3} />
      <Cheek x={246} y={202} s={0.8} />
      <Circle cx={254} cy={192} r={2.2} fill={p.line} />
    </G>
  );
  return { element, anchors: { top: [228, 176], eye: [236, 190, 8.5], neck: [210, 196], head: [230, 196, 34] } };
}

function brachio(p: Palette, spotted: boolean): Built {
  const shapes: Shape[] = [
    P('M 72 165 Q 28 175 8 222 Q 6 230 15 226 Q 40 200 78 192 Z', p.body),
    leg(70, 185, 248, 26, p.dark),
    leg(140, 185, 248, 26, p.dark),
    E(125, 172, 62, 40, p.body),
    leg(92, 185, 248, 26, p.body),
    leg(162, 185, 248, 26, p.body),
    E(132, 192, 42, 15, p.belly),
    P('M 148 160 Q 168 100 196 56 L 226 66 Q 202 118 184 170 Z', p.body),
    E(214, 56, 30, 20, p.body),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      {spotted && (
        <Spots
          color={p.accent}
          spots={[
            [100, 160, 8],
            [124, 148, 6],
            [148, 162, 9],
            [116, 178, 5],
            [170, 128, 6],
            [184, 100, 5],
            [196, 78, 4],
          ]}
        />
      )}
      <Line d="M 172 150 Q 182 148 190 140" color={p.line} w={2.5} opacity={0.25} />
      <Line d="M 182 126 Q 192 124 198 116" color={p.line} w={2.5} opacity={0.25} />
      <Eye x={218} y={49} r={8.5} line={p.line} />
      <Line d="M 226 64 Q 236 68 243 60" color={p.line} w={3} />
      <Cheek x={228} y={62} s={0.8} />
      <Circle cx={240} cy={48} r={2.2} fill={p.line} />
    </G>
  );
  return { element, anchors: { top: [210, 36], eye: [218, 49, 8.5], neck: [194, 88], head: [214, 56, 40] } };
}

// ---------------- Diğerleri ----------------

function ptero(p: Palette, spotted: boolean): Built {
  const shapes: Shape[] = [
    P('M 142 132 Q 86 90 20 114 Q 38 126 42 142 Q 60 140 70 157 Q 92 150 108 163 Q 124 156 144 170 Z', p.accent),
    P('M 158 132 Q 214 90 280 114 Q 262 126 258 142 Q 240 140 230 157 Q 208 150 192 163 Q 176 156 156 170 Z', p.accent),
    P('M 142 92 L 102 60 L 152 84 Z', p.dark),
    E(140, 196, 6, 12, p.dark),
    E(160, 196, 6, 12, p.dark),
    E(150, 152, 26, 38, p.body),
    E(150, 160, 16, 26, p.belly),
    E(150, 100, 25, 21, p.body),
    P('M 166 92 Q 214 102 214 108 Q 202 115 166 113 Z', p.belly),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      <Line d="M 140 138 Q 96 116 52 126" color={p.line} w={2.5} opacity={0.3} />
      <Line d="M 140 150 Q 110 140 84 150" color={p.line} w={2.5} opacity={0.3} />
      <Line d="M 160 138 Q 204 116 248 126" color={p.line} w={2.5} opacity={0.3} />
      <Line d="M 160 150 Q 190 140 216 150" color={p.line} w={2.5} opacity={0.3} />
      {spotted && (
        <Spots
          color={p.dark}
          spots={[
            [140, 140, 4],
            [160, 136, 3],
          ]}
        />
      )}
      <Eye x={153} y={95} r={9.5} line={p.line} />
      <Line d="M 170 106 L 206 108" color={p.line} w={2.5} />
      <Cheek x={160} y={110} s={0.8} />
    </G>
  );
  return { element, anchors: { top: [148, 80], eye: [153, 95, 9.5], neck: [150, 122], head: [152, 100, 36] } };
}

function plesio(p: Palette, spotted: boolean): Built {
  const shapes: Shape[] = [
    P('M 92 192 Q 60 196 38 212 Q 64 214 96 206 Z', p.body),
    E(118, 206, 20, 8, p.dark, 30),
    E(180, 206, 20, 8, p.dark, -30),
    E(140, 192, 58, 28, p.body),
    E(108, 214, 22, 9, p.body, 30),
    E(172, 216, 22, 9, p.body, -30),
    E(145, 202, 40, 12, p.belly),
    P('M 160 180 Q 168 120 196 84 L 222 94 Q 196 130 190 186 Z', p.body),
    E(210, 82, 28, 18, p.body),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      <Spots
        color={spotted ? p.accent : p.dark}
        spots={[
          [118, 182, 6],
          [140, 174, 5],
          [160, 184, 6],
          [182, 140, 4],
        ]}
      />
      <Eye x={214} y={75} r={8.5} line={p.line} />
      <Line d="M 222 89 Q 230 93 236 87" color={p.line} w={3} />
      <Cheek x={226} y={88} s={0.8} />
      <Circle cx={234} cy={76} r={2.2} fill={p.line} />
    </G>
  );
  return { element, anchors: { top: [206, 64], eye: [214, 75, 8.5], neck: [194, 118], head: [210, 82, 34] } };
}

function egg(p: Palette): Built {
  const shell = '#FFF6E0';
  const shapes: Shape[] = [
    E(150, 132, 46, 40, p.body),
    P('M 112 108 L 124 118 L 138 102 L 152 116 L 166 100 L 178 114 L 188 106 Q 182 76 150 74 Q 116 76 112 108 Z', shell),
    P('M 88 172 L 104 158 L 120 176 L 136 156 L 150 174 L 164 156 L 180 176 L 196 158 L 212 172 Q 220 248 150 250 Q 80 248 88 172 Z', shell),
    E(98, 168, 14, 9, p.body, -30),
    E(202, 168, 14, 9, p.body, 30),
  ];
  const element = (
    <G>
      <Silhouette shapes={shapes} line={p.line} />
      <Spots
        color={p.accent}
        spots={[
          [118, 212, 9],
          [172, 226, 11],
          [150, 198, 6],
          [192, 196, 6],
          [104, 190, 5],
          [130, 88, 5],
          [168, 86, 4],
        ]}
      />
      <Eye x={134} y={130} r={11} line={p.line} />
      <Eye x={166} y={130} r={11} line={p.line} />
      <Line d="M 140 152 Q 151 162 162 152" color={p.line} w={3} />
      <Circle cx={145} cy={143} r={1.8} fill={p.line} />
      <Circle cx={156} cy={143} r={1.8} fill={p.line} />
      <Cheek x={120} y={148} s={0.9} />
      <Cheek x={182} y={148} s={0.9} />
    </G>
  );
  return { element, anchors: { top: [150, 76], eye: [150, 130, 11], neck: [150, 170], head: [150, 128, 58] } };
}

export function buildCharacter(d: Dino): Built {
  const p = d.palette;
  const spotted = !!d.spots;
  switch (d.kind) {
    case 'rex':
      return biped(p, { teeth: true, backSpikes: true }, spotted);
    case 'para':
      return biped(p, { crest: true }, spotted);
    case 'spino':
      return biped(p, { sail: true, longSnout: true, teeth: true }, spotted);
    case 'pachy':
      return biped(p, { dome: true }, spotted);
    case 'raptor':
      return biped(p, { feathers: true, teeth: true }, spotted);
    case 'trike':
      return trike(p, spotted);
    case 'stego':
      return stego(p, spotted);
    case 'ankylo':
      return ankylo(p, spotted);
    case 'brachio':
      return brachio(p, spotted);
    case 'ptero':
      return ptero(p, spotted);
    case 'plesio':
      return plesio(p, spotted);
    case 'egg':
      return egg(p);
  }
}
