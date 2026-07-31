import { useState } from 'react';
import { GameCanvas } from './game/GameCanvas';

const centuries = [5, 6, 7, 8, 9, 10];

function App() {
  const [century, setCentury] = useState(5);
  const [started, setStarted] = useState(false);

  return (
    <main className="app-shell">
      <header className="masthead">
        <p className="eyebrow">A European strategy chronicle</p>
        <h1>Dark Ages</h1>
        <p className="lede">Choose an age. Shape its borders.</p>
      </header>

      {!started ? (
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
                <span className="card-index">0{value - 4}</span>
                <strong>{value}th century</strong>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <button className="primary-action" onClick={() => setStarted(true)} type="button">
            Continue to kingdoms <span aria-hidden="true">→</span>
          </button>
        </section>
      ) : (
        <section className="game-panel" aria-labelledby="game-title">
          <div className="game-heading">
            <div>
              <p className="section-label">Campaign preview</p>
              <h2 id="game-title">Europe, {century}th century</h2>
            </div>
            <button className="text-action" onClick={() => setStarted(false)} type="button">Change century</button>
          </div>
          <GameCanvas />
          <p className="map-note">The map prototype is ready for the kingdom and ruler selection layer.</p>
        </section>
      )}
    </main>
  );
}

export default App;
