import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Board } from '../components/Board.jsx';
import { Spectrum } from '../components/Spectrum.jsx';
import { NextPiece } from '../components/NextPiece.jsx';
import { LobbyOverlay } from '../components/LobbyOverlay.jsx';
import { GameOverOverlay } from '../components/GameOverOverlay.jsx';
import { useGameConnection } from '../hooks/useGameConnection.js';
import { useGameControls } from '../hooks/useGameControls.js';
import { startGame, restartGame } from '../socket/socket.js';
import '../style/Game.css';

export default function Game() {
    const { room, player } = useParams();
    const navigate = useNavigate();

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
    const connError    = useSelector(s => s.connection.error);

    useGameConnection(room, player);
    useGameControls(started && !gameOver);

    const handleStart   = () => startGame();
    const handleRestart = () => restartGame();
    const handleHome    = () => navigate('/');

    return (
        <div className="game-page">

            {/* LEFT: score + room info + controls */}
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

            {/* CENTRE: board + overlay */}
            <div className="game-centre">
                <div className="board-wrapper">
                    <Board board={board} activePiece={activePiece} />
                    {!started && !gameOver && (
                        <LobbyOverlay room={room} lobbyPlayers={lobbyPlayers} isHost={isHost} onStart={handleStart} />
                    )}
                    {gameOver && (
                        <GameOverOverlay winner={winner} isHost={isHost} onRestart={handleRestart} onHome={handleHome} />
                    )}
                </div>
                {connError && <p className="game-error">{connError}</p>}
            </div>

            {/* RIGHT: next piece + opponent spectrums */}
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
