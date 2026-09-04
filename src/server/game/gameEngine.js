import debug from 'debug';
import Player from '../classes/Player.js';
import { games, getOrCreateGame, cleanupGame } from './gameRegistry.js';

const loginfo = debug('tetris:info');

export const initEngine = (io) => {
    io.on('connection', (socket) => {
        loginfo('Socket connected: ' + socket.id);

        let currentPlayer = null;
        let currentGame = null;

        // Backward-compat ping/pong 
        socket.on('action', (action) => {
            if (action && action.type === 'server/ping') {
                socket.emit('action', { type: 'pong' });
            }
        });

        // Read-only pre-check for the Home screen 
        // Reports whether room+playerName would be joinable, without creating
        // a room or adding a player as a side effect.
        socket.on('check_join', ({ room, playerName }, callback) => {
            if (typeof callback !== 'function') return;

            if (!room || !playerName) {
                callback({ ok: false, message: 'Please enter a username and room name to play.' });
                return;
            }

            const game = games[room];
            if (game) {
                if (game.started) {
                    callback({ ok: false, message: 'Game already in progress in this room. Wait for the next round.' });
                    return;
                }
                if (game.players.some(p => p.name === playerName)) {
                    callback({ ok: false, message: 'That username is already taken in this room.' });
                    return;
                }
            }

            callback({ ok: true });
        });

        // Join a game room 
        socket.on('join_game', ({ room, playerName }) => {
            if (!room || !playerName) {
                socket.emit('error', { message: 'room and playerName are required' });
                return;
            }

            const game = getOrCreateGame(room);

            if (game.started) {
                socket.emit('error', { message: 'Game already in progress. Wait for the next round.' });
                return;
            }

            // Prevent duplicate names in the same room
            if (game.players.some(p => p.name === playerName)) {
                socket.emit('error', { message: 'Username is already taken in this room.' });
                return;
            }

            const player = new Player(socket, playerName, room);
            game.addPlayer(player);
            currentPlayer = player;
            currentGame = game;

            socket.join(room);

            // Tell the joining player their lobby state
            socket.emit('game_state', {
                players: game.players.map(p => ({ name: p.name, isHost: p === game.host })),
                isHost: player === game.host,
                started: game.started,
                room,
                playerName,
            });

            // Tell everyone else a new player joined
            socket.to(room).emit('player_joined', {
                playerName,
                isHost: false,
                players: game.players.map(p => ({ name: p.name, isHost: p === game.host })),
            });

            loginfo(`${playerName} joined room ${room}`);
        });

        // Host starts the game 
        socket.on('start_game', () => {
            if (!currentGame || !currentPlayer) return;
            if (currentPlayer !== currentGame.host) {
                socket.emit('error', { message: 'Only the host can start the game.' });
                return;
            }
            if (currentGame.started) {
                socket.emit('error', { message: 'Game already started.' });
                return;
            }

            currentGame.start(io);
            loginfo(`Game started in room ${currentGame.room}`);
        });

        // Host restarts the game 
        socket.on('restart_game', () => {
            if (!currentGame || !currentPlayer) return;
            if (currentPlayer !== currentGame.host) {
                socket.emit('error', { message: 'Only the host can restart.' });
                return;
            }
            currentGame.reset(io);
            loginfo(`Game restarted in room ${currentGame.room}`);
        });

        // Player input 
        socket.on('player_input', ({ input }) => {
            if (!currentGame || !currentPlayer) return;
            if (!currentGame.started) return;
            currentGame.handleInput(currentPlayer, input);
        });

        // Disconnect 
        socket.on('disconnect', () => {
            loginfo('Socket disconnected: ' + socket.id);
            if (!currentGame || !currentPlayer) return;

            const wasStarted = currentGame.started;
            currentGame.removePlayer(socket.id);

            // Emit player left
            io.to(currentGame.room).emit('player_left', {
                playerName: currentPlayer.name,
                players: currentGame.players.map(p => ({ name: p.name, isHost: p === currentGame.host })),
            });

            // Check if game ends when user disconnects during game
            if (wasStarted) {
                currentPlayer.alive = false;
                currentGame._checkEnd && currentGame._checkEnd();
            }

            cleanupGame(currentGame.room);
            currentPlayer = null;
            currentGame = null;
        });
    });
};
