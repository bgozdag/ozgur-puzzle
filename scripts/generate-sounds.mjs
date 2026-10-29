// Uygulamadaki ses efektlerini ve kutlama şarkısını sentezleyip WAV olarak yazar.
// Kullanım: node scripts/generate-sounds.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
const N = { B2: 47, C3: 48, D3: 50, G2: 43,
  B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84, G4: 67, E4: 64 };

function makeBuffer(seconds) {
  return new Float32Array(Math.ceil(seconds * RATE));
}

// Zil benzeri, çizgi film tadında bir enstrüman (birkaç harmonik + üstel sönüm)
function addTone(buf, start, dur, freq, { vol = 0.3, harmonics = [1, 0.45, 0.2], decay = 3.5, attack = 0.008 } = {}) {
  const s0 = Math.floor(start * RATE);
  const len = Math.floor((dur + 0.15) * RATE);
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t) * (t > dur ? Math.exp(-(t - dur) * 30) : 1);
    let v = 0;
    harmonics.forEach((h, k) => { v += h * Math.sin(2 * Math.PI * freq * (k + 1) * t); });
    buf[s0 + i] += v * env * vol;
  }
}

function addTriangle(buf, start, dur, freq, vol = 0.22) {
  const s0 = Math.floor(start * RATE);
  const len = Math.floor(dur * RATE);
  for (let i = 0; i < len && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const phase = (freq * t) % 1;
    const tri = 4 * Math.abs(phase - 0.5) - 1;
    const env = Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.03);
    buf[s0 + i] += tri * env * vol;
  }
}

let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 * 2 - 1; };

function addKick(buf, start, vol = 0.5) {
  const s0 = Math.floor(start * RATE);
  for (let i = 0; i < RATE * 0.15 && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const f = 140 * Math.exp(-t * 25) + 45;
    buf[s0 + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 22) * vol;
  }
}

function addHat(buf, start, vol = 0.08) {
  const s0 = Math.floor(start * RATE);
  for (let i = 0; i < RATE * 0.04 && s0 + i < buf.length; i++) {
    const t = i / RATE;
    buf[s0 + i] += rand() * Math.exp(-t * 90) * vol;
  }
}

function addSweep(buf, start, dur, f0, f1, vol) {
  const s0 = Math.floor(start * RATE);
  let phase = 0;
  for (let i = 0; i < dur * RATE && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const f = f0 + (f1 - f0) * (t / dur);
    phase += (2 * Math.PI * f) / RATE;
    const env = Math.min(1, t / 0.005) * Math.exp(-t * (4 / dur));
    buf[s0 + i] += Math.sin(phase) * env * vol;
  }
}

function writeWav(name, buf) {
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0.95 ? 0.95 / peak : 1;
  const data = Buffer.alloc(buf.length * 2);
  buf.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * gain)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, name), Buffer.concat([header, data]));
  console.log(`${name}: ${(buf.length / RATE).toFixed(2)} sn`);
}

// --- Kutlama şarkısı ---
function celebrate() {
  const beat = 60 / 150;
  // [nota, vuruş]
  const fanfare = [['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 1], ['E5', 0.5], ['G5', 1]];
  const tune = [
    ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5], ['D5', 1],
    ['D5', 0.5], ['F5', 0.5], ['G5', 0.5], ['F5', 0.5], ['D5', 0.5], ['B4', 0.5], ['C5', 1],
    ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5], ['B5', 0.5], ['G5', 0.5], ['A5', 0.5], ['B5', 0.5],
    ['C6', 1], ['G5', 0.5], ['E5', 0.5], ['C6', 2],
  ];
  // Her ölçü 4 vuruş: fanfar 4 vuruş + 4 ölçülük şarkı
  const totalBeats = 4 + 16;
  const buf = makeBuffer(totalBeats * beat + 1.2);

  let t = 0;
  for (const [n, b] of fanfare) { addTone(buf, t, b * beat, midiToFreq(N[n]), { vol: 0.32 }); t += b * beat; }
  t = 4 * beat;
  for (const [n, b] of tune) { addTone(buf, t, b * beat, midiToFreq(N[n]), { vol: 0.3 }); t += b * beat; }

  // Ölçü başına bas (fanfar ölçüsü dahil)
  const bassLine = [['C3', 'G2', 'C3', 'G2'], ['C3', 'G2', 'C3', 'E4'], ['G2', 'D3', 'G2', 'B2'], ['C3', 'G2', 'C3', 'G2'], ['C3', 'G2', 'C3', 'C3']];
  bassLine.forEach((bar, bi) => bar.forEach((n, k) => {
    addTriangle(buf, (bi * 4 + k) * beat, beat * 0.8, midiToFreq(N[n]) / (n === 'E4' ? 4 : 1));
  }));

  for (let b = 0; b < totalBeats; b++) {
    if (b < totalBeats - 1) addKick(buf, b * beat, b % 2 === 0 ? 0.45 : 0.3);
    addHat(buf, b * beat + beat / 2);
  }
  // Final akoru
  const endT = (totalBeats - 2) * beat;
  [N.C5, N.E5, N.G5].forEach((m) => addTone(buf, endT, 2 * beat, midiToFreq(m), { vol: 0.12, decay: 1.5 }));
  addKick(buf, endT, 0.5);
  return buf;
}

function snap() {
  const buf = makeBuffer(0.35);
  addSweep(buf, 0, 0.07, 500, 1100, 0.5);
  addTone(buf, 0.05, 0.12, 1318.5, { vol: 0.35, decay: 14 });
  addTone(buf, 0.1, 0.15, 1760, { vol: 0.25, decay: 12 });
  return buf;
}

function pick() {
  const buf = makeBuffer(0.12);
  addSweep(buf, 0, 0.08, 380, 620, 0.35);
  return buf;
}

writeWav('celebrate.wav', celebrate());
writeWav('snap.wav', snap());
writeWav('pick.wav', pick());
