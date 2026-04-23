import { useState } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';
import { format, formatRate } from '../../core/bignum';
import {
  buildingCost,
  buildingCostBulk,
  buildingSps,
  maxAffordable,
} from '../../core/formulas';
import { BUILDINGS, BUILDINGS_BY_ID } from '../../data/buildings';
import type { BuildingId } from '../../core/types';

type BuyAmount = 1 | 10 | 100 | 'max';

interface Hovered {
  id: BuildingId;
  top: number;
  left: number;
}

export function Shop() {
  const drops = useGameSelector((s) => s.drops);
  const buildings = useGameSelector((s) => s.buildings);
  const level = useGameSelector((s) => s.level);
  const state = useGameSelector((s) => s);
  const actions = useActions();
  const [amount, setAmount] = useState<BuyAmount>(1);
  const [hovered, setHovered] = useState<Hovered | null>(null);
  const [flashId, setFlashId] = useState<BuildingId | null>(null);

  const onEnter = (id: BuildingId, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHovered({ id, top: rect.top + rect.height / 2, left: rect.left });
  };

  const buy = (id: BuildingId, n: number) => {
    actions.buyBuilding(id, n);
    setFlashId(id);
    setTimeout(() => setFlashId((f) => (f === id ? null : f)), 500);
  };

  const hoveredBuilding = hovered ? BUILDINGS.find((b) => b.id === hovered.id) : null;
  const hoveredOwned = hovered ? buildings[hovered.id] : 0;

  return (
    <>
      <aside className="shop">
        <h2 className="panel-title">🏗️ Bâtiments</h2>
        <div className="buy-amount-legend">
          <div className="buy-amount-label">Combien acheter par clic :</div>
          <div className="buy-amount-switcher">
            {([1, 10, 100, 'max'] as const).map((a) => (
              <button
                key={a}
                className={amount === a ? 'active' : ''}
                onClick={() => setAmount(a)}
                title={
                  a === 1
                    ? 'Achète 1 bâtiment'
                    : a === 'max'
                    ? "Achète le maximum possible avec tes gouttes"
                    : `Achète ${a} bâtiments d'un coup (coût cumulé)`
                }
              >
                x{a}
              </button>
            ))}
          </div>
          <div className="buy-amount-hint">
            {amount === 1 && '1 bâtiment par clic'}
            {amount === 10 && '10 bâtiments par clic (coût cumulé)'}
            {amount === 100 && '100 bâtiments par clic (coût cumulé)'}
            {amount === 'max' && 'Maximum que tu peux te payer maintenant'}
          </div>
        </div>
        {BUILDINGS.map((b) => {
          const owned = buildings[b.id];
          const unlocked = level >= b.unlockLevel;
          const realAmount =
            amount === 'max' ? Math.max(1, maxAffordable(b.id, owned, drops)) : amount;
          const cost =
            realAmount === 1 ? buildingCost(b.id, owned) : buildingCostBulk(b.id, owned, realAmount);
          const canAfford = drops.gte(cost) && unlocked && realAmount > 0;

          return (
            <div
              key={b.id}
              className={`building-row${!unlocked ? ' locked' : !canAfford ? ' disabled' : ''}${flashId === b.id ? ' flash-bought' : ''}`}
              onClick={() => unlocked && canAfford && buy(b.id, realAmount)}
              onMouseEnter={(e) => unlocked && onEnter(b.id, e)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="icon">{b.icon}</div>
              <div className="body">
                <div className="name">
                  {unlocked ? b.name : `🔒 Niv ${b.unlockLevel}`}
                </div>
                <div className={`cost${canAfford ? '' : ' cant-afford'}`}>
                  {format(cost)} 💧
                  {amount !== 1 && realAmount > 1 && (
                    <span style={{ color: 'var(--text-dim)' }}> ×{realAmount}</span>
                  )}
                </div>
              </div>
              <div className="owned">{owned}</div>
            </div>
          );
        })}
      </aside>

      {hovered && hoveredBuilding && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            top: hovered.top,
            left: hovered.left - 12,
            transform: 'translate(-100%, -50%)',
          }}
        >
          <div className="tooltip-head">
            <span className="tooltip-icon">{BUILDINGS_BY_ID[hoveredBuilding.id].icon}</span>
            <span className="tooltip-name">{hoveredBuilding.name}</span>
          </div>
          <p className="tooltip-desc">{hoveredBuilding.description}</p>
          <div className="tooltip-stats">
            <div>
              <span>Prod. de base</span>
              <strong>{formatRate(hoveredBuilding.baseSps)}</strong>
            </div>
            {hoveredOwned > 0 && (
              <div>
                <span>Prod. actuelle</span>
                <strong>{formatRate(buildingSps(hoveredBuilding.id, state))}</strong>
              </div>
            )}
            <div>
              <span>Prochain coût</span>
              <strong>{format(buildingCost(hoveredBuilding.id, hoveredOwned))} 💧</strong>
            </div>
            <div>
              <span>Possédés</span>
              <strong>×{hoveredOwned}</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
