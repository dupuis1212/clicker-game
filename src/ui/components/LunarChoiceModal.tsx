import { useGameSelector, useActions } from '../hooks/useGameState';
import type { LunarChoice } from '../../core/types';

/**
 * Pleine lune — choix de buff. S'affiche quand un event fullMoon est
 * en attente (data.pending === true). Le joueur choisit entre 3 boons :
 *  - SPS ×5 pendant 3 min
 *  - Clics ×5 pendant 3 min
 *  - Gouttes dorées ×3 pendant 3 min (pas encore câblé au scheduler, vit comme aura)
 */
export function LunarChoiceModal() {
  const pending = useGameSelector((s) =>
    s.activeEvents.find((e) => e.type === 'fullMoon' && e.data?.pending === true),
  );
  const actions = useActions();

  if (!pending) return null;

  const choose = (choice: LunarChoice) => actions.chooseLunarBoon(choice);

  return (
    <div className="modal-backdrop lunar-overlay" role="dialog" aria-label="Choisir une faveur lunaire">
      <div className="modal lunar-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🌕 Pleine lune</h2>
        <p className="lunar-subtitle">
          La lune se lève sur l'érablière. Choisis son présent — 3 minutes de grâce.
        </p>
        <div className="lunar-choices">
          <button className="lunar-choice" onClick={() => choose('sps')}>
            <div className="lunar-choice-icon">🌳</div>
            <div className="lunar-choice-title">Sève d'argent</div>
            <div className="lunar-choice-desc">Production ×5</div>
          </button>
          <button className="lunar-choice" onClick={() => choose('click')}>
            <div className="lunar-choice-icon">👆</div>
            <div className="lunar-choice-title">Main lunaire</div>
            <div className="lunar-choice-desc">Clics ×5</div>
          </button>
          <button className="lunar-choice" onClick={() => choose('golden')}>
            <div className="lunar-choice-icon">✨</div>
            <div className="lunar-choice-title">Rosée dorée</div>
            <div className="lunar-choice-desc">Gouttes dorées ×3</div>
          </button>
        </div>
        <p className="lunar-hint">Tu dois choisir — sinon l'éclat se perd au lever du jour.</p>
      </div>
    </div>
  );
}
