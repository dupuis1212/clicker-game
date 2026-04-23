import { useGameSelector } from '../hooks/useGameState';
import { ACHIEVEMENTS } from '../../data/achievements';

const CATEGORY_LABEL: Record<string, string> = {
  production: '🏭 Production',
  click: '👆 Clics',
  building: '🏗️ Bâtiments',
  event: '🎲 Événements',
  prestige: '🌟 Prestige',
};

interface Props {
  onClose: () => void;
}

export function AchievementsModal({ onClose }: Props) {
  const owned = useGameSelector((s) => s.achievements);
  const byCategory = ACHIEVEMENTS.reduce<Record<string, typeof ACHIEVEMENTS>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});
  const unlocked = Object.keys(owned).filter((k) => owned[k]).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Achievements ({unlocked}/{ACHIEVEMENTS.length})</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          {Object.entries(byCategory).map(([cat, list]) => (
            <div key={cat} className="achievement-category">
              <h3>{CATEGORY_LABEL[cat] ?? cat}</h3>
              <div className="achievement-grid">
                {list.map((a) => {
                  const unl = owned[a.id];
                  return (
                    <div
                      key={a.id}
                      className={`achievement-tile${unl ? ' unlocked' : ''}`}
                      title={`${a.description} — ${a.rewardLabel}`}
                    >
                      <div className="ach-icon">{unl ? '🏆' : '🔒'}</div>
                      <div className="ach-name">{unl ? a.name : '???'}</div>
                      <div className="ach-desc">{a.description}</div>
                      {unl && <div className="ach-reward">{a.rewardLabel}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
