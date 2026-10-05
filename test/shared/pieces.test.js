import { expect } from 'chai';
import {
    PIECES, PIECE_TYPES, getPieceShape, createPiece, createEmptyBoard,
    generateRandomPiece, generateRandomQueue, generateBag, computeSpectrum,
    BOARD_WIDTH, BOARD_HEIGHT,
} from '../../src/shared/tetris/index.js';
import { createRng } from '../../src/server/game/gameLoop.js';

describe('pieces.js', () => {

    describe('getPieceShape', () => {
        it('returns base shape when rotation is 0', () => {
            expect(getPieceShape(createPiece({ type: 'T' }))).to.deep.equal(PIECES.T.shape);
        });

        it('preserves block count for all pieces and rotations', () => {
            PIECE_TYPES.forEach(type => {
                for (let rotation = 0; rotation < 4; rotation++) {
                    const shape = getPieceShape(createPiece({ type, rotation }));
                    expect(shape.length).to.equal(PIECES[type].shape.length);
                }
            });
        });

        it('does not mutate the base shape', () => {
            PIECE_TYPES.forEach(type => {
                const original = JSON.parse(JSON.stringify(PIECES[type].shape));
                getPieceShape(createPiece({ type, rotation: 1 }));
                expect(PIECES[type].shape).to.deep.equal(original);
            });
        });

        it('produces distinct shapes for different rotations (non-symmetric pieces)', () => {
            ['T', 'J', 'L', 'I'].forEach(type => {
                const r0 = getPieceShape(createPiece({ type, rotation: 0 }));
                const r1 = getPieceShape(createPiece({ type, rotation: 1 }));
                expect(r0).to.not.deep.equal(r1);
            });
        });
    });

    describe('generateRandomPiece', () => {
        it('returns one of the 7 valid types for many calls', () => {
            const rng = createRng('another-seed');
            for (let i = 0; i < 50; i++) {
                expect(PIECE_TYPES).to.include(generateRandomPiece(rng));
            }
        });
    });

    describe('generateRandomQueue', () => {
        it('returns a queue with length 7', () => {
            expect(generateRandomQueue(createRng('test-seed'))).to.be.an('array').with.lengthOf(7);
        });

        it('all types are valid', () => {
            generateRandomQueue(createRng('test-seed'))
                .forEach(type => expect(PIECE_TYPES).to.include(type));
        });
    });

    describe('generateBag', () => {
        it('returns exactly 7 items - one of each piece type', () => {
            const bag = generateBag(createRng('test-seed'));
            expect(bag).to.have.lengthOf(7);
            PIECE_TYPES.forEach(type => expect(bag).to.include(type));
        });

        it('is a permutation (no duplicates)', () => {
            expect(new Set(generateBag(createRng('bag-test'))).size).to.equal(7);
        });
    });

    describe('computeSpectrum', () => {
        let board;

        beforeEach(() => {
            board = createEmptyBoard();
        });

        it('returns 0 for all columns on empty board', () => {
            const spectrum = computeSpectrum(board);
            expect(spectrum).to.have.lengthOf(BOARD_WIDTH);
            spectrum.forEach(height => expect(height).to.equal(0));
        });

        it('returns correct height when a block is placed', () => {
            board[BOARD_HEIGHT - 1][0] = 'I'; // bottom-left
            const spectrum = computeSpectrum(board);
            expect(spectrum[0]).to.equal(1);
            expect(spectrum[1]).to.equal(0);
        });

        it('returns full height when entire column is filled', () => {
            board.forEach(row => { row[5] = 'T'; });
            expect(computeSpectrum(board)[5]).to.equal(BOARD_HEIGHT);
        });
    });
});
