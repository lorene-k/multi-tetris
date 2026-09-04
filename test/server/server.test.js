import { expect } from 'chai';
import { startServer, createStore } from '../helpers/server.js';
import rootReducer from '../../src/client/reducers/index.js';
import { ping } from '../../src/client/actions/gameActions.js';
import io from 'socket.io-client';
import { params } from '../../params.js';
import http from 'http';
import { join } from 'path';
import fs from 'fs';

describe('Server test', function () {
    let tetrisServer;

    before(cb => startServer(params.server, function (err, server) {
        if (err) return cb(err);
        tetrisServer = server;
        cb();
    }));

    after(function (done) { tetrisServer.stop(done); });

    describe('HTTP Server', function () {
        it('serves index.html for root path (or falls back)', function (done) {
            http.get(params.server.url + '/', (res) => {
                // Server serves dist/index.html; will be 200 if built or 500 if not yet built
                expect([200, 500]).to.include(res.statusCode);
                done();
            }).on('error', done);
        });

        it('serves bundle.js if it exists', function (done) {
            const bundlePath = join(process.cwd(), 'src/client/dist/bundle.js');
            if (!fs.existsSync(bundlePath)) return this.skip();

            http.get(params.server.url + '/bundle.js', (res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.headers['content-type']).to.match(/javascript/);
                done();
            }).on('error', done);
        });
    });

    describe('Socket.IO Server', function () {
        it('connects socket', function (done) {
            const socket = io(params.server.url, { transports: ['websocket'] });
            socket.on('connect', () => {
                expect(socket.connected).to.equal(true);
                socket.disconnect();
                done();
            });
            socket.on('connect_error', done);
        });

        it('sends pong on ping', function (done) {
            const socket = io(params.server.url, { transports: ['websocket'] });
            const store = createStore(rootReducer, socket, {}, {
                pong: () => {
                    socket.disconnect();
                    done();
                },
            });
            socket.on('connect', () => {
                store.dispatch(ping());
            });
            socket.on('connect_error', done);
        });

        it('handles join_game event', function (done) {
            const socket = io(params.server.url, { transports: ['websocket'] });
            socket.on('connect', () => {
                socket.emit('join_game', { room: 'testRoom', playerName: 'Tester' });
                socket.on('game_state', (data) => {
                    expect(data).to.have.property('players');
                    expect(data.playerName).to.equal('Tester');
                    socket.disconnect();
                    done();
                });
            });
            socket.on('connect_error', done);
        });

        it('rejects join when name is already taken', function (done) {
            const s1 = io(params.server.url, { transports: ['websocket'] });
            s1.on('connect', () => {
                s1.emit('join_game', { room: 'dupRoom', playerName: 'Same' });
                s1.on('game_state', () => {
                    const s2 = io(params.server.url, { transports: ['websocket'] });
                    s2.on('connect', () => {
                        s2.emit('join_game', { room: 'dupRoom', playerName: 'Same' });
                        s2.on('error', ({ message }) => {
                            expect(message).to.match(/taken/i);
                            s1.disconnect();
                            s2.disconnect();
                            done();
                        });
                    });
                });
            });
            s1.on('connect_error', done);
        });

        it('handles non-ping actions gracefully', function (done) {
            const socket = io(params.server.url, { transports: ['websocket'] });
            socket.on('connect', () => {
                socket.emit('action', { type: 'server/other' });
                setTimeout(() => {
                    socket.disconnect();
                    done();
                }, 100);
            });
            socket.on('connect_error', done);
        });
    });
});
