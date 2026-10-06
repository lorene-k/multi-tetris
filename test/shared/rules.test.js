import { expect } from 'chai';
import seedrandom from 'seedrandom';
import {
    BOARD_WIDTH, BOARD_HEIGHT, createEmptyBoard,
    canPlacePiece, mergePiece, clearLines, isGameOver,
    movePiece, rotatePiece, hardDrop, softDrop, addPenaltyLines,
    createPiece, getPieceShape,
    createGameState, PENALTY_CELL,
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
            expect(canPlacePiece(full, createPiece({ type: 'I' }))).to.be.false;
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
            expect(movePiece(nopiece, 'left')).to.equal(nopiece);
        });

        it('returns state for an invalid direction', () => {
            expect(movePiece(state, 'invalid')).to.equal(state);
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
            expect(movePiece(s, 'left')).to.equal(s);
        });

        it('does not move piece right if piece would go out of bounds', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: BOARD_WIDTH - 1, y: 0 } } };
            expect(movePiece(s, 'right')).to.equal(s);
        });

        it('does not move piece down if at bottom', () => {
            const s = { ...state, activePiece: { ...activePiece, pos: { x: 4, y: BOARD_HEIGHT - 1 } } };
            expect(movePiece(s, 'down')).to.equal(s);
        });
    });

    describe('rotatePiece', () => {
        let activePiece, state;
        beforeEach(() => {
            activePiece = createPiece({ type: 'T' });
            state = createGameState(activePiece);
        });

        it('rotates piece to the right by default', () => {
            expect(rotatePiece(state).activePiece.rotation).to.equal(1);
        });

        it('rotates piece to the left', () => {
            const s = { ...state, activePiece: { ...activePiece, rotation: 2 } };
            expect(rotatePiece(s, 'left').activePiece.rotation).to.equal(1);
        });

        it('wraps rotation from 3 to 0 when rotating right', () => {
            const s = { ...state, activePiece: { ...activePiece, rotation: 3 } };
            expect(rotatePiece(s, 'right').activePiece.rotation).to.equal(0);
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            expect(rotatePiece(nopiece, 'right')).to.equal(nopiece);
        });

        it('returns same state for invalid direction', () => {
            expect(rotatePiece(state, 'diagonal')).to.equal(state);
        });

        // Wall-kick fallback: the O piece cannot rotate in place with (1, 0) occupied,
        // nor at offset +1 (still blocked) or -1 (out of bounds), so it settles at +2
        it('kicks the piece sideways when it cannot rotate in place', () => {
            const board = createEmptyBoard();
            board[0][1] = 1;
            const blocked = { board, activePiece: createPiece({ type: 'O', pos: { x: 0, y: 0 } }) };
            const result = rotatePiece(blocked, 'right');
            expect(result.activePiece.rotation).to.equal(1);
            expect(result.activePiece.pos).to.deep.equal({ x: 2, y: 0 });
        });
    });

    describe('hardDrop', () => {
        let state;
        beforeEach(() => {
            state = createGameState(createPiece({ type: 'O' }));
        });

        it('hard drops the piece to the lowest possible position', () => {
            const newState = hardDrop(state);
            // The O piece spawns at x = 4 and is a 2x2 block, so it comes to rest on the floor
            expect(newState.board[BOARD_HEIGHT - 2].slice(4, 6)).to.deep.equal(['O', 'O']);
            expect(newState.board[BOARD_HEIGHT - 1].slice(4, 6)).to.deep.equal(['O', 'O']);
        });

        it('sets activePiece to null after drop', () => {
            expect(hardDrop(state).activePiece).to.be.null;
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
            expect(softDrop(s)).to.equal(s);
        });

        it('returns same state if no active piece', () => {
            const nopiece = createGameState(null);
            expect(softDrop(nopiece)).to.equal(nopiece);
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
            newBoard.slice(-2).forEach(row => {
                // Each penalty line is full except for a single hole
                expect(row.filter(cell => cell === 0)).to.have.lengthOf(1);
                expect(row.filter(cell => cell === PENALTY_CELL)).to.have.lengthOf(BOARD_WIDTH - 1);
            });
        });

        it('does not modify the original board', () => {
            const copy = JSON.parse(JSON.stringify(board));
            addPenaltyLines(board, 2, rng);
            expect(board).to.deep.equal(copy);
        });

        it('returns same board when numLines is 0', () => {
            expect(addPenaltyLines(board, 0, rng)).to.equal(board);
        });

        it('shifts existing rows up by numLines', () => {
            board[BOARD_HEIGHT - 1][0] = 'T';
            const newBoard = addPenaltyLines(board, 1, rng);
            expect(newBoard[BOARD_HEIGHT - 2][0]).to.equal('T');
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
            getPieceShape(piece).forEach(([dx, dy]) => {
                expect(newBoard[piece.pos.y + dy][piece.pos.x + dx]).to.equal(piece.type);
            });
        });

        it('does not modify the original board', () => {
            mergePiece(board, piece);
            getPieceShape(piece).forEach(([dx, dy]) => {
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
            expect(clearLines(board).board).to.have.lengthOf(BOARD_HEIGHT);
        });

        it('does not clear a penalty line even when its gap is filled in', () => {
            for (let x = 0; x < BOARD_WIDTH; x++) board[BOARD_HEIGHT - 1][x] = PENALTY_CELL;
            board[BOARD_HEIGHT - 1][0] = 'T'; // player fills the one gap
            const { clearedLines } = clearLines(board);
            expect(clearedLines).to.equal(0);
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
