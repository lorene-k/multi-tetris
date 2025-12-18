import { expect } from "chai";
import { PIECES, getPieceShape } from "../../src/shared/tetris";

describe('pieces.js', () => {
    describe('getPieceShape', () => {
        it('returns base shape when rotation is 0', () => {
            const piece = {
                type: 'T',
                rotation: 0,
                pos: { x: 0, y: 0 },
            };
            const shape = getPieceShape(piece);
            expect(shape).to.deep.equal(PIECES.T.shape);
        });

        it('preserves block count for all pieces and rotations', () => {
            Object.entries(PIECES).forEach(([type, def]) => {
                for (let rotation = 0; rotation < 4; rotation++) {
                    const piece = {
                        type,
                        rotation,
                        pos: { x: 0, y: 0 },
                    };
                    const shape = getPieceShape(piece);
                    expect(shape.length).to.equal(def.shape.length);
                }
            });
        });

        it('does not mutate the base shape', () => {
            Object.entries(PIECES).forEach(([type, def]) => {
                const original = JSON.parse(JSON.stringify(def.shape));
                getPieceShape({
                    type,
                    rotation: 1,
                    pos: { x: 0, y: 0 },
                });
                expect(def.shape).to.deep.equal(original);
            });
        });
    });
});