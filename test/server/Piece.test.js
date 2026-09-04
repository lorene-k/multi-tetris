import { expect } from 'chai';
import Piece from '../../src/server/classes/Piece.js';
import { PIECES, PIECE_TYPES } from '../../src/shared/tetris/index.js';

describe('Piece', () => {

    it('creates a piece for each valid type', () => {
        PIECE_TYPES.forEach(type => {
            const piece = new Piece(type);
            expect(piece.type).to.equal(type);
            expect(piece.rotation).to.equal(0);
        });
    });

    it('throws for an invalid type', () => {
        expect(() => new Piece('X')).to.throw(Error);
    });

    it('getDefinition returns the piece definition', () => {
        const piece = new Piece('T');
        const def = piece.getDefinition();
        expect(def).to.deep.equal(PIECES['T']);
    });

    it('getShape returns the base shape', () => {
        const piece = new Piece('L');
        expect(piece.getShape()).to.deep.equal(PIECES['L'].shape);
    });

    it('getPivot returns the pivot', () => {
        const piece = new Piece('I');
        expect(piece.getPivot()).to.deep.equal(PIECES['I'].pivot);
    });

    it('creates 7 different pieces', () => {
        const pieces = PIECE_TYPES.map(t => new Piece(t));
        const types = pieces.map(p => p.type);
        expect(new Set(types).size).to.equal(7);
    });
});
