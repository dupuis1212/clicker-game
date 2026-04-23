import seedrandom from 'seedrandom';

let rng: seedrandom.PRNG | null = null;

export function initRng(seedState: string | null): void {
  const prng = seedrandom(undefined, { state: true }) as any;
  if (seedState) {
    try {
      const parsed = JSON.parse(seedState);
      rng = seedrandom('', { state: parsed }) as seedrandom.PRNG;
      return;
    } catch {
      /* fall through */
    }
  }
  rng = prng as seedrandom.PRNG;
}

export function rand(): number {
  if (!rng) initRng(null);
  return rng!.quick();
}

export function rngState(): string | null {
  if (!rng) return null;
  try {
    const s = (rng as any).state();
    return JSON.stringify(s);
  } catch {
    return null;
  }
}
