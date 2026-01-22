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

    getPiece(row, col){
        return this.boardArr[row][col];
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

    getLegalMoveOrNull(piece, move) {
        const cachedMoves = this.legalMovesForAPieceCache?.get(piece);
        const moves = cachedMoves ?? this.getLegalMovesOfPiece(piece);

        // 1. Is this move even pseudo-legal?
        return moves.find(m =>
            m.toRow === move.toRow &&
            m.toCol === move.toCol
        );
    }

    getLegalMovesOfPiece(piece){
        let legalMoves = [];
        const moves = piece.getPseudoLegalMoves(this);

        for(const move of moves){
            this.makeMove(move);

            if(!this.isKingInCheck(piece.color)){
                legalMoves.push(move);
            }

            this.undoMove(move);
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
                    this.makeMove(move);

                    if(!this.isKingInCheck(color)){
                        legalMoves.push(move);
                    }

                    this.undoMove(move);
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

        if(move.isCastling){
            const rook = this.boardArr[move.fromRow][move.rookFromCol];
            this.boardArr[piece.row][move.rookFromCol] = null;
            this.boardArr[piece.row][move.rookToCol] = rook;
            move.prevRookHasMoved = rook.hasMoved;
            rook.hasMoved = true;
        }
    }

    undoMove(move) {
        const piece = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.toRow][move.toCol] = move.captured;
        this.boardArr[move.fromRow][move.fromCol] = piece;

        piece.row = move.fromRow;
        piece.col = move.fromCol;
        piece.hasMoved = move.prevHasMoved

        if(move.isCastling){
            const rook = this.boardArr[move.toRow][move.rookToCol];
            this.boardArr[move.toRow][move.rookToCol] = null;
            this.boardArr[move.fromRow][move.rookFromCol] = rook;
            rook.hasMoved = move.prevRookHasMoved;
        }
    }

    isKingInCheck(color){
        const king = color === PlayerColor.WHITE ? this.whiteKing : this.blackKing;
        return this.isSquareAttacked(king.row, king.col, this.#getOpponentColor(color));
    }

    isSquareAttacked(row, col, byColor) {
        return (
            this.#isPawnAttack(row, col, byColor) ||
            this.#isKnightAttack(row, col, byColor) ||
            this.#isSlidingAttack(row, col, byColor, ROOK_DIRS, Rook) ||
            this.#isSlidingAttack(row, col, byColor, BISHOP_DIRS, Bishop) ||
            this.#isKingAttack(row, col, byColor)
        );
    }

    /**
     * Check if a knight of {@param color} attacks a square [{@param row}][{@param col}]
     * @param row row of square
     * @param col col of square
     * @param color attacker's color
     * @returns {boolean}
     */
    #isKnightAttack(row, col, color) {
        for(const [dr, dc] of KNIGHT_OFFSETS) {
            const newRow = row + dr;
            const newCol = col + dc;
            if(this.#isInsideBoard(newRow, newCol)){
                let piece = this.boardArr[newRow][newCol];
                if(piece && piece.color === color && piece instanceof Knight){
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if a pawn of {@param color} attacks a square [{@param row}][{@param col}]
     * @param row row of square
     * @param col col of square
     * @param color attacker's color
     * @returns {boolean}
     */
    #isPawnAttack(row, col, color){
        const dir = color === PlayerColor.WHITE ? 1 : -1;
        const pawnClass = color === PlayerColor.WHITE ? WhitePawn : BlackPawn;

        for(const c of [-1, 1]){
            const newRow = row + dir;
            const newCol = col + c;
            if(this.#isInsideBoard(newRow, newCol)){
                let piece = this.boardArr[newRow][newCol];
                if(piece && piece instanceof pawnClass){
                    return true
                }
            }
        }
        return false;
    }

    /**
     * Check if a king of {@param color} attacks a square [{@param row}][{@param col}]
     * @param row row of square
     * @param col col of square
     * @param color attacker's color
     * @returns {boolean}
     */
    #isKingAttack(row, col, color) {
        for (const [dr, dc] of KING_OFFSETS) {
            const newRow = row + dr;
            const newCol = col + dc;

            if(this.#isInsideBoard(newRow, newCol)){
                const p = this.boardArr[newRow][newCol];
                if (p && p.color === color && p instanceof King) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if a bishop, rook or queen of {@param color} attacks a square [{@param row}][{@param col}]
     * @param row row of square
     * @param col col of square
     * @param color attacker's color
     * @param dir direction for either rook or queen/ bishop or queen
     * @param pieceClass Bishop or Rook
     * @returns {boolean}
     */
    #isSlidingAttack(row, col, color, dir, pieceClass){
        for (const [dr, dc] of dir){
            let newRow = row + dr;
            let newCol = col + dc;

            while(this.#isInsideBoard(newRow, newCol)){

                const p = this.boardArr[newRow][newCol];
                if (p) {
                    if(p.color === color && (p instanceof pieceClass || p instanceof Queen))
                        return true;
                    else
                        break;
                }

                newRow += dr;
                newCol += dc;

            }
        }

        return false;
    }

    #getOpponentColor(color) {
        return PlayerColor.WHITE === color ? PlayerColor.BLACK : PlayerColor.WHITE;
    }

    /**
     * Checks whether the board coordinates are inside the chessboard.
     *
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    #isInsideBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // cache related functions

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