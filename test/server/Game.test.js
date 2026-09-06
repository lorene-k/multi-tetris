import { expect } from 'chai';
import sinon from 'sinon';
import Game from '../../src/server/classes/Game.js';
import Player from '../../src/server/classes/Player.js';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../src/shared/tetris/index.js';

// ── Helpers ────────────────────────────────────────────────────────────────

const makeMockIo = () => {
    const emitted = [];
    return {
        emitted,
        to(room) {
            return {
                emit(event, data) { emitted.push({ room, event, data }); },
            };
        },
    };
};

const makeMockSocket = (id = 'sock') => {
    const msgs = [];
    return {
        id,
        msgs,
        emit(event, data) { msgs.push({ event, data }); },
        join() {},
    };
};

const makePlayer = (id = 'p1', name = 'Alice', room = 'test') =>
    new Player(makeMockSocket(id), name, room);

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Game', () => {

    let game;
    beforeEach(() => {
        game = new Game('testRoom');
    });

    it('creates a game with correct room name', () => {
        expect(game.room).to.equal('testRoom');
        expect(game.started).to.be.false;
        expect(game.players).to.deep.equal([]);
        expect(game.host).to.be.null;
    });

    // ── addPlayer / removePlayer ──────────────────────────────────────────

    describe('addPlayer', () => {
        it('adds a player and sets them as host if first', () => {
            const p = makePlayer();
            game.addPlayer(p);
            expect(game.players).to.include(p);
            expect(game.host).to.equal(p);
        });

        it('second player is not host', () => {
            const p1 = makePlayer('s1', 'A');
            const p2 = makePlayer('s2', 'B');
            game.addPlayer(p1);
            game.addPlayer(p2);
            expect(game.host).to.equal(p1);
            expect(game.players).to.have.lengthOf(2);
        });
    });

    describe('removePlayer', () => {
        it('removes a player by socket id', () => {
            const p = makePlayer('s1');
            game.addPlayer(p);
            game.removePlayer('s1');
            expect(game.players).to.have.lengthOf(0);
        });

        it('assigns a new host when host leaves', () => {
            const p1 = makePlayer('s1', 'A');
            const p2 = makePlayer('s2', 'B');
            game.addPlayer(p1);
            game.addPlayer(p2);
            game.removePlayer('s1');
            expect(game.host).to.equal(p2);
        });

        it('sets host to null when last player leaves', () => {
            const p = makePlayer('s1');
            game.addPlayer(p);
            game.removePlayer('s1');
            expect(game.host).to.be.null;
        });
    });

    describe('isEmpty', () => {
        it('returns true when no players', () => {
            expect(game.isEmpty()).to.be.true;
        });
        it('returns false when there are players', () => {
            game.addPlayer(makePlayer());
            expect(game.isEmpty()).to.be.false;
        });
    });

    // ── Queue ──────────────────────────────────────────────────────────────

    describe('ensureQueue', () => {
        it('fills queue to at least QUEUE_MIN_AHEAD elements', () => {
            const rng = { calls: 0, fn: () => 0.5 };
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
        let clock, io, p1;

        beforeEach(() => {
            clock = sinon.useFakeTimers();
            io = makeMockIo();
            p1 = makePlayer('s1', 'Alice');
            game.addPlayer(p1);
        });

        afterEach(() => {
            game.stop();
            clock.restore();
        });

        it('starts the game and sets started = true', () => {
            game.start(io);
            expect(game.started).to.be.true;
        });

        it('initialises all player states', () => {
            game.start(io);
            expect(p1.alive).to.be.true;
            expect(p1.state.activePiece).to.not.be.null;
        });

        it('emits game_started to each player', () => {
            game.start(io);
            const msg = p1.socket.msgs.find(m => m.event === 'game_started');
            expect(msg).to.exist;
        });

        it('emits state_update to each player', () => {
            game.start(io);
            const msg = p1.socket.msgs.find(m => m.event === 'state_update');
            expect(msg).to.exist;
            expect(msg.data).to.have.property('board');
        });

        it('stop() clears the interval and sets started = false', () => {
            game.start(io);
            game.stop();
            expect(game.started).to.be.false;
            expect(game.interval).to.be.null;
        });

        it('advances game state on tick', () => {
            game.start(io);
            const initialY = p1.state.activePiece.pos.y;
            clock.tick(500); // one tick
            expect(p1.state.activePiece.pos.y).to.be.greaterThan(initialY);
        });
    });

    // ── handleInput ────────────────────────────────────────────────────────

    describe('handleInput', () => {
        let io, p1;

        beforeEach(() => {
            io = makeMockIo();
            p1 = makePlayer('s1', 'Alice');
            game.addPlayer(p1);
            game.start(io);
            p1.socket.msgs.length = 0; // clear setup messages
        });

        afterEach(() => { game.stop(); });

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
            // Move piece down so it has room to rotate away from the top wall
            game.handleInput(p1, 'softDrop');
            game.handleInput(p1, 'softDrop');
            game.handleInput(p1, 'softDrop');
            const rotBefore = p1.state.activePiece.rotation;
            game.handleInput(p1, 'rotate');
            expect(p1.state.activePiece.rotation).to.equal((rotBefore + 1) % 4);
        });

        it('emits state_update after input', () => {
            game.handleInput(p1, 'left');
            const update = p1.socket.msgs.find(m => m.event === 'state_update');
            expect(update).to.exist;
        });

        it('handles hardDrop: spawns next piece', () => {
            const typeBefore = p1.state.activePiece.type;
            game.handleInput(p1, 'hardDrop');
            // After hard drop, new piece should be spawned (or game over)
            expect(p1.state).to.have.property('activePiece');
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
        let io, p1, p2;

        beforeEach(() => {
            io = makeMockIo();
            p1 = makePlayer('s1', 'Alice');
            p2 = makePlayer('s2', 'Bob');
            game.addPlayer(p1);
            game.addPlayer(p2);
            game.start(io);
            p1.socket.msgs.length = 0;
            p2.socket.msgs.length = 0;
        });

        afterEach(() => { game.stop(); });

        it('sends penalty lines to opponents when ≥2 lines cleared', () => {
            const boardBefore = p2.state.board.map(r => [...r]);
            game._penalise(p1, 2); // 1 penalty line to p2
            // p2 board should have changed
            expect(p2.state.board).to.not.deep.equal(boardBefore);
            const update = p2.socket.msgs.find(m => m.event === 'state_update');
            expect(update).to.exist;
        });

        it('sends no penalty for exactly 1 line cleared', () => {
            const boardBefore = p2.state.board.map(r => [...r]);
            game._penalise(p1, 1);
            expect(p2.state.board).to.deep.equal(boardBefore);
        });
    });

    // ── _checkEnd ─────────────────────────────────────────────────────────

    describe('_checkEnd', () => {
        let io, p1, p2;

        beforeEach(() => {
            io = makeMockIo();
            p1 = makePlayer('s1', 'Alice');
            p2 = makePlayer('s2', 'Bob');
            game.addPlayer(p1);
            game.addPlayer(p2);
            game.start(io);
        });

        afterEach(() => { game.stop(); });

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
            const msg = io.emitted.find(m => m.event === 'game_over');
            expect(msg.data.winner).to.be.null;
        });
    });

    // ── Spectrum ──────────────────────────────────────────────────────────

    describe('broadcastSpectrums', () => {
        let io, p1, p2;

        beforeEach(() => {
            io = makeMockIo();
            p1 = makePlayer('s1', 'Alice');
            p2 = makePlayer('s2', 'Bob');
            game.addPlayer(p1);
            game.addPlayer(p2);
            game.start(io);
            p1.socket.msgs.length = 0;
            p2.socket.msgs.length = 0;
        });

        afterEach(() => { game.stop(); });

        it('emits opponents_update to each player', () => {
            game.broadcastSpectrums();
            const msg1 = p1.socket.msgs.find(m => m.event === 'opponents_update');
            const msg2 = p2.socket.msgs.find(m => m.event === 'opponents_update');
            expect(msg1).to.exist;
            expect(msg2).to.exist;
        });

        it('each player does not see themselves in opponents', () => {
            game.broadcastSpectrums();
            const msg1 = p1.socket.msgs.find(m => m.event === 'opponents_update');
            const names = msg1.data.map(o => o.name);
            expect(names).to.not.include('Alice');
        });
    });
});
