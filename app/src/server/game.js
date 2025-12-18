import { createPiece, mergePiece, softDrop } from "../shared/tetris";

export function step(state) {
    let newState = state;
    newState = softDrop(newState);
    if (newState === state) {
        newState = {
            ...newState,
            board: mergePiece(state.board, state.activePiece),
            activePiece: createPiece({ type: '0' }),
        }
    }
    return newState;
}
