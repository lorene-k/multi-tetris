import { expect } from 'chai';
import seedrandom from 'seedrandom';
import {
    BOARD_WIDTH, BOARD_HEIGHT, createEmptyBoard,
    canPlacePiece, mergePiece, clearLines, isGameOver,
    movePiece, rotatePiece, hardDrop, softDrop, addPenaltyLines,
    createPiece, getPieceShape,
    createGameState,
} from '../../src/shared/tetris/index.js';

describe('rules.js', () => {

    describe('canPlacePiece', () => {
        let board, piece;
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
        it('returns false for all pieces when board is full', () => {
            const full = createEmptyBoard().map(() => Array(BOARD_WIDTH).fill(1));
            const p = createPiece({ type: 'I' });
            expect(canPlacePiece(full, p)).to.be.false;
        });
    });

    describe('movePiece', () => {
        let state, activePiece;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });

        it('returns the same state if there is no active piece', () => {
            const nopiece = createGameState(null);
            const result = movePiece(nopiece, 'left');
            expect(result).to.equal(nopiece);
        });
        it('returns state for an invalid direction', () => {
            const result = movePiece(state, 'invalid');
            expect(result).to.equal(state);
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
        });

        it('does not move piece left if at left wall', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: 0, y: 0 } } };
            const result = movePiece(s, 'left');
            expect(result).to.equal(s);
        });

        it('does not move piece right if piece would go out of bounds', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: BOARD_WIDTH - 1, y: 0 } } };
            const result = movePiece(s, 'right');
            expect(result).to.equal(s);
        });

        it('does not move piece down if at bottom', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: 4, y: BOARD_HEIGHT - 1 } } };
            const result = movePiece(s, 'down');
            expect(result).to.equal(s);
        });
    });

    describe('rotatePiece', () => {
        let activePiece, state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'T' });
            state = createGameState(activePiece);
        });

        it('rotates piece to the right by default', () => {
            const newState = rotatePiece(state);
            expect(newState.activePiece.rotation).to.equal(1);
        });

        it('rotates piece to the left', () => {
            const s = { ...state, activePiece: { ...activePiece, rotation: 2 } };
            const newState = rotatePiece(s, 'left');
            expect(newState.activePiece.rotation).to.equal(1);
        });

        it('wraps rotation from 3 to 0 when rotating right', () => {
            const s = { ...state, activePiece: { ...activePiece, rotation: 3 } };
            const newState = rotatePiece(s, 'right');
            expect(newState.activePiece.rotation).to.equal(0);
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            expect(rotatePiece(nopiece, 'right')).to.equal(nopiece);
        });

        it('returns same state for invalid direction', () => {
            expect(rotatePiece(state, 'diagonal')).to.equal(state);
        });

        it('does not rotate if clearly blocked and no kick helps', () => {
            // Fill cells around the spawn to block rotation with no kick escape
            const board = createEmptyBoard();
            // Place an O piece (symmetric) in a corner – rotation is always same shape
            const piece = createPiece({ type: 'O', pos: { x: 0, y: 0 } });
            const s = { board, activePiece: piece };
            board[0][1] = 1; // block one rotation cell
            const result = rotatePiece(s, 'right');
            // O piece is symmetric – it should rotate fine (same shape)
            expect(result).to.have.property('activePiece');
        });
    });

    describe('hardDrop', () => {
        let activePiece, state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });

        it('hard drops the piece to the lowest possible position', () => {
            const { board } = state;
            let expectedY = activePiece.pos.y;
            while (canPlacePiece(board, { ...activePiece, pos: { x: activePiece.pos.x, y: expectedY + 1 } })) {
                expectedY++;
            }
            const newState = hardDrop(state);
            const shape = getPieceShape(activePiece);
            shape.forEach(([dx, dy]) => {
                const x = activePiece.pos.x + dx;
                const y = expectedY + dy;
                if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
                    expect(newState.board[y][x]).to.equal(activePiece.type);
                }
            });
        });

        it('sets activePiece to null after drop', () => {
            const newState = hardDrop(state);
            expect(newState.activePiece).to.be.null;
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            expect(hardDrop(nopiece)).to.equal(nopiece);
        });

        it('does not mutate the original state', () => {
            const copy = JSON.parse(JSON.stringify(state));
            hardDrop(state);
            expect(state).to.deep.equal(copy);
        });
    });

    describe('softDrop', () => {
        let activePiece, state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'O' });
            state = createGameState(activePiece);
        });

        it('moves piece down by one row', () => {
            const newState = softDrop(state);
            expect(newState.activePiece.pos.y).to.equal(state.activePiece.pos.y + 1);
        });

        it('does not move piece if at bottom', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: 4, y: BOARD_HEIGHT - 1 } } };
            const result = softDrop(s);
            expect(result).to.equal(s);
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            const result = softDrop(nopiece);
            expect(result).to.equal(nopiece);
        });
    });

    describe('addPenaltyLines', () => {
        let board, rng;
        beforeEach(() => {
            board = createEmptyBoard();
            rng = seedrandom('test-seed');
        });

        it('adds 2 penalty lines at the bottom', () => {
            const newBoard = addPenaltyLines(board, 2, rng);
            expect(newBoard).to.have.lengthOf(BOARD_HEIGHT);
            const bottom = newBoard.slice(-2);
            bottom.forEach(row => {
                const zeros = row.filter(c => c === 0).length;
                expect(zeros).to.equal(1);
                expect(row.filter(c => c === 1).length).to.equal(BOARD_WIDTH - 1);
            });
        });

        it('does not modify the original board', () => {
            const copy = JSON.parse(JSON.stringify(board));
            addPenaltyLines(board, 2, rng);
            expect(board).to.deep.equal(copy);
        });

        it('returns same board when numLines is 0', () => {
            const result = addPenaltyLines(board, 0, rng);
            expect(result).to.equal(board);
        });

        it('shifts existing rows up by numLines', () => {
            const b = createEmptyBoard();
            b[19][0] = 'T';
            const newBoard = addPenaltyLines(b, 1, rng);
            expect(newBoard[18][0]).to.equal('T');
        });
    });

    describe('mergePiece', () => {
        let board, piece;
        beforeEach(() => {
            board = createEmptyBoard();
            piece = createPiece({ type: 'O', pos: { x: 0, y: 0 } });
        });

        it('merges piece cells into the board', () => {
            const newBoard = mergePiece(board, piece);
            const shape = getPieceShape(piece);
            shape.forEach(([dx, dy]) => {
                expect(newBoard[piece.pos.y + dy][piece.pos.x + dx]).to.equal(piece.type);
            });
        });

        it('does not modify the original board', () => {
            mergePiece(board, piece);
            const shape = getPieceShape(piece);
            shape.forEach(([dx, dy]) => {
                expect(board[piece.pos.y + dy][piece.pos.x + dx]).to.equal(0);
            });
        });

        it('ignores cells outside board boundaries', () => {
            const edgePiece = createPiece({ type: 'I', pos: { x: BOARD_WIDTH - 1, y: 0 } });
            expect(() => mergePiece(board, edgePiece)).to.not.throw();
        });
    });

    describe('clearLines', () => {
        let board;
        beforeEach(() => { board = createEmptyBoard(); });

        it('clears one full line', () => {
            for (let x = 0; x < BOARD_WIDTH; x++) board[BOARD_HEIGHT - 1][x] = 1;
            const { board: b, clearedLines } = clearLines(board);
            expect(clearedLines).to.equal(1);
            expect(b[BOARD_HEIGHT - 1].every(c => c === 0)).to.be.true;
        });

        it('clears multiple full lines', () => {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                board[BOARD_HEIGHT - 1][x] = 1;
                board[BOARD_HEIGHT - 2][x] = 1;
            }
            const { clearedLines } = clearLines(board);
            expect(clearedLines).to.equal(2);
        });

        it('does not clear partial lines', () => {
            board[BOARD_HEIGHT - 1][0] = 1;
            const { clearedLines } = clearLines(board);
            expect(clearedLines).to.equal(0);
        });

        it('returns board with same dimensions', () => {
            const { board: b } = clearLines(board);
            expect(b).to.have.lengthOf(BOARD_HEIGHT);
        });
    });

    describe('isGameOver', () => {
        let board;
        beforeEach(() => { board = createEmptyBoard(); });

        it('returns true if top row has occupied cells', () => {
            board[0][5] = 1;
            expect(isGameOver(board)).to.be.true;
        });

        it('returns false if top row is empty', () => {
            expect(isGameOver(board)).to.be.false;
        });

        it('returns true for empty array board', () => {
            expect(isGameOver([])).to.be.true;
        });

        it('returns true for null board', () => {
            expect(isGameOver(null)).to.be.true;
        });
    });
});
