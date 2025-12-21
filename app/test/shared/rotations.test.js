import { expect } from 'chai';
import { rotate90, rotateN } from '../../src/shared/tetris/index.js';
import { PIECES, createEmptyBoard, createPiece } from '../../src/shared/tetris/index.js';

describe('rotations.js', () => {

    describe('rotate90', () => {
        it('preserves block count', () => {
            Object.entries(PIECES).forEach(([type, piece]) => {
                const rotated = rotate90(piece.shape, piece.pivot);
                expect(rotated.length).to.equal(piece.shape.length);
            })
        });

        it('does not mutate state', () => {
            Object.entries(PIECES).forEach(([type, piece]) => {
                const shapeCopy = JSON.parse(JSON.stringify(piece.shape));
                rotate90(piece.shape, piece.pivot);
                expect(piece.shape).to.deep.equal(shapeCopy);
            });
        });
    });

    describe('rotateN', () => {
        it('returns original shape after 0 or 4 rotations', () => {
            Object.entries(PIECES).forEach(([type, piece]) => {
                const rotated4 = rotateN(piece.shape, piece.pivot, 4);
                const rotated0 = rotateN(piece.shape, piece.pivot, 0);
                expect(rotated4).to.deep.equal(piece.shape);
                expect(rotated0).to.deep.equal(piece.shape);
            });
        });
    });
});