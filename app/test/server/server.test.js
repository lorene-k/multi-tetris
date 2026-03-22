import { expect } from "chai"
import { startServer, createStore } from '../helpers/server.js'
import rootReducer from '../../src/client/reducers/index.js'
import { ping } from '../../src/client/actions/server.js'
import io from 'socket.io-client'
import { params } from '../../params.js'
import http from 'http'
import { join } from 'path';
import fs from 'fs';
import sinon from 'sinon';

describe('Server test', function () {
    let tetrisServer

    before(cb => startServer(params.server, function (err, server) {
        tetrisServer = server
        cb()
    }))

    after(function (done) { tetrisServer.stop(done) })

    describe('HTTP Server', function () {
        it('serves index.html for root path', function (done) {
            http.get(params.server.url + '/', (res) => {
                expect(res.statusCode).to.equal(200)
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    expect(data.length).to.be.greaterThan(0)
                    done()
                })
            }).on('error', done)
        })

        it('serves bundle.js if it exists', function (done) {
            const bundlePath = join(process.cwd(), 'src/client/dist/bundle.js');
            if (!fs.existsSync(bundlePath)) this.skip();

            http.get(params.server.url + '/bundle.js', (res) => {
                expect(res.statusCode).to.equal(200);
                expect(res.headers['content-type'])
                    .to.match(/javascript/);
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    expect(data.length).to.be.greaterThan(0);
                    done();
                });
            }).on('error', done);
        });

        it('returns 500 for unknown paths', function (done) {
            http.get(params.server.url + '/does-not-exist', (res) => {
                expect(res.statusCode).to.equal(500)
                done()
            }).on('error', done)
        })
    })

    describe('Socket.IO Server', function () {
        it('connects socket', function (done) {
            const socket = io(params.server.url)
            socket.on('connect', () => {
                expect(socket.connected).to.equal(true)
                socket.disconnect()
                done()
            })
            socket.on('connect_error', done)
        })

        it('sends pong on ping', function (done) {
            const initialState = {}
            const socket = io(params.server.url)
            const store = createStore(rootReducer, socket, initialState, {
                'pong': () => {
                    socket.disconnect()
                    done()
                }
            })
            socket.on('connect', () => {
                store.dispatch(ping())
            })
            socket.on('connect_error', done)
        })

        it('handles non-ping actions', function (done) {
            const socket = io(params.server.url)
            socket.on('connect', () => {
                socket.emit('action', { type: 'server/some-other-action' })
                setTimeout(() => {
                    socket.disconnect()
                    done()
                }, 100)
            })
            socket.on('connect_error', done)
        })
    })
})