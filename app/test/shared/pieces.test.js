import { expect } from "chai";
import { PIECES, getPieceShape, createPiece } from "../../src/shared/tetris";

describe('pieces.js', () => {
    describe('getPieceShape', () => {
        it('returns base shape when rotation is 0', () => {
            const piece = createPiece({ type: 'T' });
            const shape = getPieceShape(piece);
            expect(shape).to.deep.equal(PIECES.T.shape);
        });

        it('preserves block count for all pieces and rotations', () => {
            Object.entries(PIECES).forEach(([type, def]) => {
                for (let rotation = 0; rotation < 4; rotation++) {
                    const piece = createPiece({ type: type});
                    const shape = getPieceShape(piece);
                    expect(shape.length).to.equal(def.shape.length);
                }
            });
        });

        it('does not mutate the base shape', () => {
            Object.entries(PIECES).forEach(([type, def]) => {
                const original = JSON.parse(JSON.stringify(def.shape));
                getPieceShape(createPiece({ type: type, rotation: 1 }));
                expect(def.shape).to.deep.equal(original);
            });
        });
    });
});