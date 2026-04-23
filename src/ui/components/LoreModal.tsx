import { useEffect } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';
import { LORE } from '../../data/lore';

interface Props {
  onClose: () => void;
}

export function LoreModal({ onClose }: Props) {
  const level = useGameSelector((s) => s.level);
  const readLore = useGameSelector((s) => s.readLore);
  const actions = useActions();

  // Mark all unlocked lore as read on open
  useEffect(() => {
    for (const l of LORE) {
      if (l.level <= level && !readLore.includes(l.level)) {
        actions.markLoreRead(l.level);
      }
    }
  }, [level, readLore, actions]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📜 Les lettres de l'Érable Ancien</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <p className="lore-intro">
            Une lettre est débloquée à chaque niveau franchi. Tu en as {Math.min(level, 20)} sur 20.
          </p>
          <div className="lore-list">
            {LORE.map((l) => {
              const unlocked = level >= l.level;
              return (
                <article key={l.level} className={`lore-letter${unlocked ? '' : ' locked'}`}>
                  <header>
                    <span className="lore-num">Lettre {l.level}</span>
                    <h3>{unlocked ? l.title : '🔒 ???'}</h3>
                  </header>
                  <p>
                    {unlocked
                      ? l.body
                      : `Cette lettre sera révélée au niveau ${l.level}.`}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
