export function LobbyOverlay({ room, lobbyPlayers, isHost, onStart }) {
    return (
        <div className="overlay">
            <h2>Lobby - {room}</h2>
            <ul className="lobby-players">
                {lobbyPlayers.map(p => (
                    <li key={p.name} className={p.isHost ? 'is-host' : ''}>
                        {p.name}{p.isHost ? ' (host)' : ''}
                    </li>
                ))}
            </ul>
            {isHost
                ? <button onClick={onStart}>Start Game</button>
                : <p style={{ color: 'var(--text-muted)', margin: 0 }}>Waiting for host to start…</p>
            }
        </div>
    );
}
