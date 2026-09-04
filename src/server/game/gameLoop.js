import seedrandom from "seedrandom";
import {
    createPiece, createGameState, isGameOver,
    mergePiece, hardDrop, softDrop, clearLines,
    rotatePiece, movePiece, generateRandomQueue,
    TICK_RATE_MS,
} from "../../shared/tetris/index.js";

export function createRng(seed) {
    return new seedrandom(seed);
}

export function step(state, rng) {
    if (!state.activePiece) return state;

    let droppedState = softDrop(state);
    if (droppedState !== state) return droppedState;

    const mergedBoard = mergePiece(state.board, state.activePiece);
    const { board: clearedBoard, clearedLines } = clearLines(mergedBoard);

    const nextPieces = [...state.nextPieces];
    if (nextPieces.length === 0) nextPieces.push(...generateRandomQueue(rng));
    const nextType = nextPieces.shift();

    if (isGameOver(clearedBoard)) {
        return {
            ...state,
            board: clearedBoard,
            gameOver: true,
            activePiece: null,
        };
    }

    return {
        ...state,
        board: clearedBoard,
        activePiece: createPiece({ type: nextType }),
        nextPieces,
    };
}

export function applyInput(state, input) {
    if (!state.activePiece) return state;

    let newState = state;

    switch (input) {
        case "left":
            newState = movePiece(state, "left");
            break;
        case "right":
            newState = movePiece(state, "right");
            break;
        case "rotate":
            newState = rotatePiece(state);
            break;
        case "softDrop":
            newState = softDrop(state);
            break;
        case "hardDrop":
            newState = hardDrop(state);
            break;
        default:
            break;
    }

    return newState;
}

// Headless solo game loop (for testing / development)
export function gameLoop() {
    const rng = createRng("test-seed");
    let state = createGameState();
    state.nextPieces = generateRandomQueue(rng);
    state.activePiece = createPiece({ type: state.nextPieces.shift() });

    const tick = setInterval(() => {
        state = step(state, rng);
        if (state.gameOver) {
            clearInterval(tick);
        }
    }, TICK_RATE_MS);

    return {
        getState: () => state,
        stop: () => clearInterval(tick),
    };
}
