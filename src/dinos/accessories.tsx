import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Accessory, Anchors } from './types';

const OUT = '#3B2C5E';

export function AccessoryArt({ kind, a }: { kind: Accessory; a: Anchors }) {
  const [x, y] = a.top;
  switch (kind) {
    case 'crown':
      return (
        <G>
          <Path
            d={`M ${x - 20} ${y + 2} L ${x - 24} ${y - 22} L ${x - 11} ${y - 10} L ${x} ${y - 28} L ${x + 11} ${y - 10} L ${x + 24} ${y - 22} L ${x + 20} ${y + 2} Z`}
            fill="#FFD23F"
            stroke="#B9780A"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Circle cx={x} cy={y - 6} r={4} fill="#FF4F8B" />
          <Circle cx={x - 12} cy={y - 4} r={3} fill="#4FC3F7" />
          <Circle cx={x + 12} cy={y - 4} r={3} fill="#7CDB5A" />
        </G>
      );
    case 'partyHat':
      return (
        <G>
          <Path d={`M ${x - 17} ${y + 2} L ${x + 2} ${y - 40} L ${x + 19} ${y + 2} Z`} fill="#6CC6FF" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <Path d={`M ${x - 11} ${y - 12} L ${x + 13} ${y - 12}`} stroke="#FF5D8F" strokeWidth={5} />
          <Path d={`M ${x - 5} ${y - 26} L ${x + 8} ${y - 26}`} stroke="#FFD23F" strokeWidth={5} />
          <Circle cx={x + 2} cy={y - 42} r={6} fill="#FF5D8F" stroke={OUT} strokeWidth={2.5} />
        </G>
      );
    case 'bow':
      return (
        <G>
          <Path d={`M ${x} ${y - 4} L ${x - 20} ${y - 16} L ${x - 20} ${y + 8} Z`} fill="#FF5D8F" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <Path d={`M ${x} ${y - 4} L ${x + 20} ${y - 16} L ${x + 20} ${y + 8} Z`} fill="#FF5D8F" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <Circle cx={x} cy={y - 4} r={6} fill="#FF8FB8" stroke={OUT} strokeWidth={3} />
        </G>
      );
    case 'flower':
      return (
        <G>
          {[0, 72, 144, 216, 288].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return <Circle key={deg} cx={x + Math.cos(r) * 9} cy={y - 6 + Math.sin(r) * 9} r={7} fill="#FF8FB8" stroke={OUT} strokeWidth={2} />;
          })}
          <Circle cx={x} cy={y - 6} r={6} fill="#FFD23F" stroke={OUT} strokeWidth={2} />
        </G>
      );
    case 'sunglasses': {
      const [ex, ey, er] = a.eye;
      return (
        <G>
          <Path d={`M ${ex - er * 1.4} ${ey - 2} L ${ex - er * 3.2} ${ey - 6}`} stroke="#222" strokeWidth={4} strokeLinecap="round" />
          <Rect x={ex - er * 1.45} y={ey - er * 1.05} width={er * 2.9} height={er * 2.1} rx={er * 0.9} fill="#2B2340" stroke="#111" strokeWidth={2.5} />
          <Path d={`M ${ex - er * 0.7} ${ey - er * 0.5} L ${ex + er * 0.1} ${ey - er * 0.5}`} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        </G>
      );
    }
    case 'scarf': {
      const [nx, ny] = a.neck;
      return (
        <G>
          <Path
            d={`M ${nx - 26} ${ny - 8} Q ${nx} ${ny + 8} ${nx + 26} ${ny - 8} L ${nx + 26} ${ny + 6} Q ${nx} ${ny + 22} ${nx - 26} ${ny + 6} Z`}
            fill="#FF5252"
            stroke={OUT}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <Path d={`M ${nx - 12} ${ny + 10} L ${nx - 22} ${ny + 38} L ${nx - 4} ${ny + 36} Z`} fill="#FF5252" stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
          <Path d={`M ${nx - 8} ${ny + 1} L ${nx - 6} ${ny + 15} M ${nx + 8} ${ny} L ${nx + 9} ${ny + 14}`} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
        </G>
      );
    }
    case 'helmet': {
      const [hx, hy, hr] = a.head;
      return (
        <G>
          <Circle cx={hx} cy={hy} r={hr} fill="#BDEBFF" opacity={0.28} stroke="#FFFFFF" strokeWidth={4} />
          <Ellipse cx={hx - hr * 0.45} cy={hy - hr * 0.5} rx={hr * 0.22} ry={hr * 0.12} fill="#FFFFFF" opacity={0.8} transform={`rotate(-35 ${hx - hr * 0.45} ${hy - hr * 0.5})`} />
        </G>
      );
    }
  }
}
