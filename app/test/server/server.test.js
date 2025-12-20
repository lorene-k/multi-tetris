import { expect } from "chai"
import { startServer, configureStore } from '../helpers/server'
import rootReducer from '../../src/client/reducers'
import { ping } from '../../src/client/actions/server'
import io from 'socket.io-client'
import params from '../../params'
import http from 'http'

describe('Fake server test', function () {
    let tetrisServer

    before(cb => startServer(params.server, function (err, server) {
        tetrisServer = server
        cb()
    }))

    after(function (done) { tetrisServer.stop(done) })

    describe('HTTP Server', function () {
        it('serves index.html for root path', function (done) {
            http.get(params.server.url, (res) => {
                expect(res.statusCode).to.equal(200)
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    expect(data.length).to.be.greaterThan(0)
                    done()
                })
            }).on('error', done)
        })

        it('returns 500 if bundle.js does not exist', function (done) {
            http.get(params.server.url + '/bundle.js', (res) => {
                expect(res.statusCode).to.equal(500)
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    expect(data).to.equal('Error loading index.html')
                    done()
                })
            }).on('error', done)
        })

        it('serves index.html for unknown paths', function (done) {
            http.get(params.server.url + '/some-other-path', (res) => {
                expect(res.statusCode).to.equal(200)
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
            const store = configureStore(rootReducer, socket, initialState, {
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