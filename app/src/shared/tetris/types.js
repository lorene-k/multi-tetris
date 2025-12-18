/**
 * Tetrimino instance
 * @typedef {Object} Piece
 * @property {string} type              // 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
 * @property {{x:number,y:number}} pos  // board coordinate of the piece pivot
 * @property {number} rotation          // 0–3 (clockwise 90° steps)
 */

/**
 * Immutable game state (shared client/server)
 * @typedef {Object} GameState
 * @property {number[][]} board         // 20x10 matrix of 0 | pieceType
 * @property {Piece|null} activePiece
 * @property {string[]} nextPieces      // queue of piece types
 * @property {boolean} gameOver
 */

import { createEmptyBoard } from './board.js';

const SPAWN_POSITION = () => ({ x: 4, y: 0 })

export const createPiece = ({ type, pos = SPAWN_POSITION(), rotation = 0 }) => ({
    type,
    rotation,
    pos,
})

export const createGameState = (activePiece = null) => ({
    board: createEmptyBoard(),
    activePiece,
    nextPieces: [],
    gameOver: false,
})