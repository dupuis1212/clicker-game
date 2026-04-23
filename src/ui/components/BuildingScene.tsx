import { useGameSelector } from '../hooks/useGameState';
import { BUILDINGS } from '../../data/buildings';
import { buildingSps } from '../../core/formulas';
import { format, formatRate } from '../../core/bignum';

const MAX_ICONS_PER_ROW = 16;

export function BuildingScene() {
  const buildings = useGameSelector((s) => s.buildings);
  const state = useGameSelector((s) => s);
  const level = useGameSelector((s) => s.level);

  const visibleRows = BUILDINGS.filter(
    (b) => buildings[b.id] > 0 || level >= b.unlockLevel,
  );

  if (visibleRows.length === 0) {
    return (
      <div className="building-scene empty">
        <div className="scene-hint">🍁 Clique l'érable pour commencer</div>
      </div>
    );
  }

  return (
    <div className="building-scene">
      <div className="scene-ground" />
      <div className="scene-rows">
        {visibleRows.map((b) => {
          const owned = buildings[b.id];
          const displayed = Math.min(owned, MAX_ICONS_PER_ROW);
          const overflow = owned - displayed;
          const sps = buildingSps(b.id, state);

          return (
            <div
              key={b.id}
              className={`scene-row tier-${b.unlockLevel}${owned === 0 ? ' inactive' : ''}`}
            >
              <div className="row-label" title={b.description}>
                <span className="row-icon">{b.icon}</span>
                <span className="row-name">{b.name}</span>
                <span className="row-count">{format(sps.gt(0) ? sps : b.baseSps)}{sps.gt(0) ? '/s' : ' /s base'}</span>
              </div>
              <div className="row-stage">
                {Array.from({ length: displayed }).map((_, i) => (
                  <span
                    key={i}
                    className="stage-icon"
                    style={{
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    {b.icon}
                  </span>
                ))}
                {overflow > 0 && (
                  <span className="overflow-badge">×{owned}</span>
                )}
                {owned === 0 && (
                  <span className="row-empty">
                    Déverrouillé — niv {b.unlockLevel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="scene-total">
        Production totale : <strong>{formatRate(totalSceneSps(state))}</strong>
      </div>
    </div>
  );
}

function totalSceneSps(state: import('../../core/types').GameState) {
  let sum = buildingSps('chalumeau', state);
  for (let i = 1; i < BUILDINGS.length; i++) {
    sum = sum.add(buildingSps(BUILDINGS[i].id, state));
  }
  return sum;
}
