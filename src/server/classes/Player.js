import { createGameState, createPiece, computeSpectrum } from '../../shared/tetris/index.js';

/**
 * Player – server-side, OO/prototype-based.
 * Owns one board state and tracks its position in the shared piece queue.
 */
function Player(socket, name, room) {
    this.socket = socket;
    this.name = name;
    this.room = room;
    this.state = createGameState();
    this.alive = false;
    this.pieceIdx = 0; // index into game.pieceQueue
    this.groundedTicks = 0; // ticks the active piece has been unable to fall (lock-delay counter)
}

/**
 * Initialise the player's board at game start.
 * @param {string[]} pieceQueue - shared piece queue from the game
 */
Player.prototype.initState = function (pieceQueue) {
    this.pieceIdx = 0;
    this.groundedTicks = 0;
    const activePieceType = pieceQueue[this.pieceIdx];
    this.pieceIdx++;
    const nextPieces = pieceQueue.slice(this.pieceIdx, this.pieceIdx + 3);

    this.state = {
        ...createGameState(),
        activePiece: createPiece({ type: activePieceType }),
        nextPieces,
    };
    this.alive = true;
};

/**
 * Advance the player's active piece index and build nextPieces from the queue.
 * @param {string[]} pieceQueue
 */
Player.prototype.consumePiece = function (pieceQueue) {
    const nextType = pieceQueue[this.pieceIdx];
    this.pieceIdx++;
    const nextPieces = pieceQueue.slice(this.pieceIdx, this.pieceIdx + 3);
    return { nextType, nextPieces };
};

/**
 * Return a spectrum array (column heights) for this player's board.
 */
Player.prototype.getSpectrum = function () {
    const { board } = this.state;
    if (!board || !board.length) return [];
    return computeSpectrum(board);
};

/**
 * Emit an event to only this player's socket.
 */
Player.prototype.emit = function (event, data) {
    this.socket.emit(event, data);
};

export default Player;
