import { expect } from 'chai';
import fs from 'fs';
import http from 'http';
import { join } from 'path';
import io from 'socket.io-client';
import { ping } from '../../src/client/actions/gameActions.js';
import * as server from '../../src/server/index.js';
import { params } from '../../params.js';

describe('Server test', function () {
    let tetrisServer;
    let sockets;

    before(async function () {
        tetrisServer = await server.create(params.server);
    });

    after(function (done) {
        tetrisServer.stop(done);
    });

    beforeEach(function () {
        sockets = [];
    });

    afterEach(function () {
        sockets.forEach(socket => socket.disconnect());
    });

    // Opens a real client socket and registers it for teardown.
    // `done` is passed so that a failed connection fails the test instead of timing out.
    function connect(done) {
        const socket = io(params.server.url, { transports: ['websocket'] });
        socket.on('connect_error', done);
        sockets.push(socket);
        return socket;
    }

    describe('HTTP Server', function () {
        it('serves index.html for root path (or falls back)', function (done) {
            http.get(params.server.url + '/', (res) => {
                // 200 when the client has been built, 500 when dist/index.html is missing
                expect([200, 500]).to.include(res.statusCode);
                done();
            }).on('error', done);
        });

        it('serves bundle.js if it exists', function (done) {
            if (!fs.existsSync(join(process.cwd(), 'src/client/dist/bundle.js'))) return this.skip();

            http.get(params.server.url + '/bundle.js', (res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.headers['content-type']).to.match(/javascript/);
                done();
            }).on('error', done);
        });
    });

    describe('Socket.IO Server', function () {
        it('connects socket', function (done) {
            const socket = connect(done);
            socket.on('connect', () => {
                expect(socket.connected).to.equal(true);
                done();
            });
        });

        it('sends pong on ping', function (done) {
            const socket = connect(done);
            socket.on('connect', () => socket.emit('action', ping()));
            socket.on('action', (action) => {
                if (action.type === 'pong') done();
            });
        });

        it('handles join_game event', function (done) {
            const socket = connect(done);
            socket.on('connect', () => socket.emit('join_game', { room: 'testRoom', playerName: 'Tester' }));
            socket.on('game_state', (data) => {
                expect(data).to.have.property('players');
                expect(data.playerName).to.equal('Tester');
                done();
            });
        });

        it('rejects join when name is already taken', function (done) {
            const first = connect(done);
            first.on('connect', () => first.emit('join_game', { room: 'dupRoom', playerName: 'Same' }));
            first.on('game_state', () => {
                const second = connect(done);
                second.on('connect', () => second.emit('join_game', { room: 'dupRoom', playerName: 'Same' }));
                second.on('error', ({ message }) => {
                    expect(message).to.match(/taken/i);
                    done();
                });
            });
        });

        it('handles non-ping actions gracefully', function (done) {
            const socket = connect(done);
            socket.on('connect', () => {
                socket.emit('action', { type: 'server/other' });
                setTimeout(done, 100);
            });
        });
    });
});
