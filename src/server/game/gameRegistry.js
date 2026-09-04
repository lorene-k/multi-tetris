import debug from 'debug';
import Game from '../classes/Game.js';

const loginfo = debug('tetris:info');

// In-memory store of active games keyed by room name
export const games = {};

export function getOrCreateGame(room) {
    if (!games[room]) {
        games[room] = new Game(room);
        loginfo(`Created game room: ${room}`);
    }
    return games[room];
}

export function cleanupGame(room) {
    const game = games[room];
    if (game && game.isEmpty()) {
        game.stop();
        delete games[room];
        loginfo(`Removed empty game room: ${room}`);
    }
}
