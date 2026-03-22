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
    let droppedState = softDrop(state);

    if (droppedState !== state) return droppedState;

    const mergedBoard = mergePiece(state.board, state.activePiece);
    const { board: clearedBoard, clearedLines } = clearLines(mergedBoard);

    const nextPieces = [...state.nextPieces];
    if (nextPieces.length === 0) nextPieces.push(...generateRandomQueue(rng));
    const nextType = nextPieces.shift();

    const newState = {
        ...state,
        board: clearedBoard,
        activePiece: createPiece({ type: nextType }),
        nextPieces: nextPieces,
    };
    if (isGameOver(newState.board)) {
        return {
            ...state,
            board: clearedBoard,
            gameOver: true,
            activePiece: null,
        };
    }
    return newState;
}

// ! add moves (input)
// ! add last frame rotations 

export function gameLoop() {
    const rng = createRng("test-seed");
    let state = createGameState();
    state.nextPieces = generateRandomQueue(rng);
    state.activePiece = createPiece({ type: state.nextPieces.shift() });

    const tick = setInterval(() => {
        state = step(state, rng);
        // console.log("STATE", state); // ! EMIT GAME STATE HERE
        if (state.gameOver) {
            console.log("Game Over");
            clearInterval(tick);
        }
    }, TICK_RATE_MS);

    return {
        getState: () => state,
        stop: () => clearInterval(tick),
    };
}


export function applyInput(state, input) {
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
}