import { useState } from 'react';
import type { EngineState } from '../simulation/entities';
import type { Faction } from '../content/scenarios';

export type HudProps = {
  engineState: EngineState;
  factions: Faction[];
  playerFactionId: string;
  currentFactionId: string;
  onAdvancePhase: () => void;
  onEndTurn: () => void;
};

export function HUD({ engineState, factions, playerFactionId, onAdvancePhase, onEndTurn }: HudProps) {
  const { turn, phase, currentFaction, log, units, cities, selectedUnitId } = engineState;
  const [showRules, setShowRules] = useState(false);

  const currentFactionName = factions.find((f) => f.id === currentFaction)?.name ?? currentFaction;
  const playerCities = cities.filter((c) => c.owner === playerFactionId);
  const playerUnits = units.filter((u) => u.owner === playerFactionId);
  const selectedUnit = selectedUnitId != null ? units.find((u) => u.id === selectedUnitId) : null;

  const factionStats = factions.map((f) => ({
    ...f,
    cityCount: cities.filter((c) => c.owner === f.id).length,
    unitCount: units.filter((u) => u.owner === f.id).length,
    isPlayer: f.id === playerFactionId,
    isCurrent: f.id === currentFaction,
  }));

  const phaseLabel: Record<string, string> = {
    production: 'Production',
    player_move: 'Your Turn',
    ai_move: 'AI Turn',
    cleanup: 'Resolving',
  };

  const isPlayerTurn = phase === 'player_move' && currentFaction === playerFactionId;

  return (
    <aside className="hud-panel">
      {/* Phase header */}
      <div className="hud-header">
        <div className="hud-turn">
          <span className="hud-turn-label">Turn {turn}</span>
          <span className="hud-phase">{phaseLabel[phase] ?? phase}</span>
        </div>
        <p className="hud-faction">{currentFactionName}</p>
      </div>

      {/* Action buttons */}
      {phase === 'production' && (
        <button className="hud-action" onClick={onAdvancePhase} type="button">
          Begin Turn
        </button>
      )}
      {isPlayerTurn && (
        <button className="hud-action" onClick={onEndTurn} type="button">
          End Turn
        </button>
      )}
      {phase === 'ai_move' && (
        <button className="hud-action" onClick={onAdvancePhase} type="button">
          Resolve AI
        </button>
      )}
      {phase === 'cleanup' && (
        <button className="hud-action" onClick={onAdvancePhase} type="button">
          Next Turn
        </button>
      )}

      {/* How to Play toggle */}
      <button className="hud-toggle" onClick={() => setShowRules(!showRules)} type="button">
        {showRules ? '▾ Hide rules' : '▸ How to play'}
      </button>

      {showRules && (
        <div className="hud-rules">
          <p><strong>Goal</strong> — Capture every enemy capital to conquer Europe.</p>
          <p><strong>Turns</strong> — Each turn cycles through every faction:
            Production → Your Move → AI Move → Cleanup.</p>
          <p><strong>Movement</strong> — Click an Army or Scout on the map,
            then click a glowing adjacent region to move there.</p>
          <p><strong>Combat</strong> — Moving into an enemy region triggers battle.
            Attack and defense are randomized. Defenders in cities get +2 defense.</p>
          <p><strong>Capture</strong> — Defeat all units in a region to seize it.
            Seize the capital (marked ♔) and you absorb the entire kingdom.</p>
          <p><strong>Units</strong> — Armies are strong but slow (2 moves/turn).
            Scouts are fast (3 moves/turn) but weaker.</p>
          <p><strong>Cities</strong> — Your capital generates food (grows population)
            and production (builds new units). Each region has resources that boost output.</p>
        </div>
      )}

      {/* Selected unit info */}
      {selectedUnit && (
        <div className="hud-unit-info">
          <p className="hud-section-title">Selected Unit</p>
          <p>{selectedUnit.type === 'army' ? 'Army' : 'Scout'}</p>
          <div className="hud-hp-bar">
            <div className="hud-hp-fill" style={{ width: `${(selectedUnit.hp / selectedUnit.maxHp) * 100}%` }} />
          </div>
          <p className="hud-hp-text">HP: {Math.ceil(selectedUnit.hp)}/{selectedUnit.maxHp}</p>
          <p>Moves: {selectedUnit.movesLeft}/{selectedUnit.maxMoves}</p>
          <p>ATK: {selectedUnit.attack} · DEF: {selectedUnit.defense}</p>
        </div>
      )}

      {/* Player cities */}
      {playerCities.length > 0 && (
        <div className="hud-cities">
          <p className="hud-section-title">Your Cities ({playerCities.length})</p>
          {playerCities.slice(0, 5).map((city) => (
            <div key={city.id} className="hud-city-row">
              <span className="hud-city-name">
                {city.isCapital ? '♔ ' : ''}{city.name}
              </span>
              <span className="hud-city-pop">Pop: {city.population}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unit count */}
      <div className="hud-units">
        <p className="hud-section-title">Your Forces: {playerUnits.length} units</p>
      </div>

      {/* Faction overview */}
      <div className="hud-factions">
        <p className="hud-section-title">Factions</p>
        {factionStats.map((f) => (
          <div key={f.id} className={`hud-faction-row ${f.isPlayer ? 'player' : ''} ${f.isCurrent ? 'current' : ''}`}>
            <span className="hud-faction-swatch" style={{ background: `#${f.color.toString(16).padStart(6, '0')}` }} />
            <span className="hud-faction-name">{f.name}</span>
            <span className="hud-faction-stats">{f.cityCount} cities · {f.unitCount} units</span>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="hud-log">
        <p className="hud-section-title">Log</p>
        {log.slice(-8).map((entry, i) => (
          <p key={i} className="hud-log-entry">{entry}</p>
        ))}
      </div>
    </aside>
  );
}
