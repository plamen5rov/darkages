import { useGameSetup } from '../store/gameSetup';
import { getKingdom } from '../content/kingdoms';

export function RulerSelect() {
  const { century, kingdom, selectRuler, goBack, startGame } = useGameSetup();

  if (!kingdom) return null;

  const fullKingdom = getKingdom(century, kingdom.id);

  return (
    <section className="setup-panel" aria-labelledby="ruler-title">
      <div>
        <p className="section-label">03 / Your sovereign</p>
        <h2 id="ruler-title">Who will you lead?</h2>
        <p className="muted">
          You chose <strong>{kingdom.name}</strong> in the {century}th century.
          Select a historical ruler to command your faction.
        </p>
      </div>
      <div className="ruler-grid" role="list" aria-label="Available rulers">
        {fullKingdom?.rulers.map((ruler) => (
          <button
            className="ruler-card"
            key={ruler.id}
            onClick={() => selectRuler(ruler)}
            type="button"
          >
            <span className="card-index">{ruler.reign}</span>
            <strong>{ruler.name}</strong>
            <span className="card-arrow" aria-hidden="true">&#8599;</span>
          </button>
        ))}
      </div>
      <div className="action-row">
        <button className="text-action" onClick={goBack} type="button">
          &#8592; Change kingdom
        </button>
        {kingdom.rulers.length > 0 && (
          <button className="primary-action" onClick={() => startGame()} type="button">
            Start with {kingdom.rulers[0].name} <span aria-hidden="true">&#8594;</span>
          </button>
        )}
      </div>
    </section>
  );
}
