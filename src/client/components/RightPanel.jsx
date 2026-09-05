import { NextPiece } from './NextPiece.jsx';

export function RightPanel({ nextPieces, opponents }) {
    return (
        <div className="game-right">
            <div className="next-panel">
                <span className="next-panel-label">Next</span>
                <NextPiece type={nextPieces && nextPieces[0]} />
            </div>

            {opponents.length > 0 && (
                <div className="opponents-panel">
                    <p className="opponents-title">Opponents</p>
                    {opponents.map(opp => (
                        <Spectrum
                            key={opp.name}
                            name={opp.name}
                            spectrum={opp.spectrum || Array(10).fill(0)}
                            alive={opp.alive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}