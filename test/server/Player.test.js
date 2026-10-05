import { expect } from 'chai';
import Player from '../../src/server/classes/Player.js';
import { BOARD_WIDTH } from '../../src/shared/tetris/index.js';

// Player never touches its socket except in `emit`, so an empty object is enough here
const makePlayer = () => new Player({}, 'Alice', 'room1');

const QUEUE = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

describe('Player', () => {

    it('creates a player with name, room and default state', () => {
        const player = makePlayer();
        expect(player.name).to.equal('Alice');
        expect(player.room).to.equal('room1');
        expect(player.alive).to.be.false;
        expect(player.state).to.have.property('board');
        expect(player.state.gameOver).to.be.false;
    });

    describe('initState', () => {
        it('initialises board and activePiece from queue', () => {
            const player = makePlayer();
            player.initState(QUEUE);

            expect(player.alive).to.be.true;
            expect(player.state.activePiece).to.not.be.null;
            expect(player.state.activePiece.type).to.equal(QUEUE[0]);
            expect(player.pieceIdx).to.equal(1);
        });

        it('sets nextPieces preview from queue', () => {
            const player = makePlayer();
            player.initState(QUEUE);
            expect(player.state.nextPieces).to.deep.equal(['O', 'T', 'S']);
        });
    });

    describe('consumePiece', () => {
        it('returns next piece type and increments pieceIdx', () => {
            const player = makePlayer();
            player.initState(QUEUE); // consumes index 0, pieceIdx = 1
            const { nextType } = player.consumePiece(QUEUE);
            expect(nextType).to.equal('O');
            expect(player.pieceIdx).to.equal(2);
        });
    });

    describe('getSpectrum', () => {
        it('returns array of BOARD_WIDTH zeros for empty board', () => {
            const spectrum = makePlayer().getSpectrum();
            expect(spectrum).to.have.lengthOf(BOARD_WIDTH);
            spectrum.forEach(height => expect(height).to.equal(0));
        });

        it('returns empty array for uninitialised board', () => {
            const player = makePlayer();
            player.state = { board: [] };
            expect(player.getSpectrum()).to.deep.equal([]);
        });
    });

    describe('emit', () => {
        it('forwards event to socket', () => {
            const emitted = [];
            const socket = { emit: (event, data) => emitted.push({ event, data }) };
            const player = new Player(socket, 'Alice', 'room1');
            player.emit('test_event', { x: 1 });
            expect(emitted).to.deep.include({ event: 'test_event', data: { x: 1 } });
        });
    });
});
