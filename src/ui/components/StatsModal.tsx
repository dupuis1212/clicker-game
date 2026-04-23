import { useGameSelector } from '../hooks/useGameState';
import { format, formatRate } from '../../core/bignum';
import { totalSps, clickValue, critChance, critMultiplier } from '../../core/formulas';
import { getTotalBuildings } from '../../core/selectors';
import { ACHIEVEMENTS } from '../../data/achievements';

interface Props {
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

export function StatsModal({ onClose }: Props) {
  const state = useGameSelector((s) => s);
  const sps = useGameSelector(totalSps);
  const click = useGameSelector(clickValue);
  const crit = useGameSelector(critChance);
  const critMult = useGameSelector(critMultiplier);
  const totalBuildings = useGameSelector(getTotalBuildings);

  const now = Date.now();
  const sessionMs = now - state.sessionStartedAt;
  const totalPlayMs = state.playTimeMs;
  const runMs = now - state.startedAt;
  const clicksPerSec = sessionMs > 0 ? state.totalClicks / (sessionMs / 1000) : 0;
  const critPct = state.totalClicks > 0 ? (state.totalCrits / state.totalClicks) * 100 : 0;
  const achUnlocked = Object.values(state.achievements).filter(Boolean).length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Statistiques</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <section className="stats-section">
            <h3>⚡ Production en direct</h3>
            <div className="stats-grid">
              <StatCard label="SPS actuel" value={formatRate(sps)} />
              <StatCard label="Valeur du clic" value={format(click)} />
              <StatCard label="Chance crit" value={`${(crit * 100).toFixed(1)}%`} />
              <StatCard label="Multi. crit" value={`×${critMult}`} />
              <StatCard label="Combo stack" value={`×${state.combo.stack.toFixed(1)}`} />
              <StatCard label="Bâtiments totaux" value={`${totalBuildings}`} />
            </div>
          </section>

          <section className="stats-section">
            <h3>💰 Monnaies</h3>
            <div className="stats-grid">
              <StatCard label="💧 Gouttes" value={format(state.drops)} />
              <StatCard label="🍯 Sirop" value={format(state.sirop)} />
              <StatCard label="🧊 Sucre" value={format(state.sucre)} />
              <StatCard label="🍂 Feuilles" value={format(state.feuillesDorees)} />
              <StatCard label="✨ Essence" value={format(state.essence)} />
              <StatCard label="Gouttes produites" value={format(state.totalDropsEver)} />
            </div>
          </section>

          <section className="stats-section">
            <h3>👆 Activité</h3>
            <div className="stats-grid">
              <StatCard label="Clics totaux" value={state.totalClicks.toLocaleString('fr-FR')} />
              <StatCard label="Crits" value={state.totalCrits.toLocaleString('fr-FR')} />
              <StatCard label="% crits" value={`${critPct.toFixed(1)}%`} />
              <StatCard label="Clics/s (session)" value={clicksPerSec.toFixed(2)} />
              <StatCard label="Gouttes dorées" value={`${state.goldensCaught}`} />
              <StatCard label="Castors chassés <3s" value={`${state.castorFastKills}`} />
            </div>
          </section>

          <section className="stats-section">
            <h3>⏱️ Temps</h3>
            <div className="stats-grid">
              <StatCard label="Session" value={formatDuration(sessionMs)} />
              <StatCard label="Run actuelle" value={formatDuration(runMs)} />
              <StatCard label="Temps cumulé" value={formatDuration(totalPlayMs)} />
              <StatCard label="Absence max" value={formatDuration(state.longestAwayMs)} />
            </div>
          </section>

          <section className="stats-section">
            <h3>🏆 Progression</h3>
            <div className="stats-grid">
              <StatCard label="Niveau" value={`${state.level} / 20`} />
              <StatCard label="Achievements" value={`${achUnlocked} / ${ACHIEVEMENTS.length}`} />
              <StatCard label="Prestiges" value={`${state.prestigeCount}`} />
              <StatCard
                label="Talents acquis"
                value={`${Object.values(state.talents).filter(Boolean).length} / 10`}
              />
            </div>
          </section>

          {state.runsHistory.length > 0 && (
            <section className="stats-section">
              <h3>🏁 Top runs</h3>
              <div className="runs-table">
                <div className="runs-head">
                  <span>#</span>
                  <span>Durée</span>
                  <span>Feuilles</span>
                  <span>Gouttes totales</span>
                </div>
                {[...state.runsHistory]
                  .sort((a, b) => {
                    // Sort by feuillesGained (parse as number — runs rarely >1e308)
                    const fa = Number(a.feuillesGained);
                    const fb = Number(b.feuillesGained);
                    return fb - fa;
                  })
                  .slice(0, 10)
                  .map((r, i) => (
                    <div className="runs-row" key={`${r.endedAt}-${i}`}>
                      <span>{i + 1}</span>
                      <span>{formatDuration(r.durationMs)}</span>
                      <span>🍂 {Number(r.feuillesGained).toLocaleString('fr-FR')}</span>
                      <span>{Number(r.totalDropsEver).toExponential(2)}</span>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}
