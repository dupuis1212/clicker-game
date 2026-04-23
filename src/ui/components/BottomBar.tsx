import { useGameSelector } from '../hooks/useGameState';
import { getTotalBuildings } from '../../core/selectors';
import { canPrestige } from '../../core/reducers/prestige';
import { format } from '../../core/bignum';
import { LiveStats } from './LiveStats';
import { LORE } from '../../data/lore';
import { questCanClaim } from '../../core/dailyQuests';

interface Props {
  onOpenAchievements: () => void;
  onOpenPrestige: () => void;
  onOpenGuide: () => void;
  onOpenStats: () => void;
  onOpenOptions: () => void;
  onOpenSkins: () => void;
  onOpenLore: () => void;
  onOpenQuests: () => void;
}

export function BottomBar({
  onOpenAchievements,
  onOpenPrestige,
  onOpenGuide,
  onOpenStats,
  onOpenOptions,
  onOpenSkins,
  onOpenLore,
  onOpenQuests,
}: Props) {
  const totalBuildings = useGameSelector(getTotalBuildings);
  const feuilles = useGameSelector((s) => s.feuillesDorees);
  const essence = useGameSelector((s) => s.essence);
  const canP = useGameSelector(canPrestige);
  const level = useGameSelector((s) => s.level);
  const readLore = useGameSelector((s) => s.readLore);
  const unreadLore = LORE.filter(
    (l) => l.level <= level && !readLore.includes(l.level),
  ).length;
  const claimableQuests = useGameSelector((s) =>
    s.dailyQuests.quests.filter((q) => questCanClaim(s, q)).length,
  );
  const totalQuests = useGameSelector((s) => s.dailyQuests.quests.length);

  return (
    <footer className="bottom-bar">
      <LiveStats />
      <span>🏗️ {totalBuildings}</span>
      {feuilles.gt(0) && <span>🍂 {format(feuilles)}</span>}
      {essence.gt(0) && <span>✨ {format(essence)}</span>}
      <button onClick={onOpenGuide} aria-label="Ouvrir le guide">📖 Guide</button>
      <button onClick={onOpenLore} aria-label="Ouvrir les lettres de l'Érable Ancien">
        📜 Lettres
        {unreadLore > 0 && <span className="unread-badge">{unreadLore}</span>}
      </button>
      {totalQuests > 0 && (
        <button onClick={onOpenQuests} aria-label="Ouvrir les quêtes quotidiennes">
          🗓️ Quêtes
          {claimableQuests > 0 && <span className="unread-badge">{claimableQuests}</span>}
        </button>
      )}
      <button onClick={onOpenStats} aria-label="Ouvrir les statistiques">📊 Stats</button>
      <button onClick={onOpenAchievements} aria-label="Ouvrir les succès">🏆</button>
      <button onClick={onOpenSkins} aria-label="Ouvrir les skins">🎨 Skins</button>
      <button
        onClick={onOpenPrestige}
        disabled={!canP && feuilles.eq(0)}
        aria-label="Ouvrir la modale de prestige"
      >
        🌟 Prestige
      </button>
      <button onClick={onOpenOptions} aria-label="Ouvrir les options">⚙️</button>
    </footer>
  );
}
