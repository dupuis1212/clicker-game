import { useGameSelector, useActions } from '../hooks/useGameState';
import { format } from '../../core/bignum';
import { prestigeGain } from '../../core/formulas';
import { canPrestige } from '../../core/reducers/prestige';
import { TALENTS } from '../../data/talents';

interface Props {
  onClose: () => void;
}

export function PrestigeModal({ onClose }: Props) {
  const state = useGameSelector((s) => s);
  const actions = useActions();

  const gain = prestigeGain(state.totalDropsEver);
  const can = canPrestige(state);

  const doPrestige = () => {
    if (!can) return;
    const ok = window.confirm(
      `Prestiger : tu gagnes ${format(gain)} 🍂 et tu redémarres à zéro. Continuer ?`,
    );
    if (ok) {
      actions.prestige();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌟 Réincarnation en Esprit de l'Érable</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <div className="prestige-header">
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                Feuilles dorées actuelles
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                🍂 {format(state.feuillesDorees)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                Gain si prestige maintenant
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>
                +{format(gain)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Prestiges déjà fait</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{state.prestigeCount}</div>
            </div>
          </div>

          <button
            className="prestige-btn"
            disabled={!can}
            onClick={doPrestige}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.1rem',
              margin: '1rem 0 1.5rem',
              background: can ? 'var(--maple)' : undefined,
              color: can ? 'var(--wood-trim)' : undefined,
              fontWeight: 700,
            }}
          >
            {can ? `🌟 Prestiger et gagner ${format(gain)} 🍂` : 'Atteindre niv 15 pour prestiger'}
          </button>

          <h3 style={{ marginBottom: '0.5rem' }}>🌳 Arbre de talents</h3>
          <div className="talent-grid">
            {TALENTS.map((t) => {
              const isOwned = state.talents[t.id];
              const canBuy = !isOwned && state.feuillesDorees.gte(t.cost);
              return (
                <div
                  key={t.id}
                  className={`talent-tile${isOwned ? ' unlocked' : canBuy ? ' available' : ' locked'}`}
                  onClick={() => canBuy && actions.buyTalent(t.id)}
                  title={t.description}
                >
                  <div className="talent-name">{t.name}</div>
                  <div className="talent-desc">{t.description}</div>
                  {!isOwned && (
                    <div className="talent-cost">🍂 {format(t.cost)}</div>
                  )}
                  {isOwned && <div className="talent-owned">✓ Acquis</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
