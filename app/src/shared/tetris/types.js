import { createEmptyBoard } from './board.js';

export const createPiece = ({ type, pos, rotation = 0 }) => ({
    type,
    rotation,
    pos,        // { x, y }
})

export const createGameState = () => ({
    board: createEmptyBoard(),
    activePiece: null,
    nextPieces: [],
    gameOver: false,
})