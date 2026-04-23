import { useGameSelector } from '../hooks/useGameState';
import { ACHIEVEMENTS_BY_ID } from '../../data/achievements';

export function Toasts() {
  const recent = useGameSelector((s) => (s as any).recentAchievements as string[] | undefined) ?? [];

  if (recent.length === 0) return null;
  return (
    <div className="toast-stack">
      {recent.map((id) => {
        const a = ACHIEVEMENTS_BY_ID[id];
        if (!a) return null;
        return (
          <div key={id} className="toast">
            <div className="toast-icon">🏆</div>
            <div>
              <div className="toast-title">Achievement débloqué</div>
              <div className="toast-name">{a.name}</div>
              <div className="toast-reward">{a.rewardLabel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
