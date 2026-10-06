import { expect } from 'chai';
import sinon from 'sinon';
import Game from '../../src/server/classes/Game.js';
import Player from '../../src/server/classes/Player.js';
import { TICK_RATE_MS, BOARD_HEIGHT } from '../../src/shared/tetris/index.js';

// ── Helpers ────────────────────────────────────────────────────────────────

// Game and Player only ever use `socket.id` and `socket.emit`,
// so a recording object is enough to stand in for a real socket.
function makePlayer(socketId, name) {
    const socket = {
        id: socketId,
        msgs: [],
        emit(event, data) { this.msgs.push({ event, data }); },
    };
    return new Player(socket, name, 'testRoom');
}

// Game only uses `io.to(room).emit(...)`, to announce game_over
function makeIo() {
    const emitted = [];
    return {
        emitted,
        to() {
            return {
                emit(event, data) { emitted.push({ event, data }); },
            };
        },
    };
}

// Adds one player per name, starts the game, then drops the start-up
// messages so each test only sees what it triggers itself.
function startGameWith(game, io, names) {
    const players = names.map((name, index) => makePlayer(`s${index + 1}`, name));
    players.forEach(player => game.addPlayer(player));
    game.start(io);
    players.forEach(player => { player.socket.msgs.length = 0; });
    return players;
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Game', () => {
    let game, io;

    beforeEach(() => {
        game = new Game('testRoom');
        io = makeIo();
    });

    afterEach(() => { game.stop(); });

    it('creates a game with correct room name', () => {
        expect(game.room).to.equal('testRoom');
        expect(game.started).to.be.false;
        expect(game.players).to.deep.equal([]);
        expect(game.host).to.be.null;
    });

    // ── addPlayer / removePlayer ──────────────────────────────────────────

    describe('addPlayer', () => {
        it('adds a player and sets them as host if first', () => {
            const player = makePlayer('s1', 'Alice');
            game.addPlayer(player);
            expect(game.players).to.include(player);
            expect(game.host).to.equal(player);
        });

        it('second player is not host', () => {
            const p1 = makePlayer('s1', 'Alice');
            game.addPlayer(p1);
            game.addPlayer(makePlayer('s2', 'Bob'));
            expect(game.host).to.equal(p1);
            expect(game.players).to.have.lengthOf(2);
        });
    });

    describe('removePlayer', () => {
        it('removes a player by socket id', () => {
            game.addPlayer(makePlayer('s1', 'Alice'));
            game.removePlayer('s1');
            expect(game.players).to.have.lengthOf(0);
        });

        it('assigns a new host when host leaves', () => {
            const p2 = makePlayer('s2', 'Bob');
            game.addPlayer(makePlayer('s1', 'Alice'));
            game.addPlayer(p2);
            game.removePlayer('s1');
            expect(game.host).to.equal(p2);
        });

        it('sets host to null when last player leaves', () => {
            game.addPlayer(makePlayer('s1', 'Alice'));
            game.removePlayer('s1');
            expect(game.host).to.be.null;
        });
    });

    describe('isEmpty', () => {
        it('returns true when no players', () => {
            expect(game.isEmpty()).to.be.true;
        });

        it('returns false when there are players', () => {
            game.addPlayer(makePlayer('s1', 'Alice'));
            expect(game.isEmpty()).to.be.false;
        });
    });

    // ── Queue ──────────────────────────────────────────────────────────────

    describe('ensureQueue', () => {
        it('fills queue to at least QUEUE_MIN_AHEAD elements', () => {
            game.rng = () => 0.5;
            game.ensureQueue(0);
            expect(game.pieceQueue.length).to.be.greaterThanOrEqual(20);
        });

        it('adds more pieces when upTo exceeds current length', () => {
            game.rng = () => 0.1;
            game.ensureQueue(100);
            expect(game.pieceQueue.length).to.be.greaterThanOrEqual(100);
        });
    });

    // ── start / stop ───────────────────────────────────────────────────────

    describe('start / stop', () => {
        let clock, p1;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            p1 = makePlayer('s1', 'Alice');
            game.addPlayer(p1);
            game.start(io);
        });

        afterEach(() => {
            game.stop();
            clock.restore();
        });

        it('starts the game and sets started = true', () => {
            expect(game.started).to.be.true;
        });

        it('initialises all player states', () => {
            expect(p1.alive).to.be.true;
            expect(p1.state.activePiece).to.not.be.null;
        });

        it('emits game_started to each player', () => {
            expect(p1.socket.msgs.find(m => m.event === 'game_started')).to.exist;
        });

        it('emits state_update to each player', () => {
            const msg = p1.socket.msgs.find(m => m.event === 'state_update');
            expect(msg).to.exist;
            expect(msg.data).to.have.property('board');
        });

        it('stop() clears the interval and sets started = false', () => {
            game.stop();
            expect(game.started).to.be.false;
            expect(game.interval).to.be.null;
        });

        it('advances game state on tick', () => {
            const initialY = p1.state.activePiece.pos.y;
            clock.tick(TICK_RATE_MS);
            expect(p1.state.activePiece.pos.y).to.be.greaterThan(initialY);
        });
    });

    // ── handleInput ────────────────────────────────────────────────────────

    describe('handleInput', () => {
        let p1;

        beforeEach(() => {
            [p1] = startGameWith(game, io, ['Alice']);
        });

        it('moves piece left on left input', () => {
            const xBefore = p1.state.activePiece.pos.x;
            game.handleInput(p1, 'left');
            expect(p1.state.activePiece.pos.x).to.equal(xBefore - 1);
        });

        it('moves piece right on right input', () => {
            const xBefore = p1.state.activePiece.pos.x;
            game.handleInput(p1, 'right');
            expect(p1.state.activePiece.pos.x).to.equal(xBefore + 1);
        });

        it('rotates piece on rotate input', () => {
            // Move the piece down so it has room to rotate away from the top wall
            game.handleInput(p1, 'softDrop');
            game.handleInput(p1, 'softDrop');
            game.handleInput(p1, 'softDrop');
            const rotationBefore = p1.state.activePiece.rotation;
            game.handleInput(p1, 'rotate');
            expect(p1.state.activePiece.rotation).to.equal((rotationBefore + 1) % 4);
        });

        it('emits state_update after input', () => {
            game.handleInput(p1, 'left');
            expect(p1.socket.msgs.find(m => m.event === 'state_update')).to.exist;
        });

        it('handles hardDrop: locks the piece and spawns the next one', () => {
            const pieceIdxBefore = p1.pieceIdx;
            game.handleInput(p1, 'hardDrop');
            expect(p1.state.activePiece).to.not.be.null;
            expect(p1.pieceIdx).to.equal(pieceIdxBefore + 1);
            expect(p1.state.board[BOARD_HEIGHT - 1].some(cell => cell !== 0)).to.be.true;
        });

        it('does nothing when player is not alive', () => {
            p1.alive = false;
            const stateBefore = p1.state;
            game.handleInput(p1, 'left');
            expect(p1.state).to.equal(stateBefore);
        });
    });

    // ── Penalty lines ──────────────────────────────────────────────────────

    describe('_penalise', () => {
        let p1, p2;

        beforeEach(() => {
            [p1, p2] = startGameWith(game, io, ['Alice', 'Bob']);
        });

        it('sends penalty lines to opponents when >= 2 lines cleared', () => {
            const boardBefore = p2.state.board.map(row => [...row]);
            game._penalise(p1, 2); // 1 penalty line for p2
            expect(p2.state.board).to.not.deep.equal(boardBefore);
            expect(p2.socket.msgs.find(m => m.event === 'state_update')).to.exist;
        });

        it('sends no penalty for exactly 1 line cleared', () => {
            const boardBefore = p2.state.board.map(row => [...row]);
            game._penalise(p1, 1);
            expect(p2.state.board).to.deep.equal(boardBefore);
        });
    });

    // ── _checkEnd ─────────────────────────────────────────────────────────

    describe('_checkEnd', () => {
        let p1, p2;

        beforeEach(() => {
            [p1, p2] = startGameWith(game, io, ['Alice', 'Bob']);
        });

        it('ends the game when only one player is alive', () => {
            p1.alive = false;
            game._checkEnd();
            expect(game.started).to.be.false;
            const msg = io.emitted.find(m => m.event === 'game_over');
            expect(msg).to.exist;
            expect(msg.data.winner).to.equal('Bob');
        });

        it('does not end game while 2+ players alive', () => {
            game._checkEnd();
            expect(game.started).to.be.true;
        });

        it('emits game_over with null winner when everyone dies', () => {
            p1.alive = false;
            p2.alive = false;
            game._checkEnd();
            expect(io.emitted.find(m => m.event === 'game_over').data.winner).to.be.null;
        });
    });

    // ── Spectrum ──────────────────────────────────────────────────────────

    describe('broadcastSpectrums', () => {
        let p1, p2;

        beforeEach(() => {
            [p1, p2] = startGameWith(game, io, ['Alice', 'Bob']);
            game.broadcastSpectrums();
        });

        it('emits opponents_update to each player', () => {
            expect(p1.socket.msgs.find(m => m.event === 'opponents_update')).to.exist;
            expect(p2.socket.msgs.find(m => m.event === 'opponents_update')).to.exist;
        });

        it('each player does not see themselves in opponents', () => {
            const msg = p1.socket.msgs.find(m => m.event === 'opponents_update');
            expect(msg.data.map(opponent => opponent.name)).to.not.include('Alice');
        });
    });
});
