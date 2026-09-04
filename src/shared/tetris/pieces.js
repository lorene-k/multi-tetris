import { rotateN } from "./index.js";

export const PIECES = {
    I: {
        pivot: { x: 1.5, y: 0.5 },
        shape: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
        ]
    },
    O: {
        pivot: { x: 0.5, y: 0.5 },
        shape: [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        ]
    },
    T: {
        pivot: { x: 1, y: 1 },
        shape: [
            [0, 0],
            [1, 0],
            [2, 0],
            [1, 1],
        ]
    },
    J: {
        pivot: { x: 1, y: 1 },
        shape: [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ]
    },
    L: {
        pivot: { x: 1, y: 1 },
        shape: [
            [2, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ]
    },
    S: {
        pivot: { x: 1, y: 1 },
        shape: [
            [1, 0],
            [2, 0],
            [0, 1],
            [1, 1],
        ]
    },
    Z: {
        pivot: { x: 1, y: 1 },
        shape: [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1],
        ]
    },
}

export const PIECE_TYPES = Object.keys(PIECES);

export function getPieceShape(piece) {
    const { shape, pivot } = PIECES[piece.type];
    return rotateN(shape, pivot, piece.rotation);
}

export function generateRandomPiece(rng) {
    const index = Math.floor(rng() * PIECE_TYPES.length);
    return PIECE_TYPES[index];
}

export function generateRandomQueue(rng) {
    return Array.from({ length: 7 }, () => generateRandomPiece(rng));
}

// 7-bag shuffle: returns one full bag of all 7 pieces shuffled
export function generateBag(rng) {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
}

// Compute the spectrum (column heights) for a board
export function computeSpectrum(board) {
    const height = board.length;
    const width = board[0].length;
    return Array.from({ length: width }, (_, col) => {
        for (let row = 0; row < height; row++) {
            if (board[row][col] !== 0) {
                return height - row;
            }
        }
        return 0;
    });
}
