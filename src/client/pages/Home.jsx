import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, checkJoin, disconnectSocket } from '../socket/socket.js';
import '../style/Home.css';

export default function Home() {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const connected = useSelector(s => s.connection.connected);

    useEffect(() => {
        connectSocket(dispatch);
        return () => disconnectSocket();
    }, [dispatch]);

    const handlePlay = async () => {
        const player = name.trim();
        const roomName = room.trim();
        if (!player || !roomName) {
            setError('Please enter a username and room name to play.');
            return;
        }
        if (!connected) {
            setError('Still connecting to the server, try again in a moment.');
            return;
        }

        setError('');
        setChecking(true);
        const result = await checkJoin(roomName, player);
        setChecking(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }
        navigate(`/${roomName}/${player}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handlePlay();
    };

    return (
        <div className="home-container">
            <h1 className="home-title">MULTITETRIS</h1>
            <p className="home-subtitle">Online Multiplayer Tetris</p>

            <div className="home-card">
                <input
                    className="text-input"
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={20}
                />
                <input
                    className="text-input"
                    type="text"
                    placeholder="Room name"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={20}
                />
                <button onClick={handlePlay} className="play-button" disabled={checking}>
                    {checking ? 'Checking…' : 'Play'}
                </button>
                {error && <p className="error">{error}</p>}
            </div>

            <p className="home-hint">
                Or join directly: <code>/room/yourname</code>
            </p>
        </div>
    );
}
