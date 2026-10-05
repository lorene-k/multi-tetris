import { expect } from 'chai';
import {
    createEmptyBoard, isInsideBoard, isCellEmpty,
    BOARD_WIDTH, BOARD_HEIGHT,
} from '../../src/shared/tetris/index.js';

describe('board.js', () => {
    let board;

    beforeEach(() => {
        board = createEmptyBoard();
    });

    describe('createEmptyBoard', () => {
        it('creates a BOARD_HEIGHT x BOARD_WIDTH board', () => {
            expect(board).to.have.lengthOf(BOARD_HEIGHT);
            board.forEach(row => expect(row).to.have.lengthOf(BOARD_WIDTH));
        });

        it('fills the board with 0s', () => {
            board.forEach(row => row.forEach(cell => expect(cell).to.equal(0)));
        });
    });

    describe('isInsideBoard', () => {
        it('return true for valid coordinates', () => {
            expect(isInsideBoard(0, 0)).to.be.true;
            expect(isInsideBoard(BOARD_WIDTH - 1, BOARD_HEIGHT - 1)).to.be.true;
        });

        it('returns false for out-of-bounds coordinates', () => {
            expect(isInsideBoard(-1, 0)).to.be.false;
            expect(isInsideBoard(0, -1)).to.be.false;
            expect(isInsideBoard(BOARD_WIDTH, 0)).to.be.false;
            expect(isInsideBoard(0, BOARD_HEIGHT)).to.be.false;
        });
    });

    describe('isCellEmpty', () => {
        it('returns true for empty cells', () => {
            expect(isCellEmpty(board, 0, 0)).to.be.true;
            expect(isCellEmpty(board, BOARD_WIDTH - 1, BOARD_HEIGHT - 1)).to.be.true;
        });

        it('returns false for occupied cells', () => {
            board[0][0] = 1;
            expect(isCellEmpty(board, 0, 0)).to.be.false;
        });

        it('returns false for out-of-bounds coordinates', () => {
            expect(isCellEmpty(board, -1, 0)).to.be.false;
            expect(isCellEmpty(board, 0, -1)).to.be.false;
            expect(isCellEmpty(board, BOARD_WIDTH, 0)).to.be.false;
            expect(isCellEmpty(board, 0, BOARD_HEIGHT)).to.be.false;
        });
    });
});
