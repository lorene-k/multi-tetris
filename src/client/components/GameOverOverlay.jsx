export function GameOverOverlay({ winner, isHost, onRestart, onHome }) {
    return (
        <div className="overlay">
            <h2 className={winner ? 'winner-text' : ''}>
                {winner ? `${winner} wins! ` : 'Game Over'}
            </h2>
            {isHost && <button onClick={onRestart}>Play Again</button>}
            <button className="btn-purple" onClick={onHome}>Home</button>
        </div>
    );
}
