export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createEmptyBoard() {
    return Array.from({ length: BOARD_HEIGHT }, () =>
        Array.from({ length: BOARD_WIDTH }, () => 0)
    );
}

export function isInsideBoard(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

export function isCellEmpty(board, x, y) {
    return isInsideBoard(x, y) && board[y][x] === 0;
}

export function canPlacePiece(board, piece) {
    return piece.shape.every(([dx, dy]) => {
        const x = piece.pos.x + dx;
        const y = piece.pos.y + dy;
        return isCellEmpty(board, x, y);
    });
}

export function mergePiece(board, piece) {
    const newBoard = board.map(row => row.slice());

    piece.shape.forEach(([dx, dy]) => {
        const x = piece.pos.x + dx;
        const y = piece.pos.y + dy;
        if (isInsideBoard(x, y)) {
            newBoard[y][x] = piece.type;
        }
    });

    return newBoard;
}

export function clearLines(board) {
    const remainingRows = board.filter(
        row => row.some(cell => cell === 0)
    );
    const clearedLines = BOARD_HEIGHT - remainingRows.length;
    const emptyRows = Array.from(
        { length: clearedLines },
        () => Array.from({ length: BOARD_WIDTH }, () => 0)
    );

    return {
        board: [...emptyRows, ...remainingRows],
        clearedLines
    };
}

export function isGameOver(board) {
    return board[0].some(cell => cell !== 0);
}