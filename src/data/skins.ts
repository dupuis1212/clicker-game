export interface SkinDef {
  id: string;
  name: string;
  emoji: string;
  cost: number; // essence
  unlockCondition?: string;
  description: string;
  /**
   * Si l'emoji contient déjà un tronc/base (ou n'a pas besoin du tronc CSS
   * hachuré), on ne rend pas le `<span class="tree-trunk" />`. Évite le
   * moignon de bois qui dépasse d'un palmier, sapin, etc.
   */
  hasOwnTrunk?: boolean;
}

/**
 * Coûts calibrés pour être accessibles avec 35 achievements + 2 ✨/prestige.
 * Total cumulé des skins payants : 2+3+5+7+10+12+15 = 54 ✨.
 */
export const TREE_SKINS: SkinDef[] = [
  { id: 'default', name: 'Érable classique', emoji: '🍁', cost: 0, description: 'Le compagnon de toujours.' },
  { id: 'cerisier', name: 'Cerisier en fleurs', emoji: '🌸', cost: 2, description: 'Japon-érable — printemps permanent.' },
  { id: 'palmier', name: 'Palmier tropical', emoji: '🌴', cost: 3, description: 'La sève tropicale a son charme.', hasOwnTrunk: true },
  { id: 'sequoia', name: 'Séquoia géant', emoji: '🌲', cost: 5, description: 'Vénérable ancien des forêts.', hasOwnTrunk: true },
  { id: 'champignon', name: 'Champignon géant', emoji: '🍄', cost: 7, description: 'Ça fait de la spore-sève.', hasOwnTrunk: true },
  { id: 'noel', name: 'Sapin de Noël', emoji: '🎄', cost: 10, description: 'Festif toute l\'année.', hasOwnTrunk: true },
  { id: 'doree', name: 'Érable doré', emoji: '🌟', cost: 12, description: 'Secret de grand-maman révélé.', hasOwnTrunk: true },
  { id: 'cosmique', name: 'Arbre cosmique', emoji: '🌌', cost: 15, description: 'Un érable issu d\'une autre dimension.', hasOwnTrunk: true },
];

export const TREE_SKINS_BY_ID = TREE_SKINS.reduce<Record<string, SkinDef>>((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});
