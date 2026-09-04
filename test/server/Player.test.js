import { expect } from 'chai';
import Player from '../../src/server/classes/Player.js';
import { BOARD_WIDTH, BOARD_HEIGHT, generateBag } from '../../src/shared/tetris/index.js';
import { createRng } from '../../src/server/game/gameLoop.js';

// Minimal mock socket
const mockSocket = (id = 'sock1') => ({
    id,
    emitted: [],
    emit(event, data) { this.emitted.push({ event, data }); },
});

describe('Player', () => {

    it('creates a player with name, room and default state', () => {
        const socket = mockSocket();
        const player = new Player(socket, 'Alice', 'room1');
        expect(player.name).to.equal('Alice');
        expect(player.room).to.equal('room1');
        expect(player.alive).to.be.false;
        expect(player.state).to.have.property('board');
        expect(player.state.gameOver).to.be.false;
    });

    describe('initState', () => {
        it('initialises board and activePiece from queue', () => {
            const rng = createRng('p-seed');
            const queue = generateBag(rng);
            const player = new Player(mockSocket(), 'Bob', 'r');
            player.initState(queue);

            expect(player.alive).to.be.true;
            expect(player.state.activePiece).to.not.be.null;
            expect(player.state.activePiece.type).to.equal(queue[0]);
            expect(player.pieceIdx).to.equal(1);
        });

        it('sets nextPieces preview from queue', () => {
            const queue = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
            const player = new Player(mockSocket(), 'C', 'r');
            player.initState(queue);
            expect(player.state.nextPieces).to.deep.equal(['O', 'T', 'S']);
        });
    });

    describe('consumePiece', () => {
        it('returns next piece type and increments pieceIdx', () => {
            const queue = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
            const player = new Player(mockSocket(), 'D', 'r');
            player.initState(queue); // consumes index 0, pieceIdx = 1
            const { nextType } = player.consumePiece(queue);
            expect(nextType).to.equal('O');
            expect(player.pieceIdx).to.equal(2);
        });
    });

    describe('getSpectrum', () => {
        it('returns array of BOARD_WIDTH zeros for empty board', () => {
            const player = new Player(mockSocket(), 'E', 'r');
            const spectrum = player.getSpectrum();
            expect(spectrum).to.have.lengthOf(BOARD_WIDTH);
            spectrum.forEach(h => expect(h).to.equal(0));
        });

        it('returns correct height when board has pieces', () => {
            const player = new Player(mockSocket(), 'F', 'r');
            player.state.board[BOARD_HEIGHT - 1][0] = 'T';
            const spectrum = player.getSpectrum();
            expect(spectrum[0]).to.equal(1);
        });

        it('returns empty array for uninitialised board', () => {
            const player = new Player(mockSocket(), 'G', 'r');
            player.state = { board: [] };
            const spectrum = player.getSpectrum();
            expect(spectrum).to.deep.equal([]);
        });
    });

    describe('emit', () => {
        it('forwards event to socket', () => {
            const socket = mockSocket();
            const player = new Player(socket, 'H', 'r');
            player.emit('test_event', { x: 1 });
            expect(socket.emitted).to.deep.include({ event: 'test_event', data: { x: 1 } });
        });
    });
});
