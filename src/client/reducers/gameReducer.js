import { createEmptyBoard } from '../../shared/tetris/index.js';

const initialState = {
    board: createEmptyBoard(),
    activePiece: null,
    nextPieces: [],
    gameOver: false,
    started: false,
    winner: null,
    lobbyPlayers: [],
    score: 0,
    linesCleared: 0,
};

const gameReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'game/started':
            return {
                ...state,
                started: true,
                gameOver: false,
                winner: null,
                board: createEmptyBoard(),
                activePiece: null,
                nextPieces: [],
                lobbyPlayers: action.payload.players || [],
                score: 0,
                linesCleared: 0,
            };

        case 'game/stateUpdate': {
            // Score: 1/3/5/8 × 100 for 1/2/3/4 cleared lines (Tetris scoring)
            const SCORE_TABLE = [0, 100, 300, 500, 800];
            const lines = action.payload.linesCleared || 0;
            const addScore = SCORE_TABLE[Math.min(lines, 4)] || 0;
            return {
                ...state,
                board: action.payload.board || state.board,
                activePiece: action.payload.activePiece !== undefined
                    ? action.payload.activePiece
                    : state.activePiece,
                nextPieces: action.payload.nextPieces || state.nextPieces,
                gameOver: action.payload.gameOver || false,
                score: state.score + addScore,
                linesCleared: state.linesCleared + lines,
            };
        }

        case 'game/over':
            return {
                ...state,
                started: false,
                gameOver: true,
                winner: action.payload.winner,
            };

        case 'player/gameState':
            return {
                ...state,
                started: action.payload.started || false,
                lobbyPlayers: action.payload.players || [],
            };

        case 'player/joined':
            return {
                ...state,
                lobbyPlayers: action.payload.players || state.lobbyPlayers,
            };

        case 'player/left':
            return {
                ...state,
                lobbyPlayers: action.payload.players || state.lobbyPlayers,
            };

        default:
            return state;
    }
};

export default gameReducer;
