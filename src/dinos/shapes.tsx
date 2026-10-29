import { Circle, Ellipse, G, Path } from 'react-native-svg';

export type Shape =
  | { kind: 'path'; d: string; fill: string }
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string; rot?: number };

export const P = (d: string, fill: string): Shape => ({ kind: 'path', d, fill });
export const E = (cx: number, cy: number, rx: number, ry: number, fill: string, rot?: number): Shape => ({
  kind: 'ellipse',
  cx,
  cy,
  rx,
  ry,
  fill,
  rot,
});

const r1 = (n: number) => Math.round(n * 10) / 10;

type Paint = { fill: string; stroke?: string; strokeWidth?: number };

function ShapeEl({ s, paint }: { s: Shape; paint: Paint }) {
  const common = { ...paint, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  if (s.kind === 'path') return <Path d={s.d} {...common} />;
  return (
    <Ellipse
      cx={s.cx}
      cy={s.cy}
      rx={s.rx}
      ry={s.ry}
      transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined}
      {...common}
    />
  );
}

/**
 * Parçaları önce kalın bir dış hat olarak, sonra kendi renkleriyle çizer.
 * Böylece üst üste binen parçalar tek bir çizgi film silüeti gibi görünür.
 */
export function Silhouette({ shapes, line }: { shapes: Shape[]; line: string }) {
  return (
    <G>
      {shapes.map((s, i) => (
        <ShapeEl key={`o${i}`} s={s} paint={{ fill: line, stroke: line, strokeWidth: 7 }} />
      ))}
      {shapes.map((s, i) => (
        <ShapeEl key={`f${i}`} s={s} paint={{ fill: s.fill }} />
      ))}
    </G>
  );
}

/** Bir elipsin kenarı boyunca dışa bakan dikenler/plakalar üretir. Açılar derece, -90 = tepe. */
export function spikes(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fromDeg: number,
  toDeg: number,
  count: number,
  size: number,
  fill: string,
  width = 0.9,
): Shape[] {
  const out: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = ((fromDeg + (toDeg - fromDeg) * t) * Math.PI) / 180;
    const px = cx + rx * Math.cos(a);
    const py = cy + ry * Math.sin(a);
    let nx = Math.cos(a) / rx;
    let ny = Math.sin(a) / ry;
    const l = Math.hypot(nx, ny);
    nx /= l;
    ny /= l;
    const tx = -ny;
    const ty = nx;
    const half = size * width * 0.5;
    const bx = px - nx * 6;
    const by = py - ny * 6;
    const d = [
      `M ${r1(bx + tx * half)} ${r1(by + ty * half)}`,
      `Q ${r1(px + nx * size * 0.8 + tx * half * 0.5)} ${r1(py + ny * size * 0.8 + ty * half * 0.5)} ${r1(px + nx * size)} ${r1(py + ny * size)}`,
      `Q ${r1(px + nx * size * 0.8 - tx * half * 0.5)} ${r1(py + ny * size * 0.8 - ty * half * 0.5)} ${r1(bx - tx * half)} ${r1(by - ty * half)} Z`,
    ].join(' ');
    out.push(P(d, fill));
  }
  return out;
}

/** Alt köşeleri yuvarlatılmış bacak */
export function leg(x: number, top: number, bottom: number, w: number, fill: string): Shape {
  return P(
    `M ${x} ${top} L ${x} ${bottom - 7} Q ${x} ${bottom} ${x + 7} ${bottom} L ${x + w - 7} ${bottom} Q ${x + w} ${bottom} ${x + w} ${bottom - 7} L ${x + w} ${top} Z`,
    fill,
  );
}

export function Eye({ x, y, r, line }: { x: number; y: number; r: number; line: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill="#FFFFFF" stroke={line} strokeWidth={2.5} />
      <Circle cx={x + r * 0.22} cy={y + r * 0.1} r={r * 0.58} fill="#2B2340" />
      <Circle cx={x + r * 0.42} cy={y - r * 0.18} r={r * 0.22} fill="#FFFFFF" />
      <Circle cx={x + r * 0.02} cy={y + r * 0.35} r={r * 0.1} fill="#FFFFFF" />
    </G>
  );
}

export function Cheek({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <Ellipse cx={x} cy={y} rx={8 * s} ry={5 * s} fill="#FF7FA8" opacity={0.5} />;
}

export function Line({ d, color, w = 3, opacity = 1 }: { d: string; color: string; w?: number; opacity?: number }) {
  return (
    <Path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
  );
}

export function Spots({ spots, color }: { spots: [number, number, number][]; color: string }) {
  return (
    <G opacity={0.55}>
      {spots.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={color} />
      ))}
    </G>
  );
}
