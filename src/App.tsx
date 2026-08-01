import { useEffect, useCallback, useMemo } from 'react';
import { SvgMap } from './game/SvgMap';
import { HUD } from './game/HUD';
import { getScenario, type Century } from './content/scenarios';
import { KingdomSelect } from './setup/KingdomSelect';
import { RulerSelect } from './setup/RulerSelect';
import { useGameSetup } from './store/gameSetup';
import { useGameState } from './store/gameState';
import { getAdjacency } from './simulation/adjacency';
import { defaultRegionResources } from './simulation/resources';
import { capitalAssignments } from './simulation/capitals';

const centuries: Century[] = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

function CenturySelect() {
  const { century, setCentury, continueToKingdoms } = useGameSetup();

  return (
    <section className="setup-panel" aria-labelledby="setup-title">
      <div>
        <p className="section-label">01 / Begin a campaign</p>
        <h2 id="setup-title">Select a century</h2>
        <p className="muted">Your choice determines the European kingdoms and rulers available next.</p>
      </div>
      <div className="century-grid" role="list" aria-label="Available centuries">
        {centuries.map((value) => (
          <button
            className={value === century ? 'century-card selected' : 'century-card'}
            key={value}
            onClick={() => setCentury(value)}
            type="button"
          >
            <span className="card-index">{value <= 9 ? `0${value}` : value}</span>
            <strong>{value}th century</strong>
            <span className="card-arrow" aria-hidden="true">{'\u2197'}</span>
          </button>
        ))}
      </div>
      <button className="primary-action" onClick={continueToKingdoms} type="button">
        Continue to kingdoms <span aria-hidden="true">{'\u2192'}</span>
      </button>
    </section>
  );
}

function GameScreen() {
  const { century, kingdom, ruler, newCampaign } = useGameSetup();
  const scenario = getScenario(century);

  const {
    engineState,
    victory,
    initGame,
    handleSelectUnit,
    handleDeselectUnit,
    handleMoveUnit,
    handleAdvancePhase,
  } = useGameState();

  const adjacency = useMemo(() => getAdjacency(), []);

  useEffect(() => {
    if (!kingdom) return;

    const factionOrder = scenario.factions.map((f) => f.id);
    const factionCapitals: Record<string, typeof capitalAssignments[string]> = {};
    for (const faction of scenario.factions) {
      const cap = capitalAssignments[faction.id];
      if (cap) factionCapitals[faction.id] = cap;
    }

    initGame(
      factionOrder,
      { ...scenario.ownership },
      kingdom.id,
      defaultRegionResources,
      factionCapitals,
      adjacency,
    );
  }, [kingdom, ruler, scenario, initGame, adjacency]);

  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (!engineState) return;
      if (engineState.selectedUnitId != null && engineState.showMovement?.includes(regionId)) {
        handleMoveUnit(regionId);
      } else {
        handleDeselectUnit();
      }
    },
    [engineState, handleMoveUnit, handleDeselectUnit],
  );

  const handleUnitClick = useCallback(
    (unitId: number) => {
      if (!engineState) return;
      if (engineState.phase === 'player_move' && engineState.currentFaction === engineState.playerFaction) {
        if (engineState.selectedUnitId === unitId) {
          handleDeselectUnit();
        } else {
          handleSelectUnit(unitId);
        }
      }
    },
    [engineState, handleSelectUnit, handleDeselectUnit],
  );

  const handleEndTurn = useCallback(() => {
    handleAdvancePhase();
  }, [handleAdvancePhase]);

  if (!kingdom || !ruler || !engineState) return null;

  return (
    <section className="game-panel" aria-labelledby="game-title">
      <div className="game-heading">
        <div>
          <p className="section-label">{ruler.name} of {kingdom.name}</p>
          <h2 id="game-title">Europe, {century}th century</h2>
          <p className="scenario-subtitle">{scenario.subtitle}</p>
        </div>
        <button className="text-action" onClick={newCampaign} type="button">
          New campaign
        </button>
      </div>

      <div className="game-layout">
        <SvgMap
          ownership={engineState.ownership}
          factions={scenario.factions}
          playerFactionId={kingdom.id}
          currentFactionId={engineState.currentFaction}
          units={engineState.units}
          cities={engineState.cities}
          selectedUnitId={engineState.selectedUnitId}
          movementOptions={engineState.showMovement}
          onRegionClick={handleRegionClick}
          onUnitClick={handleUnitClick}
        />

        <HUD
          engineState={engineState}
          factions={scenario.factions}
          playerFactionId={kingdom.id}
          currentFactionId={engineState.currentFaction}
          onAdvancePhase={handleAdvancePhase}
          onEndTurn={handleEndTurn}
        />
      </div>

      <p className="map-note">
        Click a unit on the map to select it, then click a glowing region to move.
        Capture every enemy capital (♔) to win. Open "How to play" in the sidebar for full rules.
      </p>
      <p className="scenario-subtitle">{scenario.note}</p>

      {victory && (
        <div className="victory-overlay">
          <div className="victory-card">
            <h2>Victory!</h2>
            <p>{ruler.name} of {kingdom.name} has conquered Europe.</p>
            <button className="primary-action" onClick={newCampaign} type="button">
              New campaign
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SetupFlow() {
  const step = useGameSetup((s) => s.step);

  switch (step) {
    case 'century': return <CenturySelect />;
    case 'kingdom': return <KingdomSelect />;
    case 'ruler': return <RulerSelect />;
    case 'playing': return <GameScreen />;
  }
}

function App() {
  return (
    <main className="app-shell">
      <header className="masthead">
        <p className="eyebrow">A European strategy chronicle</p>
        <h1>Dark Ages</h1>
        <p className="lede">Choose an age. Shape its borders.</p>
      </header>
      <SetupFlow />
    </main>
  );
}

export default App;
