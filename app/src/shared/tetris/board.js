import { BOARD_WIDTH, BOARD_HEIGHT } from './index.js';

export function createEmptyBoard() {
    return Array.from({ length: BOARD_HEIGHT }, () =>
        Array.from({ length: BOARD_WIDTH }, () => 0)
    );
}

export function isInsideBoard(x, y) {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

export function isCellEmpty(board, x, y) {
    return isInsideBoard(x, y) && board[y][x] === 0;
}
