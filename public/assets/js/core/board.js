class Board{
    constructor() {
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.blackPieces = []
        this.whitePieces = []
        this.blackKing = null
        this.whiteKing = null
        this.legalMovesForAPieceCache = new Map();
    }

    placePiece(piece) {
        if(PlayerColor.WHITE === piece.color){
            this.whitePieces.push(piece);
        }else{
            this.blackPieces.push(piece);
        }

        this.boardArr[piece.row][piece.col] = piece;

        if (piece instanceof WhiteKing) this.whiteKing = piece
        if (piece instanceof BlackKing) this.blackKing = piece
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

    isLegalMove(piece, move) {
        const cachedMoves = this.legalMovesForAPieceCache?.get(piece);
        const moves = cachedMoves ?? this.getLegalMovesOfPiece(piece);

        // 1. Is this move even pseudo-legal?
        return moves.some(m =>
            m.toRow === move.toRow &&
            m.toCol === move.toCol
        );
    }

    getLegalMovesOfPiece(piece){
        let legalMoves = [];
        const moves = piece.getPseudoLegalMoves(this);

        for(const move of moves){
            const mv = new Move(piece.row, piece.col, move.row, move.col);
            this.makeMove(mv);

            if(!this.isKingInCheck(piece.color)){
                legalMoves.push(mv);
            }

            this.undoMove(mv);
        }
        return legalMoves;
    }

    /**
     * Get legal moves of all the pieces that are of @param color
     * @param color piece's color whose legal moves are to be calculated
     * @returns {*[]}
     */
    getLegalMoves(color){
        let legalMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = this.boardArr[row][col];
                if(!piece || piece.color !== color)
                    continue;

                const moves = piece.getPseudoLegalMoves(this);

                for(const move of moves){
                    const mv = new Move(piece.row, piece.col, move.row, move.col);
                    this.makeMove(mv);

                    if(!this.isKingInCheck(color)){
                        legalMoves.push(mv);
                    }

                    this.undoMove(mv);
                }
            }
        }
        return legalMoves;
    }

    evaluateGameState(color){
        const isKingInCheck = this.isKingInCheck(color);
        let legalMoves = this.getLegalMoves(color);
        if(this.#isStaleMate(isKingInCheck, legalMoves)){
            return GameState.STALEMATE;
        }

        if(this.#isCheckMate(isKingInCheck, legalMoves)){
            return PlayerColor.WHITE === color ? GameState.CHECKMATE_BLACK_WINS : GameState.CHECKMATE_WHITE_WINS;
        }
        return GameState.CONTINUE;
    }

    #isStaleMate(isKingInCheck, legalMoves){
        if(isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    #isCheckMate(isKingInCheck, legalMoves) {
        if(!isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    makeMove(move) {
        const piece = this.boardArr[move.fromRow][move.fromCol];

        move.captured = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;

        piece.row = move.toRow;
        piece.col = move.toCol;
        move.prevHasMoved = piece.hasMoved
        piece.hasMoved = true;
    }

    undoMove(move) {
        const piece = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.toRow][move.toCol] = move.captured;
        this.boardArr[move.fromRow][move.fromCol] = piece;

        piece.row = move.fromRow;
        piece.col = move.fromCol;
        piece.hasMoved = move.prevHasMoved
    }

    isKingInCheck(color){
        const king = color === PlayerColor.WHITE ? this.whiteKing : this.blackKing;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardArr[row][col];
                if (!piece || piece.color === color) continue;

                const moves = piece.getPseudoLegalMoves(this);

                for (const move of moves) {
                    // Pawn special-case: only diagonals attack
                    if (piece instanceof WhitePawn || piece instanceof BlackPawn) {
                        if (move.col === piece.col) continue;
                    }

                    if (move.row === king.row && move.col === king.col) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    cacheLegalMoves(draggedPiece, legalMoves) {
        this.legalMovesForAPieceCache.set(draggedPiece, legalMoves);
    }

    evictLegalMovesCache(){
        this.legalMovesForAPieceCache.clear();
    }

    getCachedMoves(piece){
        return this.legalMovesForAPieceCache.get(piece);
    }

}