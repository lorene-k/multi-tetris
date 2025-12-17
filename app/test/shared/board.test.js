import { expect } from 'chai';
import {
    createEmptyBoard, isInsideBoard, mergePiece, isCellEmpty, canPlacePiece,
    clearLines, isGameOver, BOARD_WIDTH, BOARD_HEIGHT, PIECES
} from '../../src/shared/tetris';

describe('board.js', () => {

    describe('createEmptyBoard', () => {
        let board;
        beforeEach(() => {
            board = createEmptyBoard();
        });
        it('should create a BOARD_HEIGHT x BOARD_WIDTH board', () => {
            expect(board).to.have.lengthOf(BOARD_HEIGHT);
            board.forEach(row => expect(row).to.have.lengthOf(BOARD_WIDTH));
        });
        it('should fill the board with 0s', () => {
            board.forEach(row => row.forEach(cell => expect(cell).to.equal(0)));
        });
    });

    describe('isInsideBoard', () => {
        it('should return true for valid coordinates', () => {
            expect(isInsideBoard(0, 0)).to.be.true;
            expect(isInsideBoard(BOARD_WIDTH - 1, BOARD_HEIGHT - 1)).to.be.true;
        });
        it('should return false for out-of-bounds coordinates', () => {
            expect(isInsideBoard(-1, 0)).to.be.false;
            expect(isInsideBoard(0, -1)).to.be.false;
            expect(isInsideBoard(BOARD_WIDTH, 0)).to.be.false;
            expect(isInsideBoard(0, BOARD_HEIGHT)).to.be.false;
        });
    });

    describe('isCellEmpty', () => {
        let board;
        beforeEach(() => {
            board = createEmptyBoard();
        });
        it('should return true for empty cells', () => {
            expect(isCellEmpty(board, 0, 0)).to.be.true;
            expect(isCellEmpty(board, BOARD_WIDTH - 1, BOARD_HEIGHT - 1)).to.be.true;
        });
        it('should return false for occupied cells', () => {
            board[0][0] = 1;
            expect(isCellEmpty(board, 0, 0)).to.be.false;
        });
        it('should return false for out-of-bounds coordinates', () => {
            expect(isCellEmpty(board, -1, 0)).to.be.false;
            expect(isCellEmpty(board, 0, -1)).to.be.false;
            expect(isCellEmpty(board, BOARD_WIDTH, 0)).to.be.false;
            expect(isCellEmpty(board, 0, BOARD_HEIGHT)).to.be.false;
        });
    });
});
