import { expect } from "chai";
import { PIECES, getPieceShape, createPiece, generateRandomPiece, generateRandomQueue } from "../../src/shared/tetris";

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
                    const piece = createPiece({ type: type });
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

    describe('generateRandomPiece', () => {
        it('returns a valid piece type', () => {
            const pieceType = generateRandomPiece();
            const validTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
            expect(validTypes).to.include(pieceType);
        });
    });

    describe('generateRandomQueue', () => {
        it('returns a valid queue with length 7', () => {
            const queue = generateRandomQueue();
            const validTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
            expect(queue).to.be.an('array');
            expect(queue).to.have.lengthOf(7);
            queue.forEach((pieceType) => {
                expect(validTypes).to.include(pieceType);
            });
        });
    });
});