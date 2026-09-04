import '../style/NextPiece.css';
import { PIECES } from '../../shared/tetris/index.js';

const PIECE_COLOR = {
    I: '#00d9ff',
    O: '#ffd93d',
    T: '#b24bf3',
    J: '#2196f3',
    L: '#ff9800',
    S: '#4caf50',
    Z: '#f44336',
};

export function NextPiece({ type }) {
    if (!type || !PIECES[type]) return null;

    const { shape } = PIECES[type];
    const xs = shape.map(([x]) => x);
    const ys = shape.map(([, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;

    // Build a small grid for the preview
    const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
    shape.forEach(([x, y]) => {
        grid[y - minY][x - minX] = true;
    });

    return (
        <div className="next-piece">

            <div className="next-piece-grid">
                {grid.map((row, r) => (
                    <div key={r} className="next-piece-row">
                        {row.map((filled, c) => (
                            <div
                                key={c}
                                className="next-piece-cell"
                                style={{
                                    background: filled ? PIECE_COLOR[type] : 'transparent',
                                    opacity: filled ? 1 : 0,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
