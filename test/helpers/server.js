import * as server from '../../src/server/index.js';
import * as reduxModule from 'redux';
const redux = reduxModule.default || reduxModule;

/**
 * Start the tetris server and call back with the running instance.
 */
export const startServer = (params, cb) => {
    server.create(params)
        .then(instance => cb(null, instance))
        .catch(err => cb(err));
};

/**
 * Create a minimal Redux store wired to an optional socket.
 * handlers: { [actionType]: ({ dispatch, getState }) => void }
 */
export const createStore = (reducer, socket, initialState, handlers = {}) => {
    const handlerMiddleware = store => next => action => {
        const result = next(action);
        if (handlers[action.type]) {
            handlers[action.type]({ dispatch: store.dispatch, getState: store.getState });
        }
        return result;
    };

    const socketMiddleware = store => next => action => {
        if (socket && typeof action.type === 'string' && action.type.startsWith('server/')) {
            socket.emit('action', action);
        }
        return next(action);
    };

    const store = redux.createStore(
        reducer,
        initialState,
        redux.applyMiddleware(socketMiddleware, handlerMiddleware)
    );

    if (socket) {
        socket.on('action', action => store.dispatch(action));
    }

    return store;
};
