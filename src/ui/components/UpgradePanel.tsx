import { useState } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';
import { format } from '../../core/bignum';
import { CLICK_UPGRADES } from '../../data/clickUpgrades';
import { GLOBAL_UPGRADES } from '../../data/globalUpgrades';

function upgradeEffectLabel(
  u: (typeof CLICK_UPGRADES)[number],
): string {
  switch (u.kind) {
    case 'clickMult':
      return `Clic ×${u.value}`;
    case 'clickPctSps':
      return `Clic +${(u.value * 100).toFixed(0)}% SPS`;
    case 'critChance':
      return `Crit ${(u.value * 100).toFixed(0)}%`;
    case 'critMult':
      return `Crit ×${u.value}`;
  }
}

export function UpgradePanel() {
  const drops = useGameSelector((s) => s.drops);
  const sirop = useGameSelector((s) => s.sirop);
  const sucre = useGameSelector((s) => s.sucre);
  const owned = useGameSelector((s) => s.clickUpgrades);
  const globalOwned = useGameSelector((s) => s.globalUpgrades);
  const level = useGameSelector((s) => s.level);
  const actions = useActions();
  const [flashId, setFlashId] = useState<string | null>(null);

  const buyClick = (id: string) => {
    actions.buyClickUpgrade(id);
    setFlashId(id);
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 600);
  };
  const buyGlobal = (id: string) => {
    actions.buyGlobalUpgrade(id);
    setFlashId(id);
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 600);
  };

  return (
    <aside className="upgrade-panel">
      <h2 className="panel-title">⚡ Upgrades de clic</h2>
      {CLICK_UPGRADES.map((u) => {
        const isOwned = owned[u.id];
        const unlockAt = u.unlockLevel ?? 1;
        const locked = level < unlockAt;
        const canAfford = drops.gte(u.cost) && !isOwned && !locked;

        return (
          <div
            key={u.id}
            className={`upgrade-row${
              isOwned
                ? ' disabled'
                : locked
                ? ' locked'
                : !canAfford
                ? ' disabled'
                : ''
            }${flashId === u.id ? ' flash-bought' : ''}`}
            onClick={() => !isOwned && canAfford && buyClick(u.id)}
            title={`${u.name} — ${upgradeEffectLabel(u)}`}
          >
            <div className="icon">{isOwned ? '✅' : locked ? '🔒' : '⬆️'}</div>
            <div className="body">
              <div className="name">{u.name}</div>
              <div className="effect">{upgradeEffectLabel(u)}</div>
              {!isOwned && (
                <div className={`cost${canAfford ? '' : ' cant-afford'}`}>
                  {locked ? `Niv ${unlockAt}` : `${format(u.cost)} 💧`}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <h2 className="panel-title">🏆 Upgrades globaux</h2>
      <div className="currency-legend">
        <div className={`legend-row${level >= 5 ? '' : ' locked'}`}>
          <span className="legend-icon">🍯</span>
          <div>
            <strong>Sirop d'érable</strong>
            <span className="legend-hint">1 🍯 = 1 000 💧 · auto dès niv 5</span>
          </div>
        </div>
        <div className={`legend-row${level >= 10 ? '' : ' locked'}`}>
          <span className="legend-icon">🧊</span>
          <div>
            <strong>Sucre d'érable</strong>
            <span className="legend-hint">1 🧊 = 1 000 🍯 · auto dès niv 10</span>
          </div>
        </div>
      </div>
      {GLOBAL_UPGRADES.map((u) => {
        const isOwned = globalOwned[u.id];
        const unlockAt = u.unlockLevel ?? 1;
        const locked = level < unlockAt;
        const balance = u.currency === 'sirop' ? sirop : sucre;
        const canAfford = balance.gte(u.cost) && !isOwned && !locked;
        const currencyIcon = u.currency === 'sirop' ? '🍯' : '🧊';
        const currencyName = u.currency === 'sirop' ? 'sirop' : 'sucre';

        return (
          <div
            key={u.id}
            className={`upgrade-row${
              isOwned
                ? ' disabled'
                : locked
                ? ' locked'
                : !canAfford
                ? ' disabled'
                : ''
            }${flashId === u.id ? ' flash-bought' : ''}`}
            onClick={() => !isOwned && canAfford && buyGlobal(u.id)}
          >
            <div className="icon">{isOwned ? '✅' : locked ? '🔒' : '🌟'}</div>
            <div className="body">
              <div className="name">{u.name}</div>
              <div className="effect">
                {u.kind === 'allBuildingsMult'
                  ? `Tous les bâtiments ×${u.value}`
                  : u.kind === 'buildingMult'
                  ? `${u.target?.join(', ')} ×${u.value}`
                  : `Événement ×${u.value}`}
              </div>
              {!isOwned && (
                <div className={`cost${canAfford ? '' : ' cant-afford'}`}>
                  {locked
                    ? `🔒 Déverrouille au niv ${unlockAt}`
                    : `${format(u.cost)} ${currencyIcon} ${currencyName}`}
                </div>
              )}
            </div>
          </div>
        );
      })}

    </aside>
  );
}
