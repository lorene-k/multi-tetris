import { expect } from "chai";
import {
    BOARD_WIDTH, BOARD_HEIGHT, createEmptyBoard,
    canPlacePiece, mergePiece, clearLines, isGameOver,
    movePiece, rotatePiece, hardDrop, softDrop, addPenaltyLines,
    createPiece, getPieceShape, create,
    createGameState
} from "../../src/shared/tetris";

describe('rules.js', () => {
    describe('canPlacePiece', () => {
        let board;
        let piece;
        beforeEach(() => {
            board = createEmptyBoard();
            piece = createPiece({ type: 'O', pos: { x: 0, y: 0 } });
        });
        it('returns true if piece can be placed', () => {
            expect(canPlacePiece(board, piece)).to.be.true;
        });
        it('returns false if piece cannot be placed', () => {
            board[0][0] = 1;
            expect(canPlacePiece(board, piece)).to.be.false;
        });
    });

    describe('movePiece', () => {
        let state;
        let activePiece;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });
        it('returns the same state if there is no active piece', () => {
            const newState = movePiece({ state, activePiece: null }, 'left');
            expect(newState).to.deep.equal({ state, activePiece: null });
        });
        it('returns state for an invalid direction', () => {
            const newState = movePiece(state, 'invalid');
            expect(newState).to.deep.equal(state);
        });

        const directions = {
            left: { dx: -1, dy: 0 },
            right: { dx: 1, dy: 0 },
            down: { dx: 0, dy: 1 },
        };
        Object.entries(directions).forEach(([dir, delta]) => {
            it(`moves piece ${dir} if possible`, () => {
                const newState = movePiece(state, dir);
                expect(newState.activePiece.pos.x).to.equal(state.activePiece.pos.x + delta.dx);
                expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + delta.dy);
            });
            it(`does not move piece ${dir} if blocked`, () => {
                if (dir === 'left') state.activePiece.pos.x = 0;
                if (dir === 'right') state.activePiece.pos.x = BOARD_WIDTH - 1;
                if (dir === 'down') state.activePiece.pos.y = BOARD_HEIGHT - 1;
                const newState = movePiece(state, dir);
                expect(newState.activePiece.pos).to.deep.equal(state.activePiece.pos);
            });
        });
    });

    describe('rotatePiece', () => {
        let activePiece;
        let state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });
        it('rotates piece if possible', () => {
            const newState = rotatePiece(state, 'left');
            expect(newState.shape).to.not.deep.equal(state);
        });
        it('does not rotate piece if blocked', () => {
            state.board[0][4] = 1;
            const newState = rotatePiece(state, 'right');
            expect(newState).to.deep.equal(state);
        });
        it('returns the same state if there is no active piece', () => {
            const newState = rotatePiece({ state, activePiece: null }, 'right');
            expect(newState).to.deep.equal({ state, activePiece: null });
        });
        it('returns the same state for an invalid direction', () => {
            const newState = rotatePiece(state, 'invalid');
            expect(newState).to.deep.equal(state);
        });
        it('rotates piece to the right by default', () => {
            const newState = rotatePiece(state);
            expect(newState.activePiece.rotation).to.equal((state.activePiece.rotation + 1) % 4);
        });
    });

    describe('hardDrop', () => {
        let activePiece;
        let state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });
        it('hard drops the piece to the lowest possible position', () => {
            const { board, activePiece } = state;
            let expectedY = activePiece.pos.y;
            while (canPlacePiece(board, { ...activePiece, pos: { x: activePiece.pos.x, y: expectedY + 1 }, })) {
                expectedY++;
            }
            const newState = hardDrop(state);
            const shape = getPieceShape(activePiece);

            shape.forEach(([dx, dy]) => {
                const x = activePiece.pos.x + dx;
                const y = expectedY + dy;
                expect(newState.board[y][x]).to.equal(activePiece.type);
            });
        });
        it('returns the same state if there is no active piece', () => {
            const newState = hardDrop({ state, activePiece: null });
            expect(newState).to.deep.equal({ state, activePiece: null });
        });
        it('does not modify the original state', () => {
            const stateCopy = JSON.parse(JSON.stringify(state));
            hardDrop(state);
            expect(state).to.deep.equal(stateCopy);
        });
    });

    describe('softDrop', () => {
        let activePiece;
        let state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });
        it('soft drops the piece by one row if possible', () => {
            const newState = softDrop(state);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
        });
        it('does not move the piece if blocked', () => {
            state.activePiece.pos.y = BOARD_HEIGHT - 1;
            const newState = softDrop(state);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y);
        });
        it('returns the same state if there is no active piece', () => {
            const newState = softDrop({ state, activePiece: null });
            expect(newState).to.deep.equal({ state, activePiece: null });
        });
    });

    describe('addPenaltyLines', () => {
        let board;
        let newBoard;
        const penaltyLines = 2;
        beforeEach(() => {
            board = createEmptyBoard();
            newBoard = addPenaltyLines(board, penaltyLines);
        });
        it('adds penalty lines at the bottom and shift the board up', () => {
            expect(newBoard).to.have.lengthOf(BOARD_HEIGHT);
            const bottomRows = newBoard.slice(-penaltyLines);
            bottomRows.forEach(row => {
                const zeros = row.filter(cell => cell === 0).length;
                const ones = row.filter(cell => cell === 1).length;
                expect(zeros).to.equal(1);
                expect(ones).to.equal(BOARD_WIDTH - 1);
            });
            const upperRows = newBoard.slice(0, BOARD_HEIGHT - penaltyLines);
            upperRows.forEach(row =>
                row.forEach(cell => expect(cell).to.equal(0))
            );
        });
        it('does not modify the original board', () => {
            const boardCopy = JSON.parse(JSON.stringify(board));
            addPenaltyLines(board, penaltyLines);
            expect(board).to.deep.equal(boardCopy);
        });
    });

    describe('mergePiece', () => {
        let board;
        let piece;
        let shape;
        let newBoard;
        beforeEach(() => {
            board = createEmptyBoard();
            piece = createPiece({ type: 'O', pos: { x: 0, y: 0 } });
            shape = getPieceShape(piece);
            newBoard = mergePiece(board, piece);
        });
        it('merges piece into the board', () => {
            shape.forEach(([dx, dy]) => {
                expect(newBoard[piece.pos.y + dy][piece.pos.x + dx]).to.equal(piece.type);
            });
        });
        it('does not modify the original board', () => {
            shape.forEach(([dx, dy]) => {
                expect(board[piece.pos.y + dy][piece.pos.x + dx]).to.equal(0);
            });
        });
        it('does not merge piece cells that are out of the board boundaries', () => {
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
        it('clears full lines and return the number of cleared lines', () => {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[BOARD_HEIGHT - 1][x] = 1;
            }
            const result = clearLines(board);
            expect(result.clearedLines).to.equal(1);
            expect(result.board[BOARD_HEIGHT - 1].every(cell => cell === 0)).to.be.true;
        });
        it('does not clear any lines if none are full', () => {
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
        it('returns true if the top row has occupied cells', () => {
            board[0][0] = 1;
            expect(isGameOver(board)).to.be.true;
        });
        it('returns false if the top row is empty', () => {
            expect(isGameOver(board)).to.be.false;
        });
        it('returns true if the board is null or empty', () => {
            const emptyBoard = [];
            const nullBoard = null;
            expect(isGameOver(emptyBoard)).to.be.true;
            expect(isGameOver(nullBoard)).to.be.true;
        });
    });
});
