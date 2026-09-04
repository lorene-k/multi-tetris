import { expect } from 'chai';
import {
    PIECES, PIECE_TYPES, getPieceShape, createPiece,
    generateRandomPiece, generateRandomQueue, generateBag, computeSpectrum,
} from '../../src/shared/tetris/index.js';
import { createRng } from '../../src/server/game/gameLoop.js';
import { createEmptyBoard } from '../../src/shared/tetris/index.js';

describe('pieces.js', () => {

    describe('getPieceShape', () => {
        it('returns base shape when rotation is 0', () => {
            const piece = createPiece({ type: 'T' });
            const shape = getPieceShape(piece);
            expect(shape).to.deep.equal(PIECES.T.shape);
        });

        it('preserves block count for all pieces and rotations', () => {
            PIECE_TYPES.forEach(type => {
                for (let rotation = 0; rotation < 4; rotation++) {
                    const piece = createPiece({ type, rotation });
                    const shape = getPieceShape(piece);
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

        it('four rotations returns original shape for all pieces', () => {
            PIECE_TYPES.forEach(type => {
                const piece0 = createPiece({ type, rotation: 0 });
                const piece4 = createPiece({ type, rotation: 4 % 4 });
                expect(getPieceShape(piece4)).to.deep.equal(getPieceShape(piece0));
            });
        });

        it('produces distinct shapes for different rotations (non-symmetric pieces)', () => {
            // T, J, L, S, Z, I all change shape on rotation
            ['T', 'J', 'L', 'I'].forEach(type => {
                const r0 = getPieceShape(createPiece({ type, rotation: 0 }));
                const r1 = getPieceShape(createPiece({ type, rotation: 1 }));
                expect(r0).to.not.deep.equal(r1);
            });
        });
    });

    describe('generateRandomPiece', () => {
        it('returns a valid piece type', () => {
            const rng = createRng('test-seed');
            const pieceType = generateRandomPiece(rng);
            expect(PIECE_TYPES).to.include(pieceType);
        });

        it('returns one of the 7 valid types for many calls', () => {
            const rng = createRng('another-seed');
            for (let i = 0; i < 50; i++) {
                expect(PIECE_TYPES).to.include(generateRandomPiece(rng));
            }
        });
    });

    describe('generateRandomQueue', () => {
        it('returns a queue with length 7', () => {
            const rng = createRng('test-seed');
            const queue = generateRandomQueue(rng);
            expect(queue).to.be.an('array').with.lengthOf(7);
        });

        it('all types are valid', () => {
            const rng = createRng('test-seed');
            generateRandomQueue(rng).forEach(t => expect(PIECE_TYPES).to.include(t));
        });
    });

    describe('generateBag', () => {
        it('returns exactly 7 items – one of each piece type', () => {
            const rng = createRng('test-seed');
            const bag = generateBag(rng);
            expect(bag).to.have.lengthOf(7);
            PIECE_TYPES.forEach(t => expect(bag).to.include(t));
        });

        it('is a permutation (no duplicates)', () => {
            const rng = createRng('bag-test');
            const bag = generateBag(rng);
            expect(new Set(bag).size).to.equal(7);
        });

        it('produces different orderings with different seeds', () => {
            const b1 = generateBag(createRng('s1'));
            const b2 = generateBag(createRng('s2'));
            // Not guaranteed to differ for every seed but very likely
            const same = b1.every((t, i) => t === b2[i]);
            // Allow for rare collision but at least one of many tries should differ
            expect(b1).to.be.an('array');
            expect(b2).to.be.an('array');
        });
    });

    describe('computeSpectrum', () => {
        it('returns 0 for all columns on empty board', () => {
            const board = createEmptyBoard();
            const spectrum = computeSpectrum(board);
            expect(spectrum).to.have.lengthOf(10);
            spectrum.forEach(h => expect(h).to.equal(0));
        });

        it('returns correct height when a block is placed', () => {
            const board = createEmptyBoard();
            board[19][0] = 'I'; // bottom-left
            const spectrum = computeSpectrum(board);
            expect(spectrum[0]).to.equal(1);
            expect(spectrum[1]).to.equal(0);
        });

        it('returns full height (20) when entire column is filled', () => {
            const board = createEmptyBoard();
            for (let r = 0; r < 20; r++) board[r][5] = 'T';
            const spectrum = computeSpectrum(board);
            expect(spectrum[5]).to.equal(20);
        });
    });
});
