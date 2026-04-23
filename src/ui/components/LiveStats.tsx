import { useGameSelector } from '../hooks/useGameState';
import { format } from '../../core/bignum';
import { clickValue, critChance } from '../../core/formulas';

export function LiveStats() {
  const click = useGameSelector(clickValue);
  const crit = useGameSelector(critChance);
  const combo = useGameSelector((s) => s.combo.stack);

  return (
    <div className="live-stats">
      <div className="live-stat">
        <span className="live-stat-label">💧/clic</span>
        <strong>{format(click)}</strong>
      </div>
      <div className="live-stat">
        <span className="live-stat-label">crit</span>
        <strong>{(crit * 100).toFixed(0)}%</strong>
      </div>
      {combo > 1 && (
        <div className="live-stat combo-active">
          <span className="live-stat-label">combo</span>
          <strong>×{combo.toFixed(1)}</strong>
        </div>
      )}
    </div>
  );
}
