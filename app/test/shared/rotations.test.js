import { expect } from 'chai';
import { rotate90, rotateN } from '../../src/shared/tetris';
import { PIECES, createEmptyBoard, createPiece } from '../../src/shared/tetris';

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
        it('returns original shape after four rotations', () => {
            Object.entries(PIECES).forEach(([type, piece]) => {
                const rotated = rotateN(piece.shape, 4, piece.pivot);
                expect(rotated).to.deep.equal(piece.shape);
            });
        });
    });
});