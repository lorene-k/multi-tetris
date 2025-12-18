import { expect } from 'chai';
import { step } from '../../src/server/game.js';
import { createGameState, createPiece, canPlacePiece } from '../../src/shared/tetris';

describe('game.js', () => {
    let activePiece;
    let state;
    beforeEach(() => {
        activePiece = createPiece({ type: 'I' });
        state = createGameState(activePiece);
    });

    describe('step', () => {
        it('should merge piece and spawn new piece when soft drop is not possible', () => {
            let y = activePiece.pos.y;
            while (canPlacePiece(state.board, { ...activePiece, pos: { x: activePiece.pos.x, y: y + 1 } })) {
                y++;
            }
            const pieceDownState = { ...state, activePiece: { ...activePiece, pos: { x: activePiece.pos.x, y: y } } };
            const newState = step(pieceDownState);
            const boardHasPiece = newState.board.some(row => row.some(cell => cell !== 0));
            expect(newState.board).to.not.deep.equal(pieceDownState.board);
            expect(newState.activePiece.type).to.equal('0');
            expect(boardHasPiece).to.equal(true);
        });

        it('should perform soft drop when possible', () => {
            const newState = step(state);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
            expect(newState.board).to.deep.equal(state.board);
        });
    });
});