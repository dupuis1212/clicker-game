import { useState } from 'react';
import { useGameSelector, useActions } from '../hooks/useGameState';
import { toggleMusic } from '../../engine/audio';

interface Props {
  onClose: () => void;
}

export function OptionsModal({ onClose }: Props) {
  const settings = useGameSelector((s) => s.settings);
  const actions = useActions();
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);

  const doExport = () => {
    const save = actions.exportSave();
    setExported(save);
    navigator.clipboard?.writeText(save).catch(() => {});
    setStatus('📋 Copié dans le presse-papier.');
  };

  const doImport = () => {
    const trimmed = importText.trim();
    if (!trimmed) return;
    const ok = window.confirm(
      'Importer cette sauvegarde va écraser ta partie actuelle. Continuer ?',
    );
    if (!ok) return;
    const success = actions.importSave(trimmed);
    if (success) {
      setStatus('✅ Sauvegarde importée avec succès.');
      actions.save();
      setTimeout(() => window.location.reload(), 500);
    } else {
      setStatus('❌ Sauvegarde invalide.');
    }
  };

  const hardReset = () => {
    const ok = window.confirm(
      'RÉINITIALISATION COMPLÈTE : tu perds tout (gouttes, bâtiments, prestiges, talents, achievements). Continuer ?',
    );
    if (!ok) return;
    const ok2 = window.confirm('Vraiment ? Cette action est IRRÉVERSIBLE.');
    if (!ok2) return;
    actions.reset();
    actions.save();
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Options</h2>
          <button onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        <div className="modal-body">
          <section className="options-section">
            <h3>🔊 Audio</h3>
            <label className="option-row">
              <span>Volume général (SFX + musique)</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.volume}
                onChange={(e) =>
                  actions.updateSettings({ volume: parseFloat(e.target.value) })
                }
              />
              <span className="option-value">{Math.round(settings.volume * 100)}%</span>
            </label>
            <label className="option-row">
              <span>🎵 Musique d'ambiance</span>
              <input
                type="checkbox"
                checked={settings.music}
                onChange={(e) => {
                  actions.updateSettings({ music: e.target.checked });
                  toggleMusic(e.target.checked);
                }}
              />
            </label>
            <label className="option-row">
              <span>Volume musique</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.musicVolume}
                onChange={(e) =>
                  actions.updateSettings({ musicVolume: parseFloat(e.target.value) })
                }
                disabled={!settings.music}
              />
              <span className="option-value">{Math.round(settings.musicVolume * 100)}%</span>
            </label>
          </section>

          <section className="options-section">
            <h3>🔢 Affichage des nombres</h3>
            <div className="option-switch">
              <button
                className={settings.notation === 'suffixes' ? 'active' : ''}
                onClick={() => actions.updateSettings({ notation: 'suffixes' })}
              >
                K / M / G / T / Qa...
              </button>
              <button
                className={settings.notation === 'scientific' ? 'active' : ''}
                onClick={() => actions.updateSettings({ notation: 'scientific' })}
              >
                1.23e45
              </button>
            </div>
          </section>

          <section className="options-section">
            <h3>✨ Animations</h3>
            <label className="option-row">
              <span>Activer les animations</span>
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(e) => actions.updateSettings({ animations: e.target.checked })}
              />
            </label>
          </section>

          <section className="options-section">
            <h3>💾 Sauvegarde</h3>
            <p className="options-help">
              Exporte ta partie en code texte, ou importe une sauvegarde précédente.
            </p>
            <div className="options-save-row">
              <button onClick={doExport}>📤 Exporter (copie dans presse-papier)</button>
            </div>
            {exported && (
              <textarea className="options-export" readOnly value={exported} rows={4} />
            )}
            <div className="options-save-row">
              <textarea
                placeholder="Colle un code de sauvegarde ici..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={3}
              />
              <button onClick={doImport} disabled={!importText.trim()}>
                📥 Importer
              </button>
            </div>
            {status && <div className="options-status">{status}</div>}
          </section>

          <section className="options-section">
            <h3>⚠️ Zone dangereuse</h3>
            <button className="options-reset" onClick={hardReset}>
              💣 Réinitialiser toute la partie
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
