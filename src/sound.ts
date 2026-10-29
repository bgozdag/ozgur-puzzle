import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  celebrate: require('../assets/sounds/celebrate.wav'),
  snap: require('../assets/sounds/snap.wav'),
  pick: require('../assets/sounds/pick.wav'),
};

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export function initSounds() {
  // Telefon sessizdeyken de (iOS) oyunun sesleri duyulsun
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    if (!players[name]) players[name] = createAudioPlayer(SOURCES[name]);
  });
  if (players.pick) players.pick.volume = 0.5;
}

export function playSound(name: SoundName) {
  const p = players[name];
  if (!p) return;
  try {
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // Ses çalınamazsa oyun yine devam etsin
  }
}

export function stopSound(name: SoundName) {
  try {
    players[name]?.pause();
  } catch {
    // yoksay
  }
}
