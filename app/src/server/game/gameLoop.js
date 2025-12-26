import { createPiece, isGameOver, mergePiece, softDrop, clearLines, generateRandomQueue } from "../../shared/tetris/index.js";
import seedrandom from "seedrandom";

export function createRng(seed) {
    return new seedrandom(seed);
}

export function step(state, rng) {
    let droppedState = softDrop(state);

    if (droppedState === state) {
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
                ...newState,
                gameOver: true,
                activePiece: null,
            };
        }
        return newState;
    }
    return droppedState;
}

// ! add moves (input)
// ! add last frame rotations 

// export function gameLoop() {
//     let activePiece = createPiece({ type: 'T' });
//     let state = createGameState(activePiece);
//     state.nextPieces = ['O', 'I', 'L', 'J', 'S', 'Z', 'T']; // test

//     const tick = setInterval(() => {
//         state = step(state);
//         console.log(state);
//         if (state.gameOver) {
//             console.log("Game Over");
//             clearInterval(tick);
//         }
//     }, TICK_RATE_MS);
// }
