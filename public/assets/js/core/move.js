class Move {
  constructor(fromRow, fromCol, toRow, toCol) {
    this.fromRow = fromRow;
    this.fromCol = fromCol;
    this.toRow = toRow;
    this.toCol = toCol;
    this.piece = null;
    this.captured = null;
    this.prevHasMoved = null;
  }
}