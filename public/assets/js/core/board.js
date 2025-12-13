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

}