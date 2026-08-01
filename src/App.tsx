import { useCallback, useState } from 'react';
import { SvgMap } from './game/SvgMap';
import { getScenario, type Century } from './content/scenarios';
import { KingdomSelect } from './setup/KingdomSelect';
import { RulerSelect } from './setup/RulerSelect';
import { useGameSetup } from './store/gameSetup';

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

  const [ownership, setOwnership] = useState<Record<string, string>>({ ...scenario.ownership });

  const handleCapture = useCallback((regionId: string) => {
    setOwnership((prev) => {
      if (!kingdom || prev[regionId] === kingdom.id) return prev;
      return { ...prev, [regionId]: kingdom.id };
    });
  }, [kingdom]);

  if (!kingdom || !ruler) return null;

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
      <SvgMap
        ownership={ownership}
        factions={scenario.factions}
        playerFactionId={kingdom.id}
        onCapture={handleCapture}
      />
      <p className="map-note">
        Click an enemy region to capture it. Active faction: {kingdom.name}. {scenario.note}
      </p>
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
