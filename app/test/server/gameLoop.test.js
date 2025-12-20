import { expect } from 'chai';
import { step, createRng } from '../../src/server/game/gameLoop.js';
import { createGameState, createPiece, canPlacePiece, BOARD_WIDTH, BOARD_HEIGHT, generateRandomQueue } from '../../src/shared/tetris';

describe('gameLoop.js', () => {
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

        it('returns new state with null activePiece when game is over', () => {
            const addedLines = Array.from({ length: BOARD_HEIGHT - 1 }, () => {
                const holeIndex = Math.floor(Math.random() * BOARD_WIDTH);
                return Array.from({ length: BOARD_WIDTH }, (_, x) => (x === holeIndex ? 0 : 1));
            });
            const gameOverState = {
                ...state,
                board: [...state.board.slice(BOARD_HEIGHT - 1), ...addedLines],
                gameOver: true,
            };
            const newState = step(gameOverState);
            expect(newState.board).to.not.equal(null);
            expect(newState.activePiece).to.equal(null);
            expect(newState).to.not.deep.equal(gameOverState);
        })

        it('creates a random queue if nextPieces is empty', () => {
            let y = activePiece.pos.y;
            while (canPlacePiece(state.board, { ...activePiece, pos: { x: activePiece.pos.x, y: y + 1 } })) {
                y++;
            }

            const emptyQueueState = {
                ...state,
                nextPieces: [],
                activePiece: { ...activePiece, pos: { x: activePiece.pos.x, y: y } }
            };
            const newState = step(emptyQueueState);
            expect(newState.nextPieces).to.be.an('array');
            expect(newState.nextPieces).to.have.lengthOf(6);
        });
    });

    describe('createRng', () => {
        it('produces consistent random numbers for the same seed', () => {
            const seed = 'test-seed';
            const rng1 = createRng(seed);
            const rng2 = createRng(seed);
            const numbers1 = Array.from({ length: 5 }, () => rng1());
            const numbers2 = Array.from({ length: 5 }, () => rng2());
            expect(numbers1).to.deep.equal(numbers2);
        });

        it('produces different random numbers for different seeds', () => {
            const rng1 = createRng('seed-one');
            const rng2 = createRng('seed-two');
            const numbers1 = Array.from({ length: 5 }, () => rng1());
            const numbers2 = Array.from({ length: 5 }, () => rng2());
            expect(numbers1).to.not.deep.equal(numbers2);
        });
    });
});