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
            [1, 0],
            [1, 1],
            [0, 2],
            [1, 2],
        ]
    },
    L: {
        pivot: { x: 1, y: 1 },
        shape: [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
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
    const shape = PIECES[piece.type].shape;
    return rotateN(shape, piece.rotation);
}

export function generateRandomPiece(rng) {
    const index = Math.floor(rng() * PIECE_TYPES.length);
    return PIECE_TYPES[index];
}

export function generateRandomQueue(rng) {
    return Array.from({ length: 7 }, () => generateRandomPiece(rng));
}