export type Palette = {
  body: string;
  belly: string;
  accent: string;
  line: string;
  /** Arkada kalan bacaklar için biraz koyu ton */
  dark: string;
};

export type CharacterKind =
  | 'rex'
  | 'para'
  | 'spino'
  | 'pachy'
  | 'raptor'
  | 'trike'
  | 'stego'
  | 'ankylo'
  | 'brachio'
  | 'ptero'
  | 'plesio'
  | 'egg';

export type SceneKind =
  | 'meadow'
  | 'volcano'
  | 'sunset'
  | 'tropical'
  | 'sky'
  | 'desert'
  | 'river'
  | 'forest'
  | 'beach'
  | 'mountains'
  | 'nest'
  | 'underwater'
  | 'candy'
  | 'snow'
  | 'starry'
  | 'savanna'
  | 'seaSky'
  | 'flowers'
  | 'party'
  | 'space';

export type Accessory = 'crown' | 'scarf' | 'partyHat' | 'sunglasses' | 'bow' | 'helmet' | 'flower';

export type Dino = {
  id: string;
  name: string;
  kind: CharacterKind;
  palette: Palette;
  scene: SceneKind;
  accessory?: Accessory;
  spots?: boolean;
};

/** Aksesuarların karaktere yerleşeceği noktalar (300x300 çizim alanında) */
export type Anchors = {
  top: [number, number];
  eye: [number, number, number];
  neck: [number, number];
  head: [number, number, number];
};
