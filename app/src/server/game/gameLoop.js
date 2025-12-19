import { createPiece, isGameOver, mergePiece, softDrop, clearLines } from "../../shared/tetris";

export function step(state) {
    let droppedState = softDrop(state);

    if (droppedState === state) {
        const mergedBoard = mergePiece(state.board, state.activePiece);
        const { board: clearedBoard, clearedLines } = clearLines(mergedBoard);
        const nextPieces = [...state.nextPieces];
        const nextType = nextPieces.length > 0 ? nextPieces.shift() : 'O';
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

// add inputs
// add piece queue generator

// replace createPiece by spawnPiece

// spawnPiece
//      update nextPieces
// const nextType = newState.nextPieces.shift();
// newState.activePiece = createPiece({ type: nextType });