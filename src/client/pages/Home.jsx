import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Home.css';

export default function Home() {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handlePlay = () => {
        const player = name.trim();
        const roomName = room.trim();
        if (!player || !roomName) {
            setError('Please enter a username and room name to play.');
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
            <p className="home-subtitle">Multiplayer Tetris</p>

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
                <button onClick={handlePlay} className="play-button">
                    Play
                </button>
                {error && <p className="error">{error}</p>}
            </div>

            {/* <p className="home-hint">
                Or join directly: <code>/room/yourname</code>
            </p> */}
        </div>
    );
}
