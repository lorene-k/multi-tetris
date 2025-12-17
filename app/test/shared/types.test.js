import { expect } from 'chai';
import { createPiece } from '../../src/shared/tetris';

describe('types.js', () => {
    describe('createPiece', () => {
        it('uses provided position and rotation', () => {
            const piece = createPiece({ type: 'I', pos: { x: 1, y: 2 }, rotation: 1 });
            expect(piece.pos).to.deep.equal({ x: 1, y: 2 });
            expect(piece.rotation).to.equal(1);
            expect(piece.type).to.equal('I');
        });

        it('defaults position to SPAWN_POSITION (4, 0) and rotation to 0 if not provided', () => {
            const piece = createPiece({ type: 'O' });
            expect(piece.pos).to.deep.equal({ x: 4, y: 0 });
            expect(piece.rotation).to.equal(0);
            expect(piece.type).to.equal('O');
        });
    });
});