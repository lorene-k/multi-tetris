import * as server from '../../src/server/index.js'
import { configureStore } from '@reduxjs/toolkit';

export const startServer = (params, cb) => {
    server.create(params)
        .then(server => cb(null, server))
        .catch(err => cb(err))
}

export const createStore = (reducer, socket, initialState, types) => {
    return configureStore({
        reducer,
        preloadedState: initialState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                myMiddleware(types),
                socketIoMiddleWare(socket)
            ),
    });
};

const isFunction = arg => { return typeof arg === 'function' }

const myMiddleware = (types = {}) => {
    const fired = {}
    return store => next => action => {
        const result = next(action)
        const cb = types[action.type]
        if (cb && !fired[action.type]) {
            if (!isFunction(cb)) throw new Error("action's type value must be a function")
            fired[action.type] = true
            cb({ getState: store.getState, dispatch: store.dispatch, action })
        }
        return result
    }
}

const socketIoMiddleWare = socket => ({ dispatch, getState }) => {
    if (socket) socket.on('action', dispatch)
    return next => action => {
        if (socket && action.type && action.type.indexOf('server/') === 0) socket.emit('action', action)
        return next(action)
    }
}
