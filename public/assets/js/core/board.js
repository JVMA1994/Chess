class Board {
    constructor() {
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.blackPieces = []
        this.whitePieces = []
        this.blackKing = null
        this.whiteKing = null
        this.legalMovesForAPieceCache = new Map();
        this.enPassantTargetSquare = null
    }

    placePiece(piece) {
        if (PlayerColor.WHITE === piece.color) {
            this.whitePieces.push(piece);
        } else {
            this.blackPieces.push(piece);
        }

        this.boardArr[piece.row][piece.col] = piece;

        if (piece instanceof WhiteKing) this.whiteKing = piece
        if (piece instanceof BlackKing) this.blackKing = piece
    }

    getPiece(row, col) {
        return this.boardArr[row][col];
    }

    initializeBoard() {
        // ---------- BLACK PIECES ----------
        this.placePiece(new BlackRook(0));
        this.placePiece(new BlackKnight(1));
        this.placePiece(new BlackBishop(2));
        this.placePiece(new BlackQueen(3));
        this.placePiece(new BlackKing());
        this.placePiece(new BlackBishop(5));
        this.placePiece(new BlackKnight(6));
        this.placePiece(new BlackRook(7));

        for (let col = 0; col < 8; col++) {
            this.placePiece(new BlackPawn(col));
        }

        // ---------- WHITE PIECES ----------
        this.placePiece(new WhiteRook(0));
        this.placePiece(new WhiteKnight(1));
        this.placePiece(new WhiteBishop(2));
        this.placePiece(new WhiteQueen(3));
        this.placePiece(new WhiteKing());
        this.placePiece(new WhiteBishop(5));
        this.placePiece(new WhiteKnight(6));
        this.placePiece(new WhiteRook(7));

        for (let col = 0; col < 8; col++) {
            this.placePiece(new WhitePawn(col));
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

    getLegalMovesOfPiece(piece) {
        let legalMoves = [];
        const moves = piece.getPseudoLegalMoves(this);

        for (const move of moves) {
            this.makeMove(move);

            if (!this.isKingInCheck(piece.color)) {
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
    getLegalMoves(color) {
        let legalMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let piece = this.boardArr[row][col];
                if (!piece || piece.color !== color)
                    continue;

                const moves = piece.getPseudoLegalMoves(this);

                for (const move of moves) {
                    this.makeMove(move);

                    move.givesCheck = this.isKingInCheck(getOpponentColor(color));

                    if (!this.isKingInCheck(color)) {
                        legalMoves.push(move);
                    }

                    this.undoMove(move);
                }
            }
        }
        return legalMoves;
    }

    evaluateGameState(color) {
        const isKingInCheck = this.isKingInCheck(color);
        let legalMoves = this.getLegalMoves(color);
        if (this.#isStaleMate(isKingInCheck, legalMoves)) {
            return GameState.STALEMATE;
        }

        if (this.#isCheckMate(isKingInCheck, legalMoves)) {
            return PlayerColor.WHITE === color ? GameState.CHECKMATE_BLACK_WINS : GameState.CHECKMATE_WHITE_WINS;
        }
        return GameState.CONTINUE;
    }

    #isStaleMate(isKingInCheck, legalMoves) {
        if (isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    #isCheckMate(isKingInCheck, legalMoves) {
        if (!isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    makeMove(move) {
        // Store previous en passant state in the move for undo
        move.previousEnPassantTargetSquare = this.enPassantTargetSquare;
        this.enPassantTargetSquare = null;

        const piece = this.boardArr[move.fromRow][move.fromCol];
        move.captured = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;

        piece.row = move.toRow;
        piece.col = move.toCol;

        move.prevHasMoved = piece.hasMoved
        piece.hasMoved = true;

        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookFromCol];
            this.boardArr[piece.row][move.rookFromCol] = null;
            this.boardArr[piece.row][move.rookToCol] = rook;
            move.prevRookHasMoved = rook.hasMoved;
            rook.hasMoved = true;
            // Fix: Update rook coordinates
            rook.row = piece.row;
            rook.col = move.rookToCol;
        }

        if (move.isEnPassant) {
            move.captured = this.boardArr[move.capturedPawnRow][move.capturedPawnCol];
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = null;
        }

        if (Math.abs(move.toRow - move.fromRow) === 2) {
            if (piece instanceof WhitePawn)
                this.enPassantTargetSquare = { row: move.toRow + 1, col: move.toCol }
            else if (piece instanceof BlackPawn)
                this.enPassantTargetSquare = { row: move.toRow - 1, col: move.toCol }
        }

        // Handle promotion
        if (move.isPromotion && move.promotionPiece) {
            // Store original pawn for undo
            move.originalPawn = piece;

            // Create promoted piece
            const promotedPiece = this.#createPromotedPiece(
                move.promotionPiece,
                piece.color,
                move.toRow,
                move.toCol
            );

            // Replace pawn with promoted piece
            this.boardArr[move.toRow][move.toCol] = promotedPiece;

        }
    }

    undoMove(move) {
        // Restore en passant state from the move object
        this.enPassantTargetSquare = move.previousEnPassantTargetSquare;

        const piece = this.boardArr[move.toRow][move.toCol];

        this.boardArr[move.toRow][move.toCol] = move.captured;
        this.boardArr[move.fromRow][move.fromCol] = piece;

        piece.row = move.fromRow;
        piece.col = move.fromCol;
        piece.hasMoved = move.prevHasMoved

        if (move.isCastling) {
            const rook = this.boardArr[move.toRow][move.rookToCol];
            this.boardArr[move.toRow][move.rookToCol] = null;
            this.boardArr[move.fromRow][move.rookFromCol] = rook;
            rook.hasMoved = move.prevRookHasMoved;
            // Fix: Restore rook coordinates
            rook.row = move.fromRow;
            rook.col = move.rookFromCol;
        }

        if (move.isEnPassant) {
            this.boardArr[move.toRow][move.toCol] = null;
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = move.captured;
        }

        // Handle promotion undo
        if (move.isPromotion && move.originalPawn) {
            // Remove promoted piece from board
            const promotedPiece = this.boardArr[move.fromRow][move.fromCol];
            this.boardArr[move.fromRow][move.fromCol] = move.originalPawn;
            // Fix: Restore original pawn coordinates
            move.originalPawn.row = move.fromRow;
            move.originalPawn.col = move.fromCol;

            // Restore captured piece if any
            this.boardArr[move.toRow][move.toCol] = move.captured;
        }
    }

    isKingInCheck(color) {
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
        for (const [dr, dc] of KNIGHT_OFFSETS) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this.#isInsideBoard(newRow, newCol)) {
                let piece = this.boardArr[newRow][newCol];
                if (piece && piece.color === color && piece instanceof Knight) {
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
    #isPawnAttack(row, col, color) {
        const dir = color === PlayerColor.WHITE ? 1 : -1;
        const pawnClass = color === PlayerColor.WHITE ? WhitePawn : BlackPawn;

        for (const c of [-1, 1]) {
            const newRow = row + dir;
            const newCol = col + c;
            if (this.#isInsideBoard(newRow, newCol)) {
                let piece = this.boardArr[newRow][newCol];
                if (piece && piece instanceof pawnClass) {
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

            if (this.#isInsideBoard(newRow, newCol)) {
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
    #isSlidingAttack(row, col, color, dir, pieceClass) {
        for (const [dr, dc] of dir) {
            let newRow = row + dr;
            let newCol = col + dc;

            while (this.#isInsideBoard(newRow, newCol)) {

                const p = this.boardArr[newRow][newCol];
                if (p) {
                    if (p.color === color && (p instanceof pieceClass || p instanceof Queen))
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

    #createPromotedPiece(type, color, row, col) {
        if (type === PromotionType.QUEEN)
            return color === PlayerColor.WHITE
                ? new WhiteQueen(col, row)
                : new BlackQueen(col, row);

        if (type === PromotionType.ROOK)
            return color === PlayerColor.WHITE
                ? new WhiteRook(col, row)
                : new BlackRook(col, row);

        if (type === PromotionType.BISHOP)
            return color === PlayerColor.WHITE
                ? new WhiteBishop(col, row)
                : new BlackBishop(col, row);

        if (type === PromotionType.KNIGHT)
            return color === PlayerColor.WHITE
                ? new WhiteKnight(col, row)
                : new BlackKnight(col, row);
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

    evictLegalMovesCache() {
        this.legalMovesForAPieceCache.clear();
    }

    getCachedMoves(piece) {
        return this.legalMovesForAPieceCache.get(piece);
    }

    evaluateBoard(perspectiveColor) {
        let score = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardArr[row][col];
                if (!piece) continue;

                const material = PIECE_VALUE.get(piece.constructor);
                const positional = getPSTValue(piece, row, col);

                const total = material + positional;

                if (piece.color === perspectiveColor)
                    score += total;
                else
                    score -= total;
            }
        }

        return score;
    }

}

const PIECE_VALUE = new Map([
    [WhitePawn, 100],
    [BlackPawn, 100],
    [WhiteKnight, 320],
    [BlackKnight, 320],
    [WhiteBishop, 330],
    [BlackBishop, 330],
    [WhiteRook, 500],
    [BlackRook, 500],
    [WhiteQueen, 900],
    [BlackQueen, 900],
    [WhiteKing, 20000],
    [BlackKing, 20000],
]);

const PST = new Map([
    [WhitePawn,   PST_TABLES["PAWN"]],
    [BlackPawn,   PST_TABLES["PAWN"]],

    [WhiteKnight, PST_TABLES["KNIGHT"]],
    [BlackKnight, PST_TABLES["KNIGHT"]],

    [WhiteBishop, PST_TABLES["BISHOP"]],
    [BlackBishop, PST_TABLES["BISHOP"]],

    [WhiteRook,   PST_TABLES["ROOK"]],
    [BlackRook,   PST_TABLES["ROOK"]],

    [WhiteQueen,  PST_TABLES["QUEEN"]],
    [BlackQueen,  PST_TABLES["QUEEN"]],

    [WhiteKing,   PST_TABLES["KING"]],
    [BlackKing,   PST_TABLES["KING"]],
]);