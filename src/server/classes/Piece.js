function Piece(type, pos, rotation) {
    // TODO
}

// -- Shape / geometry ---------------------------------------------------

Piece.prototype.getShape = function () {
    // TODO: return rotated cell offsets for this piece
    // = shared/tetris/pieces.js getPieceShape
};

// -- Movement -------------------------------------------------------------

Piece.prototype.moveBy = function (dx, dy) {
    // TODO: return new Piece translated by (dx, dy)
};

Piece.prototype.rotate = function (direction) {
    // TODO: return new Piece rotated clockwise/counter-clockwise,
    // + wall-kick handling
};

// -- Collision --------------------------------------------------------------

Piece.prototype.canPlaceOn = function (board) {
    // TODO: return whether this piece's shape fits on the given board
    // + out-of-bounds & collision checks
};

// -- Serialization ----------------------------------------------------------

Piece.prototype.toJSON = function () {
    // TODO: return { type, pos, rotation } for state updates
};

export default Piece;
