import Decimal from 'break_infinity.js';

export type BigNum = Decimal;

export const D = (v: number | string | Decimal): Decimal => new Decimal(v);

export const ZERO = D(0);
export const ONE = D(1);

const SUFFIXES = [
  '',
  ' K',
  ' M',
  ' G',
  ' T',
  ' Qa',
  ' Qi',
  ' Sx',
  ' Sp',
  ' Oc',
  ' No',
  ' Dc',
];

const SCIENTIFIC_THRESHOLD_EXP = 36;

export function format(value: Decimal, digits = 2): string {
  // Defensive: break_infinity can end up NaN/Infinity from bad arithmetic
  const n0 = value.toNumber();
  if (!Number.isFinite(n0)) return '0';

  if (value.lt(1000) && value.gt(-1000)) {
    const n = value.toNumber();
    if (Number.isInteger(n) || value.lt(1)) return n.toFixed(0);
    return n.toFixed(digits);
  }

  const expRaw = value.log10();
  if (!Number.isFinite(expRaw)) return '0';
  const exp = Math.floor(expRaw);
  if (exp >= SCIENTIFIC_THRESHOLD_EXP) {
    const mantissa = value.div(D(10).pow(exp));
    return `${mantissa.toNumber().toFixed(3)}e${exp}`;
  }

  const tier = Math.floor(exp / 3);
  const scale = D(10).pow(tier * 3);
  const scaled = value.div(scale).toNumber();
  if (!Number.isFinite(scaled)) return '0';
  return `${scaled.toFixed(digits)}${SUFFIXES[tier] ?? 'e' + exp}`;
}

export function formatRate(value: Decimal): string {
  return `${format(value)}/s`;
}

export function min(a: Decimal, b: Decimal): Decimal {
  return a.lt(b) ? a : b;
}

export function max(a: Decimal, b: Decimal): Decimal {
  return a.gt(b) ? a : b;
}
