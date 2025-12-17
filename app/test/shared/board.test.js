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
    })

    describe('canPlacePiece', () => {
        let board;
        let piece;

        beforeEach(() => {
            board = createEmptyBoard();
            piece = {
                shape: PIECES['O'].shape,
                pos: { x: 0, y: 0 },
                type: 1
            };
        });

        it('should return true if piece can be placed', () => {
            expect(canPlacePiece(board, piece)).to.be.true;
        });

        it('should return false if piece cannot be placed', () => {
            board[0][0] = 1;
            expect(canPlacePiece(board, piece)).to.be.false;
        });
    });

    describe('mergePiece', () => {
        let board;
        let piece;
        let newBoard;

        beforeEach(() => {
            board = createEmptyBoard();
            piece = {
                shape: PIECES['O'].shape,
                pos: { x: 0, y: 0 },
                type: 1
            };
            newBoard = mergePiece(board, piece);
        });

        it('should merge piece into the board', () => {
            piece.shape.forEach(([dx, dy]) => {
                expect(newBoard[piece.pos.y + dy][piece.pos.x + dx]).to.equal(piece.type);
            });
        });

        it('should not modify the original board', () => {
            piece.shape.forEach(([dx, dy]) => {
                expect(board[piece.pos.y + dy][piece.pos.x + dx]).to.equal(0);
            });
        });

        it('should not merge piece cells that are out of the board boundaries', () => {
            piece.pos = { x: BOARD_WIDTH - 1, y: BOARD_HEIGHT - 1 };
            const outOfBoundsBoard = mergePiece(board, piece);
            expect(outOfBoundsBoard[BOARD_HEIGHT - 1][BOARD_WIDTH - 1]).to.equal(piece.type);
        });
    });

    describe('clearLines', () => {
        let board;

        beforeEach(() => {
            board = createEmptyBoard();
        });

        it('should clear full lines and return the number of cleared lines', () => {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[BOARD_HEIGHT - 1][x] = 1;
            }
            const result = clearLines(board);
            expect(result.clearedLines).to.equal(1);
            expect(result.board[BOARD_HEIGHT - 1].every(cell => cell === 0)).to.be.true;
        });

        it('should not clear any lines if none are full', () => {
            const result = clearLines(board);
            expect(result.clearedLines).to.equal(0);
            expect(result.board).to.deep.equal(board);
        });
    });

    describe('isGameOver', () => {
        let board;

        beforeEach(() => {
            board = createEmptyBoard();
        });

        it('should return true if the top row has occupied cells', () => {
            board[0][0] = 1;
            expect(isGameOver(board)).to.be.true;
        });

        it('should return false if the top row is empty', () => {
            expect(isGameOver(board)).to.be.false;
        });
    });
});
