import { expect } from 'chai';
import { rotate90, rotateN, PIECES } from '../../src/shared/tetris/index.js';

describe('rotations.js', () => {

    describe('rotate90', () => {
        it('preserves block count', () => {
            Object.values(PIECES).forEach(piece => {
                expect(rotate90(piece.shape, piece.pivot).length).to.equal(piece.shape.length);
            });
        });

        it('does not mutate state', () => {
            Object.values(PIECES).forEach(piece => {
                const shapeCopy = JSON.parse(JSON.stringify(piece.shape));
                rotate90(piece.shape, piece.pivot);
                expect(piece.shape).to.deep.equal(shapeCopy);
            });
        });
    });

    describe('rotateN', () => {
        it('returns original shape after 0 or 4 rotations', () => {
            Object.values(PIECES).forEach(piece => {
                expect(rotateN(piece.shape, piece.pivot, 4)).to.deep.equal(piece.shape);
                expect(rotateN(piece.shape, piece.pivot, 0)).to.deep.equal(piece.shape);
            });
        });
    });
});
