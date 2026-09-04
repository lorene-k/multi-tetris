import seedrandom from 'seedrandom';
import {
    createPiece, createGameState,
    softDrop, mergePiece, clearLines, addPenaltyLines,
    isGameOver, TICK_RATE_MS,
    generateBag,
} from '../../shared/tetris/index.js';
import { applyInput } from '../game/gameLoop.js';

const QUEUE_MIN_AHEAD = 20;

/**
 * Game – manages one room.
 * Prototype-based OO (server-side only; no `this` restriction here).
 */
function Game(room) {
    this.room = room;
    this.players = [];
    this.host = null;
    this.started = false;
    this.interval = null;
    this.pieceQueue = [];
    this.rng = null;
    this.io = null;
}

// ── Queue ──────────────────────────────────────────────────────────────────

Game.prototype.ensureQueue = function (upTo) {
    const target = Math.max((upTo || 0) + QUEUE_MIN_AHEAD, QUEUE_MIN_AHEAD);
    while (this.pieceQueue.length < target) {
        this.pieceQueue.push(...generateBag(this.rng));
    }
};

// ── Player management ──────────────────────────────────────────────────────

Game.prototype.addPlayer = function (player) {
    if (!this.host) this.host = player;
    this.players.push(player);
};

Game.prototype.removePlayer = function (socketId) {
    this.players = this.players.filter(p => p.socket.id !== socketId);
    if (this.host && this.host.socket.id === socketId) {
        this.host = this.players.length > 0 ? this.players[0] : null;
    }
};

Game.prototype.getPlayer = function (socketId) {
    return this.players.find(p => p.socket.id === socketId) || null;
};

Game.prototype.isEmpty = function () {
    return this.players.length === 0;
};

// ── Lifecycle ──────────────────────────────────────────────────────────────

Game.prototype.start = function (io) {
    this.io = io;
    this.started = true;
    this.rng = new seedrandom(Date.now().toString());
    this.pieceQueue = [];
    this.ensureQueue(this.players.length * 15);

    for (const player of this.players) {
        player.initState(this.pieceQueue);
    }

    for (const player of this.players) {
        player.emit('game_started', {
            players: this.players.map(p => ({ name: p.name, isHost: p === this.host })),
        });
        player.emit('state_update', sanitise(player.state));
    }

    this.broadcastSpectrums();
    this.interval = setInterval(() => this.tick(), TICK_RATE_MS);
};

Game.prototype.stop = function () {
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
    }
    this.started = false;
};

Game.prototype.reset = function (io) {
    this.stop();
    this.start(io);
};

// ── Tick ───────────────────────────────────────────────────────────────────

Game.prototype.tick = function () {
    let anyAlive = false;

    for (const player of this.players) {
        if (!player.alive || !player.state.activePiece) continue;
        anyAlive = true;

        const result = this._gravity(player);
        if (result !== null) {
            player.emit('state_update', sanitise(player.state, result.clearedLines));
            if (result.clearedLines > 0) this._penalise(player, result.clearedLines);
            if (player.state.gameOver) this._checkEnd();
        }
    }

    if (anyAlive) this.broadcastSpectrums();
};

// ── Input ──────────────────────────────────────────────────────────────────

Game.prototype.handleInput = function (player, input) {
    if (!player.alive || !player.state.activePiece) return;

    const newState = applyInput(player.state, input);
    if (newState === player.state) return;

    let emitLines = 0;

    if (newState.activePiece === null) {
        // Hard drop: piece merged, clear lines, spawn next
        const { board: clearedBoard, clearedLines } = clearLines(newState.board);
        emitLines = clearedLines;

        if (isGameOver(clearedBoard)) {
            player.alive = false;
            player.state = { ...newState, board: clearedBoard, gameOver: true };
            player.emit('state_update', sanitise(player.state, clearedLines));
            if (clearedLines > 0) this._penalise(player, clearedLines);
            this._checkEnd();
            this.broadcastSpectrums();
            return;
        }

        this.ensureQueue(player.pieceIdx + 10);
        const { nextType, nextPieces } = player.consumePiece(this.pieceQueue);
        player.state = {
            ...newState,
            board: clearedBoard,
            activePiece: createPiece({ type: nextType }),
            nextPieces,
        };
        if (clearedLines > 0) this._penalise(player, clearedLines);
    } else {
        player.state = newState;
    }

    player.emit('state_update', sanitise(player.state, emitLines));
    this.broadcastSpectrums();
};

// ── Gravity (lock piece when it can't fall) ────────────────────────────────

Game.prototype._gravity = function (player) {
    const dropped = softDrop(player.state);
    if (dropped !== player.state) {
        player.state = dropped;
        return { clearedLines: 0 };
    }
    return this._lock(player);
};

Game.prototype._lock = function (player) {
    const merged = mergePiece(player.state.board, player.state.activePiece);
    const { board: clearedBoard, clearedLines } = clearLines(merged);

    if (isGameOver(clearedBoard)) {
        player.alive = false;
        player.state = { ...player.state, board: clearedBoard, gameOver: true, activePiece: null };
        return { clearedLines };
    }

    this.ensureQueue(player.pieceIdx + 10);
    const { nextType, nextPieces } = player.consumePiece(this.pieceQueue);

    player.state = {
        ...player.state,
        board: clearedBoard,
        activePiece: createPiece({ type: nextType }),
        nextPieces,
    };

    return { clearedLines };
};

// ── Penalty lines ──────────────────────────────────────────────────────────

Game.prototype._penalise = function (source, clearedLines) {
    const count = clearedLines - 1;
    if (count <= 0) return;
    for (const opp of this.players) {
        if (opp === source || !opp.alive) continue;
        opp.state = { ...opp.state, board: addPenaltyLines(opp.state.board, count) };
        opp.emit('state_update', sanitise(opp.state));
    }
};

// ── End detection ──────────────────────────────────────────────────────────

Game.prototype._checkEnd = function () {
    const alive = this.players.filter(p => p.alive);
    // Multi-player: game ends when ≤1 alive
    // Solo: game ends when player is dead
    if (this.players.length > 1 && alive.length > 1) return;
    if (this.players.length === 1 && alive.length === 1) return;

    this.stop();
    const winner = alive.length === 1 ? alive[0].name : null;
    if (this.io) this.io.to(this.room).emit('game_over', { winner });
};

// ── Spectrums ──────────────────────────────────────────────────────────────

Game.prototype.broadcastSpectrums = function () {
    if (!this.io) return;
    const all = this.players.map(p => ({ name: p.name, spectrum: p.getSpectrum(), alive: p.alive }));
    for (const player of this.players) {
        player.emit('opponents_update', all.filter(s => s.name !== player.name));
    }
};

// ── Private helper ─────────────────────────────────────────────────────────

function sanitise(state, linesCleared = 0) {
    const { board, activePiece, nextPieces, gameOver } = state;
    return { board, activePiece, nextPieces, gameOver, linesCleared };
}

export default Game;
