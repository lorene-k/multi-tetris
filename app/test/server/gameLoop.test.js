import { expect } from 'chai';
import { step } from '../../src/server/game/gameLoop.js';
import { createGameState, createPiece, canPlacePiece, BOARD_WIDTH, BOARD_HEIGHT } from '../../src/shared/tetris';

describe('game.js', () => {
    let activePiece;
    let state;
    beforeEach(() => {
        activePiece = createPiece({ type: 'I' });
        state = createGameState(activePiece);
        state.nextPieces = ['O', 'I', 'L', 'J', 'S', 'Z', 'T'];
    });

    describe('step', () => {
        it('merges piece and spawn new piece when soft drop is not possible', () => {
            let y = activePiece.pos.y;
            while (canPlacePiece(state.board, { ...activePiece, pos: { x: activePiece.pos.x, y: y + 1 } })) {
                y++;
            }
            const pieceDownState = { ...state, activePiece: { ...activePiece, pos: { x: activePiece.pos.x, y: y } } };
            const newState = step(pieceDownState);
            const boardHasPiece = newState.board.some(row => row.some(cell => cell !== 0));
            expect(newState.board).to.not.deep.equal(pieceDownState.board);
            expect(newState.activePiece.type).to.equal('O');
            expect(boardHasPiece).to.equal(true);
        });

        it('returns state after soft drop when possible', () => {
            const newState = step(state);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
            expect(newState.board).to.deep.equal(state.board);
        });

        it('sets gameOver to true when first line is not empty', () => {
            const addedLines = Array.from({ length: BOARD_HEIGHT - 1 }, () => {
                const holeIndex = Math.floor(Math.random() * BOARD_WIDTH);
                return Array.from({ length: BOARD_WIDTH }, (_, x) => (x === holeIndex ? 0 : 1));
            });
            const gameOverState = {
                ...state,
                board: [...state.board.slice(BOARD_HEIGHT - 1), ...addedLines],
            };
            const newState = step(gameOverState);
            expect(newState.gameOver).to.equal(true);
        });

        it('does not mutate the original state', () => {
            const stateCopy = JSON.parse(JSON.stringify(state));
            step(state);
            expect(state).to.deep.equal(stateCopy);
        });

        it('clears full lines when possible', () => {
            const filledBoard = state.board.map(() => Array(BOARD_WIDTH).fill(1));
            const filledState = { ...state, board: filledBoard };
            const newState = step(filledState);
            newState.board.forEach(row => {
                const isEmpty = row.every(cell => cell === 0);
                expect(isEmpty).to.equal(true);
            });
        });
    });
});