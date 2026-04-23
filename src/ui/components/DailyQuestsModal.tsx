import { useGameSelector, useActions } from '../hooks/useGameState';
import { questProgress, questCanClaim, streakMultiplier } from '../../core/dailyQuests';
import type { GameState, DailyQuest } from '../../core/types';

interface Props {
  onClose: () => void;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="quest-bar">
      <div className="quest-bar-fill" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function QuestRow({ q, state }: { q: DailyQuest; state: GameState }) {
  const actions = useActions();
  const progress = questProgress(state, q);
  const pct = (progress / q.target) * 100;
  const canClaim = questCanClaim(state, q);
  const mult = streakMultiplier(state.dailyQuests.streak);
  const reward = Math.max(1, Math.round(q.reward * mult));

  return (
    <div className={`quest-row ${q.claimed ? 'claimed' : canClaim ? 'ready' : ''}`}>
      <div className="quest-head">
        <span className="quest-label">{q.label}</span>
        <span className="quest-reward">✨ {reward}</span>
      </div>
      <ProgressBar pct={pct} />
      <div className="quest-foot">
        <span className="quest-progress">
          {Math.min(progress, q.target).toLocaleString('fr-FR')} /{' '}
          {q.target.toLocaleString('fr-FR')}
        </span>
        {q.claimed ? (
          <span className="quest-claimed">✓ réclamé</span>
        ) : (
          <button
            className="quest-claim"
            disabled={!canClaim}
            onClick={() => actions.claimDailyQuest(q.id)}
          >
            {canClaim ? 'Réclamer' : 'En cours'}
          </button>
        )}
      </div>
    </div>
  );
}

export function DailyQuestsModal({ onClose }: Props) {
  const state = useGameSelector((s) => s);
  const dq = state.dailyQuests;
  const allClaimed = dq.quests.length > 0 && dq.quests.every((q) => q.claimed);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-label="Quêtes quotidiennes"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>🗓️ Quêtes du jour</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
        <div className="quest-streak">
          <span>🔥 Série : {dq.streak}</span>
          <span>·</span>
          <span>Bonus : ×{streakMultiplier(dq.streak).toFixed(1)}</span>
        </div>
        {dq.quests.length === 0 ? (
          <p className="quest-empty">Les quêtes du jour n'ont pas encore été tirées.</p>
        ) : (
          <div className="quest-list">
            {dq.quests.map((q) => (
              <QuestRow key={q.id} q={q} state={state} />
            ))}
          </div>
        )}
        {allClaimed && (
          <p className="quest-all-done">
            🎉 Toutes les quêtes du jour sont réclamées. Reviens demain pour une nouvelle série !
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
