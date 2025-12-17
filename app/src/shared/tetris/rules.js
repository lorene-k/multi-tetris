// collision checks
// line clearing
// grabity/tick
// move
// rotate
// drop soft (down)
// drop hard (space)

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