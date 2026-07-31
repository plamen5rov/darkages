import { useGameSetup } from '../store/gameSetup';
import { getKingdoms } from '../content/kingdoms';

export function KingdomSelect() {
  const { century, selectKingdom, goBack } = useGameSetup();
  const kingdoms = getKingdoms(century);

  return (
    <section className="setup-panel" aria-labelledby="kingdom-title">
      <div>
        <p className="section-label">02 / Choose your realm</p>
        <h2 id="kingdom-title">Select a kingdom</h2>
        <p className="muted">
          Each kingdom begins with its historical regions. All adversaries are rulers from the {century}th century.
        </p>
      </div>
      <div className="kingdom-grid" role="list" aria-label="Available kingdoms">
        {kingdoms.map((kingdom) => (
          <button
            className="kingdom-card"
            key={kingdom.id}
            onClick={() => selectKingdom(kingdom)}
            type="button"
            style={{ borderLeftColor: `#${kingdom.color.toString(16).padStart(6, '0')}` }}
          >
            <span
              className="kingdom-swatch"
              style={{ background: `#${kingdom.color.toString(16).padStart(6, '0')}` }}
            />
            <div className="kingdom-info">
              <strong>{kingdom.name}</strong>
              <span className="kingdom-meta">{kingdom.rulers.length} ruler{kingdom.rulers.length !== 1 ? 's' : ''} available</span>
            </div>
            <span className="card-arrow" aria-hidden="true">&#8599;</span>
          </button>
        ))}
      </div>
      <button className="text-action" onClick={goBack} type="button">
        &#8592; Change century
      </button>
    </section>
  );
}
