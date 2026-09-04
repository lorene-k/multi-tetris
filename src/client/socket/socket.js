import { io } from 'socket.io-client';

let _socket = null;

export const getSocket = () => _socket;

export const connectSocket = (dispatch) => {
    if (_socket) return _socket;

    _socket = io(window.location.origin, { autoConnect: false });

    _socket.on('connect', () => {
        dispatch({ type: 'connection/connected' });
    });

    _socket.on('disconnect', () => {
        dispatch({ type: 'connection/disconnected' });
    });

    _socket.on('game_state', (payload) => {
        dispatch({ type: 'player/gameState', payload });
    });

    _socket.on('game_started', (payload) => {
        dispatch({ type: 'game/started', payload });
    });

    _socket.on('state_update', (state) => {
        dispatch({ type: 'game/stateUpdate', payload: state });
    });

    _socket.on('opponents_update', (opponents) => {
        dispatch({ type: 'opponents/update', payload: opponents });
    });

    _socket.on('game_over', ({ winner }) => {
        dispatch({ type: 'game/over', payload: { winner } });
    });

    _socket.on('player_joined', (payload) => {
        dispatch({ type: 'player/joined', payload });
    });

    _socket.on('player_left', (payload) => {
        dispatch({ type: 'player/left', payload });
    });

    _socket.on('error', ({ message }) => {
        dispatch({ type: 'connection/error', payload: message });
    });

    // Backward-compat ping/pong
    _socket.on('action', (action) => {
        dispatch(action);
    });

    _socket.connect();
    return _socket;
};

export const emit = (event, data) => {
    if (_socket) _socket.emit(event, data);
};

export const joinGame = (room, playerName) => {
    emit('join_game', { room, playerName });
};

// Read-only pre-check used by Home before navigating to the game page
// Does not add a player, just reports whether room + playerName is joinable
export const checkJoin = (room, playerName) => {
    return new Promise((resolve) => {
        if (!_socket) {
            resolve({ ok: false, message: 'Not connected to the server.' });
            return;
        }

        const timeout = setTimeout(() => {
            resolve({ ok: false, message: 'Server did not respond, try again.' });
        }, 5000);

        _socket.emit('check_join', { room, playerName }, (response) => {
            clearTimeout(timeout);
            resolve(response);
        });
    });
};

export const startGame = () => {
    emit('start_game');
};

export const restartGame = () => {
    emit('restart_game');
};

export const sendInput = (input) => {
    emit('player_input', { input });
};

export const disconnectSocket = () => {
    if (_socket) {
        _socket.disconnect();
        _socket = null;
    }
};
