export function LeftPanel({ room, player, score, linesCleared }) {
    return (
        <div className="game-left">
            <div className="info-panel">
                <p className="info-row"><span className="info-label">Room</span><span className="info-value">{room}</span></p>
                <p className="info-row"><span className="info-label">Player</span><span className="info-value">{player}</span></p>
            </div>

            <div className="score-panel">
                <div className="score-block">
                    <span className="score-label">Score</span>
                    <span className="score-value">{score.toLocaleString()}</span>
                </div>
                <div className="score-block">
                    <span className="score-label">Lines</span>
                    <span className="score-value purple">{linesCleared}</span>
                </div>
            </div>

            <div className="controls-panel">
                <p className="control-row"><span className="key">←→</span><span className="control-name">Move</span></p>
                <p className="control-row"><span className="key">↑</span><span className="control-name">Rotate</span></p>
                <p className="control-row"><span className="key">↓</span><span className="control-name">Soft drop</span></p>
                <p className="control-row"><span className="key">Space</span><span className="control-name">Hard drop</span></p>
            </div>
        </div >
    );
}