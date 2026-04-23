import { D } from '../core/bignum';
import type { GameState } from '../core/types';
import type { AchievementReward } from '../core/rewards';
import { currentSeason } from '../core/seasons';
import { BUILDINGS } from './buildings';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: (s: GameState) => boolean;
  rewardLabel: string;
  reward?: AchievementReward;
  category: 'production' | 'click' | 'building' | 'event' | 'prestige';
}

const TOTAL_AT_LEAST = (v: number | string) => (s: GameState) => s.totalDropsEver.gte(D(v));
const CLICKS_AT_LEAST = (n: number) => (s: GameState) => s.totalClicks >= n;
const BUILDING_AT_LEAST = (id: import('../core/types').BuildingId, n: number) => (s: GameState) =>
  s.buildings[id] >= n;
const ALL_BUILDINGS_AT_LEAST = (n: number) => (s: GameState) =>
  BUILDINGS.every((b) => s.buildings[b.id] >= n);
const OWNS_ONE_OF_EACH = (s: GameState) => BUILDINGS.every((b) => s.buildings[b.id] >= 1);

export const ACHIEVEMENTS: AchievementDef[] = [
  // Production (A1-A10)
  { id: 'a1', name: 'Première goutte', description: 'Produire 1 goutte.', condition: TOTAL_AT_LEAST(1), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'production' },
  { id: 'a2', name: 'Le petit bouilleur', description: '1 000 gouttes produites.', condition: TOTAL_AT_LEAST(1_000), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'production' },
  { id: 'a3', name: 'Apprenti sucrier', description: '1 M gouttes produites.', condition: TOTAL_AT_LEAST(1_000_000), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'production' },
  { id: 'a4', name: 'Maître érablier', description: '1 G gouttes produites.', condition: TOTAL_AT_LEAST(1e9), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'production' },
  { id: 'a5', name: 'Baron du sucre', description: '1 T gouttes produites.', condition: TOTAL_AT_LEAST(1e12), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'production' },
  { id: 'a6', name: 'Seigneur du sirop', description: '1 Qa gouttes produites.', condition: TOTAL_AT_LEAST(1e15), rewardLabel: '+2% SPS', reward: { kind: 'sps', pct: 0.02 }, category: 'production' },
  { id: 'a7', name: 'Empereur de l\'érable', description: '1 Qi gouttes produites.', condition: TOTAL_AT_LEAST(1e18), rewardLabel: '+2% SPS', reward: { kind: 'sps', pct: 0.02 }, category: 'production' },
  { id: 'a8', name: 'Divinité sucrière', description: '1 Sx gouttes produites.', condition: TOTAL_AT_LEAST(1e21), rewardLabel: '+3% SPS', reward: { kind: 'sps', pct: 0.03 }, category: 'production' },
  { id: 'a9', name: 'Au-delà du sucre', description: '1 Oc gouttes produites.', condition: TOTAL_AT_LEAST(1e27), rewardLabel: '+5% SPS', reward: { kind: 'sps', pct: 0.05 }, category: 'production' },
  { id: 'a10', name: 'L\'Érable Éternel', description: 'Atteindre niv 20.', condition: (s) => s.level >= 20, rewardLabel: '+10% SPS', reward: { kind: 'sps', pct: 0.10 }, category: 'production' },

  // Click (A11-A15)
  { id: 'a11', name: 'Premier coup', description: '1 clic.', condition: CLICKS_AT_LEAST(1), rewardLabel: '+1% click', reward: { kind: 'click', pct: 0.01 }, category: 'click' },
  { id: 'a12', name: 'Doigts rapides', description: '1 000 clics.', condition: CLICKS_AT_LEAST(1_000), rewardLabel: '+5% click', reward: { kind: 'click', pct: 0.05 }, category: 'click' },
  { id: 'a13', name: 'Main d\'acier', description: '100 000 clics.', condition: CLICKS_AT_LEAST(100_000), rewardLabel: '+10% click', reward: { kind: 'click', pct: 0.10 }, category: 'click' },
  { id: 'a14', name: 'Tendinite légendaire', description: '1 M clics.', condition: CLICKS_AT_LEAST(1_000_000), rewardLabel: '+25% click', reward: { kind: 'click', pct: 0.25 }, category: 'click' },
  { id: 'a15', name: 'Le Clicker Ultime', description: '10 M clics.', condition: CLICKS_AT_LEAST(10_000_000), rewardLabel: '+5% crit chance', reward: { kind: 'critChance', value: 0.05 }, category: 'click' },

  // Buildings (A16-A25)
  { id: 'a16', name: 'Un peu de compagnie', description: '1 bâtiment acheté.', condition: (s) => BUILDINGS.some((b) => s.buildings[b.id] > 0), rewardLabel: '+1% SPS', reward: { kind: 'sps', pct: 0.01 }, category: 'building' },
  { id: 'a17', name: 'Ça commence à produire', description: '10 de chaque bâtiment tier 1-5.', condition: (s) => BUILDINGS.slice(0, 5).every((b) => s.buildings[b.id] >= 10), rewardLabel: 'Tier 1-5 +5%', reward: { kind: 'tier1to5', pct: 0.05 }, category: 'building' },
  { id: 'a18', name: 'Une vraie usine', description: '50 de chaque bâtiment tier 1-5.', condition: (s) => BUILDINGS.slice(0, 5).every((b) => s.buildings[b.id] >= 50), rewardLabel: 'Tier 1-5 +10%', reward: { kind: 'tier1to5', pct: 0.10 }, category: 'building' },
  { id: 'a19', name: 'Collection complète', description: '1 de chaque bâtiment.', condition: OWNS_ONE_OF_EACH, rewardLabel: '+5% SPS', reward: { kind: 'sps', pct: 0.05 }, category: 'building' },
  { id: 'a20', name: 'Centurion', description: '100 d\'un même bâtiment.', condition: (s) => BUILDINGS.some((b) => s.buildings[b.id] >= 100), rewardLabel: 'Bâtiments 100+: +5%', reward: { kind: 'centurion', pct: 0.05 }, category: 'building' },
  { id: 'a21', name: 'Mille unités', description: '1 000 d\'un même bâtiment.', condition: (s) => BUILDINGS.some((b) => s.buildings[b.id] >= 1000), rewardLabel: 'Bâtiments 1000+: +10%', reward: { kind: 'mille', pct: 0.10 }, category: 'building' },
  { id: 'a22', name: 'Forêt amazonienne', description: '500 érables matures.', condition: BUILDING_AT_LEAST('erableMature', 500), rewardLabel: 'Érables ×2', reward: { kind: 'building', target: 'erableMature', mult: 2 }, category: 'building' },
  { id: 'a23', name: 'Pipeline continental', description: '200 pipelines.', condition: BUILDING_AT_LEAST('pipeline', 200), rewardLabel: 'Pipelines ×2', reward: { kind: 'building', target: 'pipeline', mult: 2 }, category: 'building' },
  { id: 'a24', name: 'Monopole', description: '500 de chaque bâtiment.', condition: ALL_BUILDINGS_AT_LEAST(500), rewardLabel: 'SPS +10%', reward: { kind: 'sps', pct: 0.10 }, category: 'building' },
  { id: 'a25', name: 'L\'érablière du Valhalla', description: '1 000 de chaque bâtiment.', condition: ALL_BUILDINGS_AT_LEAST(1000), rewardLabel: 'SPS +20%', reward: { kind: 'sps', pct: 0.20 }, category: 'building' },

  // Events & secrets (A26-A32)
  { id: 'a26', name: 'Attrape-goutte', description: 'Cliquer 1 goutte dorée.', condition: (s) => s.goldensCaught >= 1, rewardLabel: 'Dorées +5s', reward: { kind: 'goldenDuration', seconds: 5 }, category: 'event' },
  { id: 'a27', name: 'Ninja sucré', description: '100 gouttes dorées attrapées.', condition: (s) => s.goldensCaught >= 100, rewardLabel: 'Dorées ×2 effet', reward: { kind: 'goldenEffect', mult: 2 }, category: 'event' },
  { id: 'a28', name: 'Castor vaincu', description: 'Chasser un castor en < 3s.', condition: (s) => s.castorFastKills >= 1, rewardLabel: 'Castors donnent 1%', reward: { kind: 'castorReward', pct: 0.01 }, category: 'event' },
  { id: 'a29', name: 'Insomniaque', description: 'Jouer 3h d\'affilée.', condition: (s) => Date.now() - s.startedAt >= 3 * 3600 * 1000, rewardLabel: '+5% SPS', reward: { kind: 'sps', pct: 0.05 }, category: 'event' },
  { id: 'a30', name: 'Retour triomphal', description: 'Revenir après 24h d\'absence.', condition: (s) => s.longestAwayMs >= 24 * 3600 * 1000, rewardLabel: 'Offline +25%', reward: { kind: 'offline', pct: 0.25 }, category: 'event' },
  { id: 'a31', name: 'Pleine lune maîtrisée', description: 'Survivre une pleine lune.', condition: (s) => s.doubledOnFullMoon === true, rewardLabel: 'Pleine lune +50% durée', reward: { kind: 'fullMoonDuration', pct: 0.50 }, category: 'event' },
  { id: 'a32', name: 'Le secret de grand-maman', description: '77 clics en 7s.', condition: (s) => s.secret77 === true, rewardLabel: 'Skin doré', reward: { kind: 'skin', skinId: 'doree' }, category: 'event' },

  // Prestige (A33-A35)
  { id: 'a33', name: 'Première réincarnation', description: 'Prestiger 1 fois.', condition: (s) => s.prestigeCount >= 1, rewardLabel: '+10% feuilles dorées', reward: { kind: 'feuilles', pct: 0.10 }, category: 'prestige' },
  { id: 'a34', name: 'Roue karmique', description: 'Prestiger 10 fois.', condition: (s) => s.prestigeCount >= 10, rewardLabel: '+50% feuilles dorées', reward: { kind: 'feuilles', pct: 0.50 }, category: 'prestige' },
  { id: 'a35', name: 'L\'éternel recommencement', description: 'Prestiger 100 fois.', condition: (s) => s.prestigeCount >= 100, rewardLabel: 'Skin cosmique', reward: { kind: 'skin', skinId: 'cosmique' }, category: 'prestige' },

  // Seasonal & prestige-gated (A36-A38) — added per audit recommendation.
  { id: 'a36', name: 'Frisson d\'hiver', description: 'Posséder 100 pipelines pendant l\'hiver.', condition: (s) => s.buildings.pipeline >= 100 && currentSeason(Date.now()) === 'hiver', rewardLabel: 'Pipelines +25%', reward: { kind: 'building', target: 'pipeline', mult: 1.25 }, category: 'building' },
  { id: 'a37', name: 'Veille de printemps', description: 'Posséder 1 cabane rustique au printemps.', condition: (s) => s.buildings.cabaneRustique >= 1 && currentSeason(Date.now()) === 'printemps', rewardLabel: '+3% SPS', reward: { kind: 'sps', pct: 0.03 }, category: 'building' },
  { id: 'a38', name: 'Sage des cycles', description: 'Atteindre niveau 5 avec 3 prestiges ou +.', condition: (s) => s.level >= 5 && s.prestigeCount >= 3, rewardLabel: '+5% SPS', reward: { kind: 'sps', pct: 0.05 }, category: 'prestige' },
];

export const ACHIEVEMENTS_BY_ID = ACHIEVEMENTS.reduce<Record<string, AchievementDef>>(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {},
);
