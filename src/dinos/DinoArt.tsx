import { memo, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { G } from 'react-native-svg';

import { AccessoryArt } from './accessories';
import { buildCharacter } from './characters';
import { SceneArt } from './scenes';
import type { Dino } from './types';

/** Tüm çizimler 300x300 birimlik bir alanda yapılır. */
export const ART_SIZE = 300;

export type ArtLayer = 'all' | 'scene' | 'character';

export function DinoArtGroup({ dino, layer = 'all' }: { dino: Dino; layer?: ArtLayer }) {
  const character = useMemo(() => buildCharacter(dino), [dino]);
  return (
    <G>
      {layer !== 'character' && <SceneArt kind={dino.scene} />}
      {layer !== 'scene' && (
        <G>
          {character.element}
          {dino.accessory && <AccessoryArt kind={dino.accessory} a={character.anchors} />}
        </G>
      )}
    </G>
  );
}

type Props = {
  dino: Dino;
  width: number;
  height?: number;
  layer?: ArtLayer;
  /** Görselin sadece bir bölümünü göstermek için (puzzle parçaları) */
  viewBox?: string;
  style?: StyleProp<ViewStyle>;
};

export const DinoSvg = memo(function DinoSvg({ dino, width, height = width, layer = 'all', viewBox, style }: Props) {
  return (
    <Svg width={width} height={height} viewBox={viewBox ?? `0 0 ${ART_SIZE} ${ART_SIZE}`} style={style}>
      <DinoArtGroup dino={dino} layer={layer} />
    </Svg>
  );
});
