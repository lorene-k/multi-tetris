const WALL_KICKS = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
];

// const I_KICKS = [
//     { x: 0, y: 0 },
//     { x: -2, y: 0 },
//     { x: 1, y: 0 },
//     { x: -2, y: -1 },
//     { x: 1, y: 2 },
// ];


export const rotate90 = (shape, pivot) => {
    return shape.map(([x, y]) => {
        const dx = x - pivot.x;
        const dy = y - pivot.y;
        const [rx, ry] = [dy, -dx];
        return [rx + pivot.x, ry + pivot.y];
    });
}

export const rotateN = (shape, pivot, n) => {
    let rotatedShape = shape
    for (let i = 0; i < n; i++) {
        rotatedShape = rotate90(rotatedShape, pivot)
    }
    return rotatedShape;
}

// Add wall kicks
// If can't rotate in place, try shifting left/right/up/down by 1
// Wall kicks are:
//  - A small list of position offsets
//  - Tested after rotation
//  - Applied only if rotation initially fails
// Create kick table, try each offset until one fits


// export const rotatePieceWithKick = (state) => {
//   const { board, activePiece } = state;
//   if (!activePiece) return state;

//   const rotatedShape = rotate90(getShape(activePiece));
//   const newRotation = (activePiece.rotation + 1) % 4;
//   const kicks = activePiece.type === 'I' ? I_KICKS : WALL_KICKS;
//   for (const kick of kicks) {
//     const testPos = {
//       x: activePiece.pos.x + kick.x,
//       y: activePiece.pos.y + kick.y,
//     };

//     if (canPlacePiece(board, rotatedShape, testPos)) {
//       return {
//         ...state,
//         activePiece: {
//           ...activePiece,
//           rotation: newRotation,
//           pos: testPos,
//         },
//       };
//     }
//   }

//   // rotation failed
//   return state;
// };


// TESTS:

// it('rotation preserves block count', () => {
//     const shape = PIECES.T.shape;
//     const rotated = rotate90(shape);
//     expect(rotated.length).to.equal(shape.length);
//   });

// it('four rotations returns original shape', () => {
//     const shape = PIECES.L.shape;
//     const rotated = rotateN(shape, 4);
//     expect(rotated).to.deep.equal(shape);
// });

// it('rotation is immutable', () => {
//     const shape = PIECES.S.shape;
//     const copy = JSON.parse(JSON.stringify(shape));
//     rotate90(shape);
//     expect(shape).to.deep.equal(copy);
// });

// it('rotated piece stays in bounds with kick', () => {
//     const state = {
//         board: createEmptyBoard(),
//         activePiece: createPiece({
//             type: 'T',
//             pos: { x: 0, y: 0 },
//         }),
//     };

//     const next = rotatePieceWithKick(state);
//     expect(next.activePiece.pos.x).to.be.at.least(0);
// });
