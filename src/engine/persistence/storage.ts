const KEY = 'empire_sirop_erable_save';

export function loadRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveRaw(value: string): void {
  try {
    localStorage.setItem(KEY, value);
  } catch (err) {
    console.error('Failed to save:', err);
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function backupCorrupt(raw: string): void {
  try {
    localStorage.setItem(`${KEY}_corrupt_${Date.now()}`, raw);
  } catch {
    /* noop */
  }
}
