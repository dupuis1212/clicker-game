/**
 * Coulée du printemps — real-world seasonal event.
 *
 * Pendant mars + avril IRL (la vraie saison des sucres au Québec), la
 * production globale est boostée et les gouttes dorées apparaissent
 * plus souvent. L'event vit indépendamment du cycle interne des saisons
 * (15 min de jeu par saison) — il s'appuie sur la date réelle du joueur.
 *
 * C'est à la fois un hook FOMO fort ("tu dois jouer en mars!") et une
 * touche thématique — la sève coule IRL, elle coule dans le jeu.
 */

/** True if the user's local date falls in the real maple-tapping window. */
export function isCouleeActive(now: Date = new Date()): boolean {
  const m = now.getMonth(); // 0-indexed
  return m === 2 || m === 3; // March or April
}

/** Global SPS multiplier applied while coulée is active. */
export function couleeSpsMultiplier(now: Date = new Date()): number {
  return isCouleeActive(now) ? 1.5 : 1;
}

/**
 * Reduction applied to golden-drop scheduling delay during coulée.
 * 0.6 means delays are 60% of normal (→ 67% more frequent).
 */
export function couleeGoldenMultiplier(now: Date = new Date()): number {
  return isCouleeActive(now) ? 0.6 : 1;
}

/** Days remaining (integer) until the coulée window closes. */
export function couleeDaysLeft(now: Date = new Date()): number {
  if (!isCouleeActive(now)) return 0;
  const year = now.getFullYear();
  const end = new Date(year, 4, 1); // May 1st, exclusive
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 3600 * 1000)));
}

/**
 * First-time-per-year welcome bonus when coulée starts, to create a
 * memorable "it's sugar season!" moment. Returns the number of seconds
 * of SPS to instantly grant, or 0 if no bonus should fire.
 */
export function shouldGrantCouleeWelcome(state: { couleeWelcomeYear: number }): boolean {
  const now = new Date();
  return isCouleeActive(now) && state.couleeWelcomeYear !== now.getFullYear();
}
