import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Board } from '../components/Board.jsx';
import { Lobby } from '../components/Lobby.jsx';
import { GameOver } from '../components/GameOver.jsx';
import { useGameConnection } from '../hooks/useGameConnection.js';
import { useGameControls } from '../hooks/useGameControls.js';
import { startGame, restartGame } from '../socket/socket.js';
import { LeftPanel } from '../components/LeftPanel.jsx';
import { RightPanel } from '../components/RightPanel.jsx';
import '../style/Game.css';

export default function Game() {
    const { room, player } = useParams();
    const navigate = useNavigate();

    const board = useSelector(s => s.game.board);
    const activePiece = useSelector(s => s.game.activePiece);
    const nextPieces = useSelector(s => s.game.nextPieces);
    const gameOver = useSelector(s => s.game.gameOver);
    const started = useSelector(s => s.game.started);
    const winner = useSelector(s => s.game.winner);
    const lobbyPlayers = useSelector(s => s.game.lobbyPlayers);
    const score = useSelector(s => s.game.score);
    const linesCleared = useSelector(s => s.game.linesCleared);
    const isHost = useSelector(s => s.player.isHost);
    const opponents = useSelector(s => s.opponents);
    const connError = useSelector(s => s.connection.error);

    useGameConnection(room, player);
    useGameControls(started && !gameOver);

    const handleStart = () => startGame();
    const handleRestart = () => restartGame();
    const handleHome = () => navigate('/');

    return (
        <div className="game-page">

            <div className="game-header">
                <h1 className="game-title">MULTITETRIS</h1>
            </div>

            <div className="game-body">

                <LeftPanel room={room} player={player} score={score} linesCleared={linesCleared} />

                <div className="game-centre">
                    <div className="board-wrapper">
                        <Board board={board} activePiece={activePiece} />
                        {!started && !gameOver && (
                            <Lobby lobbyPlayers={lobbyPlayers} isHost={isHost} onStart={handleStart} />
                        )}
                        {gameOver && (
                            <GameOver winner={winner} isHost={isHost} onRestart={handleRestart} onHome={handleHome} />
                        )}
                    </div>
                    {connError && <p className="error">{connError}</p>}
                </div>

                <RightPanel nextPieces={nextPieces} opponents={opponents} />

            </div>

        </div>
    );
}
