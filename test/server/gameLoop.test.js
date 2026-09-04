import { expect } from 'chai';
import sinon from 'sinon';
import { step, createRng, gameLoop, applyInput } from '../../src/server/game/gameLoop.js';
import {
    createGameState, createPiece, canPlacePiece,
    BOARD_WIDTH, BOARD_HEIGHT, TICK_RATE_MS,
    generateRandomPiece,
} from '../../src/shared/tetris/index.js';

describe('gameLoop.js', () => {
    let activePiece, state, rng;

    beforeEach(() => {
        activePiece = createPiece({ type: 'I' });
        state = createGameState(activePiece);
        state = { ...state, nextPieces: ['O', 'I', 'L', 'J', 'S', 'Z', 'T'] };
        rng = createRng('test-seed');
    });

    // ── step ──────────────────────────────────────────────────────────────

    describe('step', () => {
        it('moves piece down by one row when possible', () => {
            const newState = step(state, rng);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
            expect(newState.board).to.deep.equal(state.board);
        });

        it('merges piece and spawns next when piece can no longer fall', () => {
            let s = state;
            // Drop piece to the bottom
            while (canPlacePiece(s.board, { ...s.activePiece, pos: { x: s.activePiece.pos.x, y: s.activePiece.pos.y + 1 } })) {
                s = step(s, rng);
            }
            const newState = step(s, rng);
            expect(newState.activePiece.type).to.not.equal(null);
            const boardHasPiece = newState.board.some(row => row.some(c => c !== 0));
            expect(boardHasPiece).to.be.true;
        });

        it('sets gameOver when piece spawns into occupied space', () => {
            const filledBoard = createEmptyBoard_helper();
            // Fill all but bottom row to make game over after piece lands
            const almostFull = Array.from({ length: BOARD_HEIGHT - 1 }, () =>
                Array.from({ length: BOARD_WIDTH }, (_, x) => (x === 5 ? 0 : 1))
            );
            const gameOverState = {
                ...state,
                board: [state.board[0], ...almostFull],
            };
            const newState = step(gameOverState, rng);
            expect(newState.gameOver).to.equal(true);
        });

        it('does not mutate original state', () => {
            const copy = JSON.parse(JSON.stringify(state));
            step(state, rng);
            expect(state).to.deep.equal(copy);
        });

        it('clears full lines when piece locks', () => {
            const filledBoard = Array.from({ length: BOARD_HEIGHT }, () =>
                Array.from({ length: BOARD_WIDTH }, () => 1)
            );
            const filledState = { ...state, board: filledBoard };
            const newState = step(filledState, rng);
            newState.board.forEach(row => {
                expect(row.every(c => c === 0)).to.be.true;
            });
        });

        it('refills nextPieces from rng when empty and piece locks', () => {
            let s = state;
            // Drop to bottom
            while (canPlacePiece(s.board, { ...s.activePiece, pos: { x: s.activePiece.pos.x, y: s.activePiece.pos.y + 1 } })) {
                s = step(s, rng);
            }
            const emptyQueue = { ...s, nextPieces: [] };
            const newState = step(emptyQueue, rng);
            expect(newState.nextPieces).to.be.an('array');
        });

        it('returns same state if activePiece is null', () => {
            const noPiece = createGameState(null);
            const result = step(noPiece, rng);
            expect(result).to.equal(noPiece);
        });
    });

    // ── applyInput ────────────────────────────────────────────────────────

    describe('applyInput', () => {
        it('moves piece left', () => {
            const newState = applyInput(state, 'left');
            expect(newState.activePiece.pos.x).to.equal(state.activePiece.pos.x - 1);
        });

        it('moves piece right', () => {
            const newState = applyInput(state, 'right');
            expect(newState.activePiece.pos.x).to.equal(state.activePiece.pos.x + 1);
        });

        it('rotates piece (using T piece which can rotate at spawn)', () => {
            const tPiece = createPiece({ type: 'T', pos: { x: 4, y: 3 } });
            const s = createGameState(tPiece);
            const newState = applyInput({ ...s, nextPieces: [] }, 'rotate');
            expect(newState.activePiece.rotation).to.equal(1);
        });

        it('soft drops piece', () => {
            const newState = applyInput(state, 'softDrop');
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
        });

        it('hard drops piece (activePiece becomes null)', () => {
            const newState = applyInput(state, 'hardDrop');
            expect(newState.activePiece).to.be.null;
        });

        it('returns same state for unknown input', () => {
            const result = applyInput(state, 'fly');
            expect(result).to.equal(state);
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            const result = applyInput(nopiece, 'left');
            expect(result).to.equal(nopiece);
        });
    });

    // ── createRng ─────────────────────────────────────────────────────────

    describe('createRng', () => {
        it('returns consistent results for the same seed', () => {
            const r1 = createRng('seed');
            const r2 = createRng('seed');
            expect(generateRandomPiece(r1)).to.equal(generateRandomPiece(r2));
        });

        it('returns different results for different seeds', () => {
            const r1 = createRng('seedA');
            const r2 = createRng('seedB');
            // Generate many pieces; at least one pair should differ
            const seq1 = Array.from({ length: 20 }, () => generateRandomPiece(r1));
            const seq2 = Array.from({ length: 20 }, () => generateRandomPiece(r2));
            const allSame = seq1.every((t, i) => t === seq2[i]);
            expect(allSame).to.be.false;
        });
    });

    // ── gameLoop ──────────────────────────────────────────────────────────

    describe('gameLoop', () => {
        let clock, game;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            game = gameLoop();
        });

        afterEach(() => {
            game.stop();
            clock.restore();
        });

        it('initialises game state correctly', () => {
            const s = game.getState();
            expect(s).to.have.property('board');
            expect(s).to.have.property('activePiece');
            expect(s).to.have.property('nextPieces');
            expect(s.nextPieces).to.be.an('array');
        });

        it('has an active piece at start', () => {
            expect(game.getState().activePiece).to.not.be.null;
        });

        it('updates state on each tick', () => {
            const s1 = game.getState();
            clock.tick(TICK_RATE_MS);
            const s2 = game.getState();
            expect(s2).to.not.deep.equal(s1);
        });

        it('stop() halts the loop', () => {
            game.stop();
            const s1 = game.getState();
            clock.tick(TICK_RATE_MS * 10);
            const s2 = game.getState();
            expect(s2).to.deep.equal(s1);
        });
    });
});

function createEmptyBoard_helper() {
    return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}
