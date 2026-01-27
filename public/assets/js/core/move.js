class Move {
  constructor(fromRow, fromCol, toRow, toCol) {
    this.fromRow = fromRow;
    this.fromCol = fromCol;
    this.toRow = toRow;
    this.toCol = toCol;
    this.piece = null;
    this.captured = null;

    // Special move flags
    this.isCastling = false;
    this.rookFromCol = null;
    this.rookToCol = null;

    this.isEnPassant = false;
    this.capturedPawnRow = null;
    this.capturedPawnCol = null;

    this.isPromotion = false;
    this.promotionPiece = null;

    // State restoration
    this.prevHasMoved = false;
    this.prevRookHasMoved = false;
  }

  // Factory methods for special moves
  static castling(fromRow, fromCol, toRow, toCol, rookFromCol, rookToCol) {
    const move = new Move(fromRow, fromCol, toRow, toCol);
    move.isCastling = true;
    move.rookFromCol = rookFromCol;
    move.rookToCol = rookToCol;
    return move;
  }

  static enPassant(fromRow, fromCol, toRow, toCol, pawnRow, pawnCol) {
    const move = new Move(fromRow, fromCol, toRow, toCol);
    move.isEnPassant = true;
    move.capturedPawnRow = pawnRow;
    move.capturedPawnCol = pawnCol;
    return move;
  }

  static promotion(fromRow, fromCol, toRow, toCol, promotionPiece) {
    const move = new Move(fromRow, fromCol, toRow, toCol);
    move.isPromotion = true;
    move.promotionPiece = promotionPiece;
    return move;
  }
}