import "../style/Board.css";

export function Board({ board }) {
    return (
        <div className="tetris-container">
            <div className="board">
                {board.map((row, y) => (
                    <div key={y} className="board-row">
                        {row.map((_, x) => (
                            <div
                                key={`${x}-${y}`}
                                className="cell cell-empty"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
