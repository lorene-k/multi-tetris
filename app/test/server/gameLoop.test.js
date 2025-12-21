import { expect } from 'chai';
import { step, createRng } from '../../src/server/game/gameLoop.js';
import { createGameState, createPiece, canPlacePiece,
    BOARD_WIDTH, BOARD_HEIGHT, generateRandomPiece } from '../../src/shared/tetris/index.js';

describe('gameLoop.js', () => {
    let activePiece;
    let state;
    let rng;
    beforeEach(() => {
        activePiece = createPiece({ type: 'I' });
        state = createGameState(activePiece);
        state.nextPieces = ['O', 'I', 'L', 'J', 'S', 'Z', 'T'];
        rng = createRng('test-seed');
    });

    describe('step', () => {
        it('merges piece and spawn new piece when soft drop is not possible', () => {
            let y = activePiece.pos.y;
            while (canPlacePiece(state.board, { ...activePiece, pos: { x: activePiece.pos.x, y: y + 1 } })) {
                y++;
            }
            const pieceDownState = { ...state, activePiece: { ...activePiece, pos: { x: activePiece.pos.x, y: y } } };
            const newState = step(pieceDownState, rng);
            const boardHasPiece = newState.board.some(row => row.some(cell => cell !== 0));
            expect(newState.board).to.not.deep.equal(pieceDownState.board);
            expect(newState.activePiece.type).to.equal('O');
            expect(boardHasPiece).to.equal(true);
        });

        it('returns state after soft drop when possible', () => {
            const newState = step(state, rng);
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
            const newState = step(gameOverState, rng);
            expect(newState.gameOver).to.equal(true);
        });

        it('does not mutate the original state', () => {
            const stateCopy = JSON.parse(JSON.stringify(state));
            step(state, rng);
            expect(state).to.deep.equal(stateCopy);
        });

        it('clears full lines when possible', () => {
            const filledBoard = state.board.map(() => Array(BOARD_WIDTH).fill(1));
            const filledState = { ...state, board: filledBoard };
            const newState = step(filledState, rng);
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
            const newState = step(gameOverState, rng);
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
            const newState = step(emptyQueueState, rng);
            expect(newState.nextPieces).to.be.an('array');
            expect(newState.nextPieces).to.have.lengthOf(6);
        });
    });

    describe('createRng', () => {
        it('returns consistent random numbers for the same seed', () => {
            const seed = 'test-seed';
            const rng1 = createRng(seed);
            const rng2 = createRng(seed);
            const num1 = generateRandomPiece(rng1);
            const num2 = generateRandomPiece(rng2);
            expect(num1).to.equal(num2);
        });

        it('returns different random numbers for different seeds', () => {
            const rng1 = createRng('seed-one');
            const rng2 = createRng('seed-two');
            const num1 = generateRandomPiece(rng1);
            const num2 = generateRandomPiece(rng2);
            expect(num1).to.not.equal(num2);
        });
    });
});