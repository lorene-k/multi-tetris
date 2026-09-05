import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, joinGame, disconnectSocket } from '../socket/socket.js';

// Connects the socket, registers this player's name/room, and joins the game room once connected
export function useGameConnection(room, player) {
    const dispatch = useDispatch();
    const connected = useSelector(s => s.connection.connected);

    useEffect(() => {
        dispatch({ type: 'player/setInfo', payload: { name: player, room } });
        connectSocket(dispatch);
        return () => {
            disconnectSocket();
        };
    }, []);

    useEffect(() => {
        if (connected) joinGame(room, player);
    }, [connected]);

    return { connected };
}
