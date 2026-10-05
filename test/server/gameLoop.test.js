import { expect } from 'chai';
import sinon from 'sinon';
import { step, createRng, gameLoop, applyInput } from '../../src/server/game/gameLoop.js';
import {
    createGameState, createPiece, canPlacePiece,
    BOARD_WIDTH, BOARD_HEIGHT, TICK_RATE_MS,
    generateRandomPiece,
} from '../../src/shared/tetris/index.js';

// Steps until the active piece is resting on the floor, without locking it
function dropToFloor(state, rng) {
    let current = state;
    while (canPlacePiece(current.board, {
        ...current.activePiece,
        pos: { x: current.activePiece.pos.x, y: current.activePiece.pos.y + 1 },
    })) {
        current = step(current, rng);
    }
    return current;
}

describe('gameLoop.js', () => {
    let state, rng;

    beforeEach(() => {
        state = {
            ...createGameState(createPiece({ type: 'I' })),
            nextPieces: ['O', 'I', 'L', 'J', 'S', 'Z', 'T'],
        };
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
            const newState = step(dropToFloor(state, rng), rng);
            expect(newState.activePiece.type).to.not.equal(null);
            expect(newState.board.some(row => row.some(cell => cell !== 0))).to.be.true;
        });

        it('sets gameOver when piece spawns into occupied space', () => {
            // Fill all rows but the top one, leaving a single column open
            const almostFull = Array.from({ length: BOARD_HEIGHT - 1 }, () =>
                Array.from({ length: BOARD_WIDTH }, (_, x) => (x === 5 ? 0 : 1))
            );
            const newState = step({ ...state, board: [state.board[0], ...almostFull] }, rng);
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
            const newState = step({ ...state, board: filledBoard }, rng);
            newState.board.forEach(row => expect(row.every(cell => cell === 0)).to.be.true);
        });

        it('refills nextPieces from rng when empty and piece locks', () => {
            const grounded = dropToFloor(state, rng);
            const newState = step({ ...grounded, nextPieces: [] }, rng);
            expect(newState.nextPieces).to.be.an('array');
        });

        it('returns same state if activePiece is null', () => {
            const noPiece = createGameState(null);
            expect(step(noPiece, rng)).to.equal(noPiece);
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
            const tState = createGameState(createPiece({ type: 'T', pos: { x: 4, y: 3 } }));
            const newState = applyInput(tState, 'rotate');
            expect(newState.activePiece.rotation).to.equal(1);
        });

        it('soft drops piece', () => {
            const newState = applyInput(state, 'softDrop');
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
        });

        it('hard drops piece (activePiece becomes null)', () => {
            expect(applyInput(state, 'hardDrop').activePiece).to.be.null;
        });

        it('returns same state for unknown input', () => {
            expect(applyInput(state, 'fly')).to.equal(state);
        });

        it('returns same state if no active piece', () => {
            const noPiece = createGameState(null);
            expect(applyInput(noPiece, 'left')).to.equal(noPiece);
        });
    });

    // ── createRng ─────────────────────────────────────────────────────────

    describe('createRng', () => {
        it('returns consistent results for the same seed', () => {
            expect(generateRandomPiece(createRng('seed'))).to.equal(generateRandomPiece(createRng('seed')));
        });

        it('returns different results for different seeds', () => {
            const r1 = createRng('seedA');
            const r2 = createRng('seedB');
            // Generate many pieces; at least one pair should differ
            const seq1 = Array.from({ length: 20 }, () => generateRandomPiece(r1));
            const seq2 = Array.from({ length: 20 }, () => generateRandomPiece(r2));
            expect(seq1.every((type, i) => type === seq2[i])).to.be.false;
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
            const state = game.getState();
            expect(state).to.have.property('board');
            expect(state).to.have.property('activePiece');
            expect(state.nextPieces).to.be.an('array');
        });

        it('has an active piece at start', () => {
            expect(game.getState().activePiece).to.not.be.null;
        });

        it('updates state on each tick', () => {
            const before = game.getState();
            clock.tick(TICK_RATE_MS);
            expect(game.getState()).to.not.deep.equal(before);
        });

        it('stop() halts the loop', () => {
            game.stop();
            const before = game.getState();
            clock.tick(TICK_RATE_MS * 10);
            expect(game.getState()).to.deep.equal(before);
        });
    });
});
