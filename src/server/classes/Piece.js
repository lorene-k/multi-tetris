import { PIECES, PIECE_TYPES } from '../../shared/tetris/index.js';

/**
 * Piece – server-side metadata wrapper.
 * Tracks the type and rotation state; actual shape is derived via getPieceShape.
 */
function Piece(type) {
    if (!PIECE_TYPES.includes(type)) {
        throw new Error(`Invalid piece type: ${type}`);
    }
    this.type = type;
    this.rotation = 0;
}

Piece.prototype.getDefinition = function () {
    return PIECES[this.type];
};

Piece.prototype.getShape = function () {
    return PIECES[this.type].shape;
};

Piece.prototype.getPivot = function () {
    return PIECES[this.type].pivot;
};

export default Piece;
