import { BOARD_WIDTH, BOARD_HEIGHT, isInsideBoard, isCellEmpty, rotateN, getPieceShape } from '.';

export function canPlacePiece(board, piece) {
    const shape = getPieceShape(piece);
    return shape.every(([dx, dy]) => {
        const x = piece.pos.x + dx;
        const y = piece.pos.y + dy;
        return isCellEmpty(board, x, y);
    });
}

export function movePiece(state, direction) {
    const { board, activePiece } = state;
    if (!activePiece) return state;

    let newPos;
    switch (direction) {
        case 'left':
            newPos = { x: activePiece.pos.x - 1, y: activePiece.pos.y };
            break;
        case 'right':
            newPos = { x: activePiece.pos.x + 1, y: activePiece.pos.y };
            break;
        case 'down':
            newPos = { x: activePiece.pos.x, y: activePiece.pos.y + 1 };
            break;
        default:
            return state;
    }

    const movedPiece = { ...activePiece, pos: newPos };
    if (canPlacePiece(board, movedPiece)) {
        return { ...state, activePiece: movedPiece };
    }
    return state;
}

export function rotatePiece(state, direction = 'right') {
    const { board, activePiece } = state;
    if (!activePiece) return state;
    if (direction !== 'left' && direction !== 'right') return state;

    const delta = direction === 'right' ? 1 : -1;
    const rotatedPiece = {
        ...activePiece,
        rotation: (activePiece.rotation + delta + 4) % 4,
    }

    if (canPlacePiece(board, rotatedPiece)) {
        return { ...state, activePiece: rotatedPiece };
    }
    return state;
}

export function hardDrop(state) {
    const { board, activePiece } = state;
    if (!activePiece) return state;

    let y = activePiece.pos.y;
    while (canPlacePiece(board, { ...activePiece, pos: { x: activePiece.pos.x, y: y + 1 } })) {
        y++;
    }

    const droppedPiece = { ...activePiece, pos: { x: activePiece.pos.x, y } };
    const newBoard = mergePiece(board, droppedPiece);

    return { ...state, board: newBoard, activePiece: null };
}

export function softDrop(state) {
    return movePiece(state, 'down');
}

export function addPenaltyLines(board, numLines) {
    const addedLines = Array.from({ length: numLines }, () => {
        const holeIndex = Math.floor(Math.random() * BOARD_WIDTH);
        return Array.from({ length: BOARD_WIDTH }, (_, x) => (x === holeIndex ? 0 : 1));
    });

    const newBoard = [...board.slice(numLines), ...addedLines];
    return newBoard;
}

export function mergePiece(board, piece) {
    const newBoard = board.map(row => row.slice());
    const shape = getPieceShape(piece);

    shape.forEach(([dx, dy]) => {
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
    if (!board || !board.length) return true;
    return board[0].some(cell => cell !== 0);
}