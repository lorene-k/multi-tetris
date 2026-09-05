import '../style/Board.css';
import { getPieceShape } from '../../shared/tetris/index.js';

const PIECE_COLOR = {
    I: 'cell-cyan',
    O: 'cell-yellow',
    T: 'cell-purple',
    J: 'cell-blue',
    L: 'cell-orange',
    S: 'cell-green',
    Z: 'cell-red',
    X: 'cell-grey',   // penalty lines
};

// Overlay active piece onto a copy of the board for rendering
const buildDisplayBoard = (board, activePiece) => {
    const display = board.map(row => [...row]);
    if (!activePiece) return display;

    const shape = getPieceShape(activePiece);
    shape.forEach(([dx, dy]) => {
        const x = activePiece.pos.x + dx;
        const y = activePiece.pos.y + dy;
        if (y >= 0 && y < display.length && x >= 0 && x < display[0].length) {
            display[y][x] = activePiece.type;
        }
    });
    return display;
};

const cellClass = (cell) => {
    if (!cell) return 'cell cell-empty';
    return `cell ${PIECE_COLOR[cell] || 'cell-empty'}`;
};

export function Board({ board, activePiece = null }) {
    const display = buildDisplayBoard(board, activePiece);

    return (
        <div className="tetris-container">
            <div className="board">
                {display.map((row, y) => (
                    <div key={y} className="board-row">
                        {row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={cellClass(cell)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
