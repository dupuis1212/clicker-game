import { useGameSelector } from '../hooks/useGameState';
import { format, formatRate } from '../../core/bignum';
import { buildingCost, buildingSps } from '../../core/formulas';
import { BUILDINGS } from '../../data/buildings';
import { CLICK_UPGRADES } from '../../data/clickUpgrades';
import { GLOBAL_UPGRADES } from '../../data/globalUpgrades';
import type { BuildingId } from '../../core/types';

const ICONS: Record<BuildingId, string> = {
  chalumeau: '🔧',
  seau: '🪣',
  erableMature: '🌳',
  bouilloire: '🫕',
  evaporateur: '♨️',
  cabaneRustique: '🏚️',
  tracteur: '🚜',
  foretErables: '🌲',
  pipeline: '🛢️',
  evaporateurIndustriel: '🏭',
  raffinerie: '⚗️',
  laboratoire: '🧪',
  distillerie: '🔮',
  temple: '🏛️',
  portail: '🌀',
  sevePrimordiale: '💎',
};

interface Props {
  onClose: () => void;
}

export function GuideModal({ onClose }: Props) {
  const state = useGameSelector((s) => s);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📖 Guide de l'Empire du Sirop</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <section className="guide-section">
            <h3>💧 Comment ça marche</h3>
            <p className="guide-intro">
              Clique sur l'érable géant pour récolter des <strong>gouttes de sève</strong>.
              Utilise-les pour acheter des <strong>bâtiments</strong> qui produisent
              automatiquement. Débloque ensuite le sirop 🍯 (niv 5), le sucre 🧊 (niv 10) et
              les feuilles dorées 🍂 (prestige dès niv 15).
            </p>
          </section>

          <section className="guide-section">
            <h3>🏗️ Les 15 bâtiments</h3>
            <div className="guide-grid">
              {BUILDINGS.map((b) => {
                const owned = state.buildings[b.id];
                const unlocked = state.level >= b.unlockLevel;
                const currentCost = buildingCost(b.id, owned);
                const currentSps = buildingSps(b.id, state);
                return (
                  <div
                    key={b.id}
                    className={`guide-tile ${unlocked ? '' : 'guide-locked'}`}
                  >
                    <div className="guide-tile-head">
                      <span className="guide-tile-icon">{ICONS[b.id]}</span>
                      <div>
                        <div className="guide-tile-name">{b.name}</div>
                        <div className="guide-tile-sub">
                          🔓 Niveau {b.unlockLevel}
                        </div>
                      </div>
                    </div>
                    <p className="guide-tile-desc">{b.description}</p>
                    <div className="guide-stats">
                      <div>
                        <span className="guide-stat-label">Production de base</span>
                        <span className="guide-stat-value">{formatRate(b.baseSps)}</span>
                      </div>
                      <div>
                        <span className="guide-stat-label">Coût initial</span>
                        <span className="guide-stat-value">{format(b.baseCost)} 💧</span>
                      </div>
                      {owned > 0 && (
                        <>
                          <div>
                            <span className="guide-stat-label">Possédés</span>
                            <span className="guide-stat-value">×{owned}</span>
                          </div>
                          <div>
                            <span className="guide-stat-label">Production actuelle</span>
                            <span className="guide-stat-value">{formatRate(currentSps)}</span>
                          </div>
                          <div>
                            <span className="guide-stat-label">Prochain coût</span>
                            <span className="guide-stat-value">{format(currentCost)} 💧</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="guide-section">
            <h3>⚡ Upgrades de clic</h3>
            <div className="guide-list">
              {CLICK_UPGRADES.map((u) => (
                <div key={u.id} className="guide-list-row">
                  <span className="guide-list-name">{u.name}</span>
                  <span className="guide-list-effect">
                    {u.kind === 'clickMult' && `Clic ×${u.value}`}
                    {u.kind === 'clickPctSps' && `Clic +${(u.value * 100).toFixed(0)}% du SPS`}
                    {u.kind === 'critChance' && `Crit ${(u.value * 100).toFixed(0)}%`}
                    {u.kind === 'critMult' && `Crit ×${u.value}`}
                  </span>
                  <span className="guide-list-cost">{format(u.cost)} 💧</span>
                </div>
              ))}
            </div>
          </section>

          <section className="guide-section">
            <h3>🏆 Upgrades globaux</h3>
            <div className="guide-list">
              {GLOBAL_UPGRADES.map((u) => (
                <div key={u.id} className="guide-list-row">
                  <span className="guide-list-name">{u.name}</span>
                  <span className="guide-list-effect">
                    {u.kind === 'allBuildingsMult' && `Tous les bâtiments ×${u.value}`}
                    {u.kind === 'buildingMult' && `${u.target?.join(', ')} ×${u.value}`}
                    {u.kind === 'eventMult' && `Événement ×${u.value}`}
                  </span>
                  <span className="guide-list-cost">
                    {format(u.cost)} {u.currency === 'sirop' ? '🍯' : '🧊'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="guide-section">
            <h3>🎲 Événements aléatoires</h3>
            <div className="guide-list">
              <div className="guide-list-row">
                <span className="guide-list-name">✨ Goutte dorée</span>
                <span className="guide-list-effect">
                  Apparaît toutes les 2-4 min. Clique-la pour +13 % du stock OU frénésie ×15 SPS pendant 77s
                </span>
              </div>
              <div className="guide-list-row">
                <span className="guide-list-name">❄️ Vent du nord</span>
                <span className="guide-list-effect">Bourrasque de sève — SPS ×1.5 pendant 60 s</span>
              </div>
              <div className="guide-list-row">
                <span className="guide-list-name">🌾 Récolte miraculeuse</span>
                <span className="guide-list-effect">SPS ×5 pendant 30 s</span>
              </div>
              <div className="guide-list-row">
                <span className="guide-list-name">🦫 Castor gourmand (niv 13+)</span>
                <span className="guide-list-effect">
                  Chasse-le pour un gros bonus (60s de SPS, 120s en moins de 3s). S'il s'enfuit seul, il laisse quand même 3 % de bonus.
                </span>
              </div>
              <div className="guide-list-row">
                <span className="guide-list-name">🌕 Pleine lune (niv 8+)</span>
                <span className="guide-list-effect">
                  Une fois par jour — double tout pendant 5 minutes
                </span>
              </div>
            </div>
          </section>

          <section className="guide-section">
            <h3>🌟 Prestige</h3>
            <p className="guide-intro">
              Dès le niveau 15, tu peux <strong>prestiger</strong> pour redémarrer avec des
              feuilles dorées 🍂. Chaque feuille donne <strong>+2 % SPS permanent</strong>.
              Formule : <code>√(gouttes totales / 10¹²)</code>. Les achievements et talents sont
              conservés — les runs suivantes sont 3-5× plus rapides.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
