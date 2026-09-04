import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Board } from '../components/Board.jsx';
import { Spectrum } from '../components/Spectrum.jsx';
import { NextPiece } from '../components/NextPiece.jsx';
import { connectSocket, joinGame, startGame, restartGame, sendInput } from '../socket/socket.js';
import '../style/Game.css';

const KEYBOARD_MAP = {
    ArrowLeft:  'left',
    ArrowRight: 'right',
    ArrowUp:    'rotate',
    ArrowDown:  'softDrop',
    ' ':        'hardDrop',
};

export default function Game() {
    const { room, player } = useParams();
    const dispatch  = useDispatch();
    const navigate  = useNavigate();

    const board        = useSelector(s => s.game.board);
    const activePiece  = useSelector(s => s.game.activePiece);
    const nextPieces   = useSelector(s => s.game.nextPieces);
    const gameOver     = useSelector(s => s.game.gameOver);
    const started      = useSelector(s => s.game.started);
    const winner       = useSelector(s => s.game.winner);
    const lobbyPlayers = useSelector(s => s.game.lobbyPlayers);
    const score        = useSelector(s => s.game.score);
    const linesCleared = useSelector(s => s.game.linesCleared);
    const isHost       = useSelector(s => s.player.isHost);
    const opponents    = useSelector(s => s.opponents);
    const connected    = useSelector(s => s.connection.connected);
    const connError    = useSelector(s => s.connection.error);

    // Connect socket and set player info on mount
    useEffect(() => {
        dispatch({ type: 'player/setInfo', payload: { name: player, room } });
        connectSocket(dispatch);
    }, []);

    // Join game once connected
    useEffect(() => {
        if (connected) joinGame(room, player);
    }, [connected]);

    // Keyboard input
    const handleKeyDown = useCallback((e) => {
        if (!started || gameOver) return;
        const input = KEYBOARD_MAP[e.key];
        if (input) {
            e.preventDefault();
            sendInput(input);
        }
    }, [started, gameOver]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleStart   = () => startGame();
    const handleRestart = () => restartGame();
    const handleHome    = () => navigate('/');

    // ── Overlay ─────────────────────────────────────────────────────────────
    const renderOverlay = () => {
        if (!started && !gameOver) {
            return (
                <div className="overlay">
                    <h2>Lobby — {room}</h2>
                    <ul className="lobby-players">
                        {lobbyPlayers.map(p => (
                            <li key={p.name} className={p.isHost ? 'is-host' : ''}>
                                {p.name}{p.isHost ? ' (host)' : ''}
                            </li>
                        ))}
                    </ul>
                    {isHost
                        ? <button onClick={handleStart}>Start Game</button>
                        : <p style={{ color: 'var(--text-muted)', margin: 0 }}>Waiting for host to start…</p>
                    }
                </div>
            );
        }

        if (gameOver) {
            return (
                <div className="overlay">
                    <h2 className={winner ? 'winner-text' : ''}>
                        {winner ? `${winner} wins! ` : 'Game Over'}
                    </h2>
                    {isHost && <button onClick={handleRestart}>Play Again</button>}
                    <button className="btn-purple" onClick={handleHome}>Home</button>
                </div>
            );
        }

        return null;
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="game-page">

            {/* ── LEFT: score + room info + controls ── */}
            <div className="game-left">
                <div className="score-panel">
                    <div className="score-block">
                        <span className="score-label">Score</span>
                        <span className="score-value">{score.toLocaleString()}</span>
                    </div>
                    <div className="score-block">
                        <span className="score-label">Lines</span>
                        <span className="score-value purple">{linesCleared}</span>
                    </div>
                </div>

                <div className="info-panel">
                    <p><strong>Room</strong> {room}</p>
                    <p><strong>Player</strong> {player}</p>
                </div>

                <div className="controls-panel">
                    <p><span className="key">←→</span> Move</p>
                    <p><span className="key">↑</span> Rotate</p>
                    <p><span className="key">↓</span> Soft drop</p>
                    <p><span className="key">Space</span> Hard drop</p>
                </div>
            </div>

            {/* ── CENTRE: board + overlay ── */}
            <div className="game-centre">
                <div className="board-wrapper">
                    <Board board={board} activePiece={activePiece} />
                    {renderOverlay()}
                </div>
                {connError && <p className="game-error">{connError}</p>}
            </div>

            {/* ── RIGHT: next piece + opponent spectrums ── */}
            <div className="game-right">
                <div className="next-panel">
                    <span className="next-panel-label">Next</span>
                    <NextPiece type={nextPieces && nextPieces[0]} />
                </div>

                {opponents.length > 0 && (
                    <div className="opponents-panel">
                        <p className="opponents-title">Opponents</p>
                        {opponents.map(opp => (
                            <Spectrum
                                key={opp.name}
                                name={opp.name}
                                spectrum={opp.spectrum || Array(10).fill(0)}
                                alive={opp.alive}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
