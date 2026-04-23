/**
 * Audio system:
 *  - SFX (procedural short sounds)
 *  - Seasonal background music (procedural, 4 distinct tracks that crossfade)
 *
 * No external audio files. Uses Web Audio API.
 */
import { useGameStore } from './store';
import { currentSeason } from '../core/seasons';
import type { Season } from '../core/types';

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function sfxVolume(): number {
  try {
    return useGameStore.getState().settings?.volume ?? 0.5;
  } catch {
    return 0.3;
  }
}

function targetMusicVolume(): number {
  try {
    const s = useGameStore.getState().settings;
    return s?.music ? (s.musicVolume ?? 0.35) * (s.volume ?? 0.5) * 0.8 : 0;
  } catch {
    return 0;
  }
}

// ───────────────────── SFX ─────────────────────

type Voice = { freq: number; duration: number; type?: OscillatorType; slideTo?: number };

function playSfxVoice({ freq, duration, type = 'sine', slideTo }: Voice, vol = 1): void {
  const c = getContext();
  if (!c) return;
  const v = sfxVolume() * vol;
  if (v <= 0.001) return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(10, slideTo),
      c.currentTime + duration,
    );
  }
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(v * 0.25, c.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  // Soft wooden "plok" — sine wave with quick pitch drop
  click: () => playSfxVoice({ freq: 420, duration: 0.08, type: 'sine', slideTo: 240 }, 0.35),
  crit: () => {
    playSfxVoice({ freq: 660, duration: 0.1, type: 'triangle', slideTo: 990 }, 0.6);
    setTimeout(
      () => playSfxVoice({ freq: 1320, duration: 0.12, type: 'sine', slideTo: 1760 }, 0.5),
      60,
    );
  },
  buy: () => playSfxVoice({ freq: 440, duration: 0.12, slideTo: 660, type: 'triangle' }, 0.7),
  upgrade: () => {
    playSfxVoice({ freq: 523, duration: 0.12, type: 'triangle' }, 0.8);
    setTimeout(() => playSfxVoice({ freq: 784, duration: 0.15, type: 'triangle' }, 0.8), 80);
  },
  achievement: () => {
    playSfxVoice({ freq: 659, duration: 0.12, type: 'sine' }, 0.9);
    setTimeout(() => playSfxVoice({ freq: 880, duration: 0.12, type: 'sine' }, 0.9), 90);
    setTimeout(() => playSfxVoice({ freq: 1175, duration: 0.25, type: 'sine' }, 0.9), 200);
  },
  levelUp: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(
        () => playSfxVoice({ freq: f, duration: 0.2, type: 'triangle' }, 1),
        i * 90,
      ),
    );
  },
  event: () => playSfxVoice({ freq: 350, duration: 0.3, slideTo: 700, type: 'sawtooth' }, 0.6),
  golden: () => {
    [880, 1046, 1318].forEach((f, i) =>
      setTimeout(
        () => playSfxVoice({ freq: f, duration: 0.15, type: 'sine' }, 0.8),
        i * 50,
      ),
    );
  },
};

// ───────────────────── MUSIC ─────────────────────

// Note frequencies (A=440 Hz)
const N = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98, A2: 110, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  Cs3: 138.59, Ds3: 155.56, Fs3: 185, Gs3: 207.65, As3: 233.08,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  Cs4: 277.18, Ds4: 311.13, Fs4: 369.99, Gs4: 415.30, As4: 466.16,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
  Fs5: 739.99,
};

// 0 = rest
type Step = number;

interface Track {
  bpm: number;
  bass: Step[]; // one entry per beat
  pad: Step[][]; // chord tones per chord (length = chord changes in one loop)
  beatsPerChord: number;
  melody: Step[]; // one entry per beat
  sparkle?: Step[]; // optional decorative notes
  bassType: OscillatorType;
  padType: OscillatorType;
  melodyType: OscillatorType;
  bassVol: number;
  padVol: number;
  melodyVol: number;
  feel: 'bright' | 'warm' | 'melancholic' | 'crystalline';
}

const TRACKS: Record<Season, Track> = {
  /** 🌸 Printemps : D major, 100 BPM, cheerful & bouncy. */
  printemps: {
    bpm: 100,
    beatsPerChord: 4,
    bass: [
      N.D2, N.D2, N.A2, N.D2,      // D chord
      N.A2, N.A2, N.E3, N.A2,      // A chord
      N.B2, N.B2, N.Fs3, N.B2,     // Bm chord
      N.G2, N.G2, N.D3, N.G2,      // G chord
    ],
    pad: [
      [N.D3, N.Fs3, N.A3],         // D
      [N.E3, N.A3, N.Cs4],         // A (C#4)
      [N.B2, N.D3, N.Fs3],         // Bm
      [N.D3, N.G3, N.B3],          // G
    ],
    melody: [
      N.D4, N.Fs4, N.A4, N.Fs4,
      N.E4, N.A4, N.Cs4, N.A4,
      N.Fs4, N.B4, N.D5, N.B4,
      N.G4, N.D5, N.B4, N.D5,
    ],
    sparkle: [0, 0, 0, N.Fs5, 0, 0, 0, N.A5, 0, 0, 0, N.B5, 0, 0, 0, N.D5],
    bassType: 'triangle',
    padType: 'sine',
    melodyType: 'triangle',
    bassVol: 0.14,
    padVol: 0.05,
    melodyVol: 0.09,
    feel: 'bright',
  },

  /** ☀️ Été : G major, 84 BPM, warm & languid. */
  ete: {
    bpm: 84,
    beatsPerChord: 4,
    bass: [
      N.G2, 0, N.D3, 0,            // G
      N.E2, 0, N.B2, 0,            // Em
      N.C3, 0, N.G3, 0,            // C
      N.D3, 0, N.A3, 0,            // D
    ],
    pad: [
      [N.G3, N.B3, N.D4],
      [N.E3, N.G3, N.B3],
      [N.C4, N.E4, N.G4],
      [N.D4, N.Fs4, N.A4],
    ],
    melody: [
      N.G4, 0, N.B4, 0,
      N.G4, 0, N.E4, 0,
      N.E4, 0, N.G4, 0,
      N.Fs4, 0, N.A4, 0,
    ],
    sparkle: [0, 0, 0, 0, 0, 0, 0, N.D5, 0, 0, 0, 0, 0, 0, 0, N.G5],
    bassType: 'sine',
    padType: 'triangle',
    melodyType: 'sine',
    bassVol: 0.12,
    padVol: 0.07,
    melodyVol: 0.08,
    feel: 'warm',
  },

  /** 🍂 Automne : A minor, 72 BPM, melancholic & folk. */
  automne: {
    bpm: 72,
    beatsPerChord: 4,
    bass: [
      N.A2, N.A2, N.E3, N.A2,      // Am
      N.F2, N.F2, N.C3, N.F2,      // F
      N.C3, N.C3, N.G3, N.C3,      // C
      N.G2, N.G2, N.D3, N.G2,      // G
    ],
    pad: [
      [N.A3, N.C4, N.E4],
      [N.F3, N.A3, N.C4],
      [N.C4, N.E4, N.G4],
      [N.G3, N.B3, N.D4],
    ],
    melody: [
      N.E4, N.C4, N.A3, N.C4,
      N.C4, N.A3, N.F3, N.A3,
      N.G4, N.E4, N.C4, N.E4,
      N.D4, N.B3, N.G3, N.B3,
    ],
    sparkle: [
      0, 0, 0, N.A4, 0, 0, 0, N.F4,
      0, 0, 0, N.E4, 0, 0, 0, N.D4,
    ],
    bassType: 'triangle',
    padType: 'sine',
    melodyType: 'triangle',
    bassVol: 0.13,
    padVol: 0.06,
    melodyVol: 0.09,
    feel: 'melancholic',
  },

  /** ❄️ Hiver : E minor, 60 BPM, crystalline & sparse. */
  hiver: {
    bpm: 60,
    beatsPerChord: 4,
    bass: [
      N.E2, 0, 0, 0,               // Em
      N.C3, 0, 0, 0,               // C
      N.G2, 0, 0, 0,               // G
      N.D3, 0, 0, 0,               // D
    ],
    pad: [
      [N.E3, N.G3, N.B3],
      [N.C3, N.E3, N.G3],
      [N.G3, N.B3, N.D4],
      [N.D3, N.Fs3, N.A3],
    ],
    melody: [
      N.B4, 0, N.E5, N.G5,
      N.G4, 0, N.C5, N.E5,
      N.D5, 0, N.G5, N.B5,
      N.Fs5, 0, N.A4, N.D5,
    ],
    sparkle: [
      0, N.B5, 0, 0, 0, N.G5, 0, 0,
      0, N.D5, 0, 0, 0, N.Fs5, 0, 0,
    ],
    bassType: 'sine',
    padType: 'sine',
    melodyType: 'triangle',
    bassVol: 0.1,
    padVol: 0.06,
    melodyVol: 0.1,
    feel: 'crystalline',
  },
};

// ── Engine ──

interface ActiveSource {
  gain: GainNode;
}

let musicMaster: GainNode | null = null;
let currentMaster: GainNode | null = null; // the currently-playing track's gain
let nextMaster: GainNode | null = null; // during crossfade
let currentSeasonPlaying: Season | null = null;
let musicTimerId: number | null = null;
let beatCounter = 0;

function ensureMasters(): boolean {
  const c = getContext();
  if (!c) return false;
  if (!musicMaster) {
    musicMaster = c.createGain();
    musicMaster.gain.value = 0;
    musicMaster.connect(c.destination);
  }
  if (!currentMaster) {
    currentMaster = c.createGain();
    currentMaster.gain.value = 1;
    currentMaster.connect(musicMaster);
  }
  return true;
}

function playMusicNote(
  freq: number,
  durationSec: number,
  type: OscillatorType,
  vol: number,
  dest: AudioNode,
): ActiveSource | null {
  if (freq <= 0) return null;
  const c = getContext();
  if (!c) return null;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  // Envelope
  const now = c.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.03);
  gain.gain.linearRampToValueAtTime(vol * 0.6, now + durationSec * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  osc.connect(gain).connect(dest);
  osc.start();
  osc.stop(now + durationSec);
  return { gain };
}

function currentTrack(): Track {
  const s = currentSeasonPlaying ?? 'printemps';
  return TRACKS[s];
}

function musicTick(): void {
  if (musicTimerId == null) return;
  ensureMasters();
  const track = currentTrack();
  const master = (nextMaster ?? currentMaster)!;

  const loopLen = track.bass.length;
  const i = beatCounter % loopLen;

  const beatSec = 60 / track.bpm;
  const chordIdx = Math.floor(i / track.beatsPerChord) % track.pad.length;
  const chord = track.pad[chordIdx];

  // Bass
  const bassNote = track.bass[i];
  if (bassNote > 0) {
    playMusicNote(bassNote, beatSec * 2.8, track.bassType, track.bassVol, master);
  }

  // Pad on first beat of each chord — sustained through the chord
  if (i % track.beatsPerChord === 0) {
    const chordDur = beatSec * track.beatsPerChord * 1.15;
    for (const note of chord) {
      playMusicNote(note, chordDur, track.padType, track.padVol, master);
    }
  }

  // Melody
  const melNote = track.melody[i];
  if (melNote > 0) {
    playMusicNote(melNote, beatSec * 1.15, track.melodyType, track.melodyVol, master);
  }

  // Sparkle (offbeat)
  if (track.sparkle) {
    const sp = track.sparkle[i];
    if (sp > 0) {
      setTimeout(() => {
        playMusicNote(sp, beatSec * 0.7, 'sine', track.melodyVol * 0.5, master);
      }, (beatSec / 2) * 1000);
    }
  }

  beatCounter++;
}

function reschedule(): void {
  if (musicTimerId != null) {
    clearInterval(musicTimerId);
    musicTimerId = null;
  }
  const track = currentTrack();
  const intervalMs = (60 / track.bpm) * 1000;
  musicTimerId = window.setInterval(musicTick, intervalMs);
}

/**
 * Crossfade to a new season's track (or start cold).
 */
function swapToSeason(season: Season): void {
  const c = getContext();
  if (!c) return;
  if (!ensureMasters()) return;

  if (currentSeasonPlaying === season && currentMaster) {
    return;
  }

  // First start
  if (currentSeasonPlaying == null) {
    currentSeasonPlaying = season;
    beatCounter = 0;
    reschedule();
    return;
  }

  // Crossfade: fade current out, bring up next
  const fadeSec = 2.0;
  const now = c.currentTime;

  const oldMaster = currentMaster!;
  oldMaster.gain.cancelScheduledValues(now);
  oldMaster.gain.setValueAtTime(oldMaster.gain.value, now);
  oldMaster.gain.linearRampToValueAtTime(0, now + fadeSec);

  // New master
  const newM = c.createGain();
  newM.gain.value = 0;
  newM.connect(musicMaster!);
  newM.gain.linearRampToValueAtTime(1, now + fadeSec);

  nextMaster = newM;
  currentSeasonPlaying = season;
  beatCounter = 0;
  reschedule();

  // After fade, cleanup old
  setTimeout(() => {
    try {
      oldMaster.disconnect();
    } catch {
      /* ignore */
    }
    currentMaster = newM;
    nextMaster = null;
  }, fadeSec * 1000 + 50);
}

let seasonWatcherId: number | null = null;

function startSeasonWatcher(): void {
  if (seasonWatcherId != null) return;
  const tick = () => {
    const season = currentSeason(Date.now());
    if (season !== currentSeasonPlaying) swapToSeason(season);
  };
  tick();
  seasonWatcherId = window.setInterval(tick, 5_000);
}

function stopSeasonWatcher(): void {
  if (seasonWatcherId != null) {
    clearInterval(seasonWatcherId);
    seasonWatcherId = null;
  }
}

let musicPlaying = false;
let volumePollId: number | null = null;

export function startMusic(): void {
  const c = getContext();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  if (!ensureMasters()) return;
  if (musicPlaying) return;

  // Fade in music master
  const now = c.currentTime;
  musicMaster!.gain.cancelScheduledValues(now);
  musicMaster!.gain.setValueAtTime(musicMaster!.gain.value, now);
  musicMaster!.gain.linearRampToValueAtTime(targetMusicVolume(), now + 1.5);

  startSeasonWatcher();
  musicPlaying = true;

  if (volumePollId == null) {
    volumePollId = window.setInterval(() => {
      if (!musicMaster || !ctx) return;
      const target = targetMusicVolume();
      musicMaster.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.3);
    }, 400);
  }
}

export function stopMusic(): void {
  const c = getContext();
  if (!c || !musicMaster) return;
  musicMaster.gain.cancelScheduledValues(c.currentTime);
  musicMaster.gain.linearRampToValueAtTime(0, c.currentTime + 1.0);
  if (musicTimerId != null) {
    // keep scheduler running so it resumes seamlessly; just silence master
  }
  stopSeasonWatcher();
  musicPlaying = false;
}

export function toggleMusic(on: boolean): void {
  if (on) startMusic();
  else stopMusic();
}

/**
 * Unlock audio context on first user gesture (browsers require this).
 * Starts music if settings allow.
 */
export function unlockAudio(): void {
  const c = getContext();
  if (c && c.state === 'suspended') c.resume().catch(() => {});
  try {
    const s = useGameStore.getState().settings;
    if (s?.music !== false) startMusic();
  } catch {
    /* noop */
  }
}

/**
 * Attach global listeners so music starts on ANY user interaction, not just
 * tree clicks. Called once from main.tsx.
 */
export function installAudioUnlock(): void {
  const handler = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', handler, true);
    window.removeEventListener('keydown', handler, true);
    window.removeEventListener('touchstart', handler, true);
  };
  window.addEventListener('pointerdown', handler, true);
  window.addEventListener('keydown', handler, true);
  window.addEventListener('touchstart', handler, true);
}
