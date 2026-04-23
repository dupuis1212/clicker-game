import { useGameSelector, useActions } from '../hooks/useGameState';
import { useGameStore } from '../../engine/store';
import { format } from '../../core/bignum';
import { achievementUnlockedSkins } from '../../core/rewards';
import { TREE_SKINS } from '../../data/skins';

interface Props {
  onClose: () => void;
}

export function SkinsModal({ onClose }: Props) {
  const essence = useGameSelector((s) => s.essence);
  const currentSkin = useGameSelector((s) => s.skins.tree);
  const achievements = useGameSelector((s) => s.achievements);
  const state = useGameStore.getState();
  const actions = useActions();

  const unlockedCount = Object.values(achievements).filter(Boolean).length;
  const freeSkins = new Set(achievementUnlockedSkins(state as never));

  const purchase = (id: string, cost: number) => {
    if (currentSkin === id) return;
    const effectiveCost = freeSkins.has(id) ? 0 : cost;
    if (essence.lt(effectiveCost)) return;
    if (effectiveCost > 0) {
      useGameStore.setState({ essence: essence.sub(effectiveCost) } as never);
    }
    actions.setSkin('tree', id);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎨 Skins de l'érable</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <div className="skins-header">
            <div>
              <div className="skins-header-label">Essence ancienne</div>
              <div className="skins-header-value">✨ {format(essence)}</div>
            </div>
            <div className="skins-header-hint">
              Gagne 1 ✨ pour chaque 5 achievements débloqués ({unlockedCount} débloqués)
            </div>
          </div>
          <div className="skins-grid">
            {TREE_SKINS.map((s) => {
              const isFree = freeSkins.has(s.id) || s.cost === 0;
              const effectiveCost = isFree ? 0 : s.cost;
              const canBuy = essence.gte(effectiveCost);
              const active = currentSkin === s.id;
              return (
                <div
                  key={s.id}
                  className={`skin-tile${active ? ' active' : ''}${
                    !active && effectiveCost > 0 && !canBuy ? ' locked' : ''
                  }`}
                  onClick={() => purchase(s.id, s.cost)}
                >
                  <div className="skin-emoji">{s.emoji}</div>
                  <div className="skin-name">{s.name}</div>
                  <div className="skin-desc">{s.description}</div>
                  {active ? (
                    <div className="skin-badge">✓ Équipé</div>
                  ) : isFree ? (
                    <div className="skin-cost">{freeSkins.has(s.id) ? '🏆 Débloqué' : 'Gratuit'}</div>
                  ) : (
                    <div className={`skin-cost${canBuy ? '' : ' cant-afford'}`}>
                      ✨ {s.cost}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
