class Board{
    constructor() {
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.pieces = []
    }

    placePiece(piece) {
        this.pieces.push(piece);
        this.boardArr[piece.row][piece.col] = piece;
    }

    initializeBoard(images) {
        // ---------- BLACK PIECES ----------
        this.placePiece(new BlackRook(images.bR, 0));
        this.placePiece(new BlackKnight(images.bN, 1));
        this.placePiece(new BlackBishop(images.bB, 2));
        this.placePiece(new BlackQueen(images.bQ));
        this.placePiece(new BlackKing(images.bK));
        this.placePiece(new BlackBishop(images.bB, 5));
        this.placePiece(new BlackKnight(images.bN, 6));
        this.placePiece(new BlackRook(images.bR, 7));

        for (let col = 0; col < 8; col++) {
            this.placePiece(new BlackPawn(images.bP, col));
        }

        // ---------- WHITE PIECES ----------
        this.placePiece(new WhiteRook(images.wR, 0));
        this.placePiece(new WhiteKnight(images.wN, 1));
        this.placePiece(new WhiteBishop(images.wB, 2));
        this.placePiece(new WhiteQueen(images.wQ));
        this.placePiece(new WhiteKing(images.wK));
        this.placePiece(new WhiteBishop(images.wB, 5));
        this.placePiece(new WhiteKnight(images.wN, 6));
        this.placePiece(new WhiteRook(images.wR, 7));

        for (let col = 0; col < 8; col++) {
            this.placePiece(new WhitePawn(images.wP, col));
        }
    }

    isLegalMove(piece, targetRow, targetCol) {
        const moves = piece.getPseudoLegalMoves(this);

        // 1. Is this move even pseudo-legal?
        return moves.find(
            m => m.row === targetRow && m.col === targetCol
        );
    }

    makeMove(move) {
        const piece = this.boardArr[move.fromRow][move.fromCol];

        move.captured = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;

        piece.row = move.toRow;
        piece.col = move.toCol;
        piece.hasMoved = true;
        piece.drag = false;
    }

    undoMove(move) {
        const piece = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.toRow][move.toCol] = move.captured;
        this.boardArr[move.fromRow][move.fromCol] = piece;

        piece.row = move.fromRow;
        piece.col = move.fromCol;
        piece.drag = false;
    }


}