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
    this.enPassantCapturedPawn = null;

    this.isPromotion = false;
    this.promotionPiece = null;

    // State restoration
    this.prevHasMoved = false;
    this.prevRookHasMoved = false;
  }
}