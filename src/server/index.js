import fs from 'fs';
import debug from 'debug';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { join, extname, dirname } from 'path';
import Game from './classes/Game.js';
import Player from './classes/Player.js';

const mediaTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const clientDist = join(projectRoot, 'src/client/dist');

const logerror = debug('tetris:error');
const loginfo = debug('tetris:info');

// In-memory store of active games keyed by room name
const games = {};

function getOrCreateGame(room) {
    if (!games[room]) {
        games[room] = new Game(room);
        loginfo(`Created game room: ${room}`);
    }
    return games[room];
}

function cleanupGame(room) {
    const game = games[room];
    if (game && game.isEmpty()) {
        game.stop();
        delete games[room];
        loginfo(`Removed empty game room: ${room}`);
    }
}

// ─── HTTP server ──────────────────────────────────────────────────────────

const initApp = (app, params, cb) => {
    const { host, port } = params;

    const handler = (req, res) => {
        // Strip query strings from URL
        const urlPath = req.url.split('?')[0];

        const filePath = urlPath === '/'
            ? join(clientDist, 'index.html')
            : join(clientDist, urlPath);

        const ext = extname(filePath);
        const contentType = mediaTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                // SPA fallback: serve index.html for unknown paths so React Router works
                fs.readFile(join(clientDist, 'index.html'), (err2, fallback) => {
                    if (err2) {
                        logerror(err);
                        res.writeHead(500);
                        return res.end('Not found');
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(fallback);
                });
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    };

    app.on('request', handler);

    app.listen({ host, port }, () => {
        loginfo(`tetris listen on ${params.url}`);
        cb();
    });
};

// ─── Socket.IO handlers ────────────────────────────────────────────────────

const initEngine = (io) => {
    io.on('connection', (socket) => {
        loginfo('Socket connected: ' + socket.id);

        let currentPlayer = null;
        let currentGame = null;

        // ── Backward-compat ping/pong ──
        socket.on('action', (action) => {
            if (action && action.type === 'server/ping') {
                socket.emit('action', { type: 'pong' });
            }
        });

        // ── Join a game room ──
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
                socket.emit('error', { message: 'Name already taken in this room.' });
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

        // ── Host starts the game ──
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

        // ── Host restarts the game ──
        socket.on('restart_game', () => {
            if (!currentGame || !currentPlayer) return;
            if (currentPlayer !== currentGame.host) {
                socket.emit('error', { message: 'Only the host can restart.' });
                return;
            }
            currentGame.reset(io);
            loginfo(`Game restarted in room ${currentGame.room}`);
        });

        // ── Player input ──
        socket.on('player_input', ({ input }) => {
            if (!currentGame || !currentPlayer) return;
            if (!currentGame.started) return;
            currentGame.handleInput(currentPlayer, input);
        });

        // ── Disconnect ──
        socket.on('disconnect', () => {
            loginfo('Socket disconnected: ' + socket.id);
            if (!currentGame || !currentPlayer) return;

            const wasStarted = currentGame.started;
            currentGame.removePlayer(socket.id);

            // Tell others
            io.to(currentGame.room).emit('player_left', {
                playerName: currentPlayer.name,
                players: currentGame.players.map(p => ({ name: p.name, isHost: p === currentGame.host })),
            });

            // If someone disconnects during a game, check if it ends
            if (wasStarted) {
                // Mark player as dead
                currentPlayer.alive = false;
                currentGame._checkEnd && currentGame._checkEnd();
            }

            cleanupGame(currentGame.room);
            currentPlayer = null;
            currentGame = null;
        });
    });
};

// ─── Public API ────────────────────────────────────────────────────────────

export async function create(params) {
    return new Promise((resolve, reject) => {
        const app = createServer();
        initApp(app, params, () => {
            const io = new Server(app, {
                cors: { origin: '*' },
            });
            const stop = (cb) => {
                io.close();
                app.close(() => { app.unref(); });
                loginfo('Engine stopped.');
                if (cb) cb();
            };
            initEngine(io);
            resolve({ stop });
        });
    });
}

// Expose games map for testing
export { games };
