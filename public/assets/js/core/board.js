class Board {
    constructor() {
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.blackPieces = []
        this.whitePieces = []
        this.blackKing = null
        this.whiteKing = null
        this.legalMovesForAPieceCache = new Map();
        this.enPassantTargetSquare = null;

        // Evaluation state
        this.whiteEvalScore = 0;

        // Incremental state for Zobrist hashing
        this.zobristKey = 0n;
        this.castlingRights = 15; // 1111 binary: W_KS, W_QS, B_KS, B_QS
    }

    placePiece(piece) {
        if (PlayerColor.WHITE === piece.color) {
            this.whitePieces.push(piece);
        } else {
            this.blackPieces.push(piece);
        }

        this.boardArr[piece.row][piece.col] = piece;

        if (piece instanceof WhiteKing) this.whiteKing = piece;
        if (piece instanceof BlackKing) this.blackKing = piece;

        // Ensure incremental state is updated for manual placement (useful for tests/editor)
        this._togglePieceState(piece, piece.row, piece.col, true);
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

        // Finalize hash with side-to-move (White starts)
        // Note: Piece placement already updated hash for pieces.
        // If we want a clean start, we can reset and compute once, 
        // OR just XOR the side key.
        // Actually, placePiece already XORed everything. 
        // Let's just match the computeHash precisely.
        this.zobristKey = zobrist.computeHash(this, PlayerColor.WHITE);
        this.castlingRights = zobrist.getCastlingMask(this);
    }

    /**
     * Computes the full evaluation from scratch (used only during initialization).
     */
    _computeFullEvaluation() {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.boardArr[r][c];
                if (piece) {
                    const material = PIECE_VALUE.get(piece.constructor) || 0;
                    const positional = this._getPSTValue(piece, r, c);
                    if (piece.color === PlayerColor.WHITE) score += (material + positional);
                    else score -= (material + positional);
                }
            }
        }
        return score;
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
        const pieces = color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;

        for (const piece of pieces) {
            // Guard against stale pieces in list (though my sync fixes should prevent this)
            if (this.boardArr[piece.row][piece.col] !== piece) continue;

            const moves = piece.getPseudoLegalMoves(this);

            for (const move of moves) {
                this.makeMove(move);

                if (!this.isKingInCheck(color)) {
                    legalMoves.push(move);
                }

                this.undoMove(move);
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

    /**
     * Specialized move generator for Quiescence Search.
     * Only returns legal captures and promotions.
     */
    getCaptures(color) {
        let captures = [];
        const pieces = color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;

        for (const piece of pieces) {
            if (this.boardArr[piece.row][piece.col] !== piece) continue;

            const moves = piece.getPseudoLegalMoves(this);

            for (const move of moves) {
                // Filter for captures or promotions
                if (move.captured || move.isPromotion) {
                    this.makeMove(move);
                    if (!this.isKingInCheck(color)) {
                        captures.push(move);
                    }
                    this.undoMove(move);
                }
            }
        }
        return captures;
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
        // Store previous state for undo (incremental hash updates rely on this)
        move.prevZobristKey = this.zobristKey;
        move.prevCastlingRights = this.castlingRights;
        move.prevWhiteEvalScore = this.whiteEvalScore;
        move.previousEnPassantTargetSquare = this.enPassantTargetSquare;

        // 1. Toggle side to move
        this.zobristKey ^= zobrist.sideKey;

        // 2. Clear old EP key if exists
        if (this.enPassantTargetSquare) {
            this.zobristKey ^= zobrist.enPassantKeys[this.enPassantTargetSquare.col];
        }

        const piece = this.boardArr[move.fromRow][move.fromCol];
        move.captured = this.boardArr[move.toRow][move.toCol];

        // 1. Update Hash and Evaluation (Remove from old square)
        this._togglePieceState(piece, move.fromRow, move.fromCol, false);
        if (move.captured && !move.isEnPassant) {
            this._togglePieceState(move.captured, move.toRow, move.toCol, false);
        }

        // Execute move
        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;
        piece.row = move.toRow;
        piece.col = move.toCol;
        move.prevHasMoved = piece.hasMoved;
        piece.hasMoved = true;

        this.enPassantTargetSquare = null;

        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookFromCol];
            this._togglePieceState(rook, move.fromRow, move.rookFromCol, false);

            this.boardArr[piece.row][move.rookFromCol] = null;
            this.boardArr[piece.row][move.rookToCol] = rook;
            move.prevRookHasMoved = rook.hasMoved;
            rook.hasMoved = true;
            rook.row = piece.row;
            rook.col = move.rookToCol;

            this._togglePieceState(rook, rook.row, rook.col, true);
        }

        if (move.isEnPassant) {
            move.captured = this.boardArr[move.capturedPawnRow][move.capturedPawnCol];
            this._togglePieceState(move.captured, move.capturedPawnRow, move.capturedPawnCol, false);
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = null;
        }

        // --- NEW: Remove captured piece from piece list ---
        if (move.captured) {
            const list = (move.captured.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
            const idx = list.indexOf(move.captured);
            if (idx !== -1) list.splice(idx, 1);
        }

        if (Math.abs(move.toRow - move.fromRow) === 2 && (piece instanceof WhitePawn || piece instanceof BlackPawn)) {
            if (piece instanceof WhitePawn)
                this.enPassantTargetSquare = { row: move.toRow + 1, col: move.toCol }
            else
                this.enPassantTargetSquare = { row: move.toRow - 1, col: move.toCol }
            this.zobristKey ^= zobrist.enPassantKeys[this.enPassantTargetSquare.col];
        }

        // 2. Update Hash and Evaluation (Add to new square)
        if (move.isPromotion && move.promotionPiece) {
            move.originalPawn = piece;
            const promotedPiece = this.#createPromotedPiece(move.promotionPiece, piece.color, move.toRow, move.toCol);
            this.boardArr[move.toRow][move.toCol] = promotedPiece;

            // Update piece lists
            const pieceList = (piece.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
            const idx = pieceList.indexOf(piece);
            if (idx !== -1) pieceList.splice(idx, 1);
            pieceList.push(promotedPiece);

            this._togglePieceState(promotedPiece, move.toRow, move.toCol, true);
        } else {
            this._togglePieceState(piece, move.toRow, move.toCol, true);
        }

        // 3. Update castling rights in hash
        this.zobristKey ^= zobrist.castlingKeys[this.castlingRights];
        this.castlingRights = zobrist.getCastlingMask(this);
        this.zobristKey ^= zobrist.castlingKeys[this.castlingRights];
    }

    _togglePieceState(piece, row, col, isAdding) {
        if (!piece) return;
        const colorIdx = (piece.color === PlayerColor.WHITE) ? 0 : 1;
        const squareIdx = row * 8 + col;

        // Update Hash
        if (piece.type !== undefined && piece.type !== null) {
            this.zobristKey ^= zobrist.pieceKeys[colorIdx][piece.type][squareIdx];
        }

        // Update Evaluation
        const material = PIECE_VALUE.get(piece.constructor) || 0;
        const positional = this._getPSTValue(piece, row, col);
        const value = material + positional;

        if (isAdding) {
            this.whiteEvalScore += (piece.color === PlayerColor.WHITE ? value : -value);
        } else {
            this.whiteEvalScore -= (piece.color === PlayerColor.WHITE ? value : -value);
        }
    }

    _getPSTValue(piece, row, col) {
        const table = PST.get(piece.constructor);
        if (!table) return 0;
        if (piece.color === PlayerColor.WHITE) return table[row][col];
        return table[7 - row][col];
    }

    undoMove(move) {
        this.zobristKey = move.prevZobristKey;
        this.castlingRights = move.prevCastlingRights;
        this.whiteEvalScore = move.prevWhiteEvalScore;
        this.enPassantTargetSquare = move.previousEnPassantTargetSquare;

        const piece = this.boardArr[move.toRow][move.toCol];

        if (move.isPromotion && move.originalPawn) {
            // Restore piece list
            const pieceList = (move.originalPawn.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
            const idx = pieceList.indexOf(piece);
            if (idx !== -1) pieceList.splice(idx, 1);
            pieceList.push(move.originalPawn);

            this.boardArr[move.fromRow][move.fromCol] = move.originalPawn;
            move.originalPawn.row = move.fromRow;
            move.originalPawn.col = move.fromCol;
            this.boardArr[move.toRow][move.toCol] = move.captured;

            // Restore captured piece to list if it was a capture-promotion
            if (move.captured) {
                const opponentList = (move.captured.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
                opponentList.push(move.captured);
            }
        } else {
            this.boardArr[move.toRow][move.toCol] = move.captured;
            this.boardArr[move.fromRow][move.fromCol] = piece;
            piece.row = move.fromRow;
            piece.col = move.fromCol;
        }
        piece.hasMoved = move.prevHasMoved;

        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookToCol];
            this.boardArr[move.fromRow][move.rookToCol] = null;
            this.boardArr[move.fromRow][move.rookFromCol] = rook;
            rook.hasMoved = move.prevRookHasMoved;
            rook.row = move.fromRow;
            rook.col = move.rookFromCol;
        }

        if (move.isEnPassant) {
            this.boardArr[move.toRow][move.toCol] = null;
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = move.captured;
        }

        // --- NEW: Restore captured piece to piece list ---
        if (move.captured && !move.isPromotion) { // Promotion undo handles it specially
            const list = (move.captured.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
            list.push(move.captured);
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
        // Return incremental score + new positional terms
        const positional = this.getPositionalScore();
        const score = this.whiteEvalScore + positional;
        return perspectiveColor === PlayerColor.WHITE ? score : -score;
    }

    getPositionalScore() {
        let score = 0;

        // 1. Mobility & Piece Activity
        // (Simplified: just counting pseudo-legal moves for non-pawns is a good proxy)
        // We can't easily iterate all moves without being slow, so we'll do lightweight checks.

        // Actually, let's do a Pawn Structure scan. It's O(64) and very important.
        score += this.#evaluatePawnStructure(PlayerColor.WHITE) - this.#evaluatePawnStructure(PlayerColor.BLACK);

        // King Safety (Keep pawns in front of king)
        score += this.#evaluateKingSafety(this.whiteKing, PlayerColor.WHITE) - this.#evaluateKingSafety(this.blackKing, PlayerColor.BLACK);

        return score;
    }

    #evaluatePawnStructure(color) {
        let score = 0;
        const pawns = color === PlayerColor.WHITE ? this.whitePieces.filter(p => p instanceof WhitePawn) : this.blackPieces.filter(p => p instanceof BlackPawn);
        const opponentColor = this.#getOpponentColor(color);
        const fileHasPawn = new Array(8).fill(false);

        for (const p of pawns) {
            fileHasPawn[p.col] = true;
        }

        for (const p of pawns) {
            // Doubled Pawns (Penalty)
            // check if another pawn of same color is on same file
            // (Passed pawn logic is complex, let's stick to doubled/isolated first)

            // Isolated Pawn (No pawns on adjacent files)
            let isIsolated = true;
            if (p.col > 0 && fileHasPawn[p.col - 1]) isIsolated = false;
            if (p.col < 7 && fileHasPawn[p.col + 1]) isIsolated = false;

            if (isIsolated) score -= 20;

            // Passed Pawn (Bonus)
            // We need to check if open file ahead... expensive-ish?
            // Let's just do Passed Pawn check: no opponent pawns in front or adjacent columns in front
            if (this.#isPassedPawn(p, color)) {
                const rank = color === PlayerColor.WHITE ? (7 - p.row) : p.row;
                // Quadratic bonus to encourage pushing: 7th rank is HUGE.
                // Rank 4: 16*10 = 160. Rank 5: 25*10 = 250. Diff = 90.
                score += rank * rank * 10;
            }
        }

        return score;
    }

    #isPassedPawn(pawn, color) {
        const dir = color === PlayerColor.WHITE ? -1 : 1;
        const opponentPawnClass = color === PlayerColor.WHITE ? BlackPawn : WhitePawn;

        // Scan files: col-1, col, col+1
        const startRow = pawn.row + dir;
        const endRow = color === PlayerColor.WHITE ? 0 : 7;

        for (let r = startRow; color === PlayerColor.WHITE ? r >= endRow : r <= endRow; r += dir) {
            for (let c = pawn.col - 1; c <= pawn.col + 1; c++) {
                if (c >= 0 && c < 8) {
                    const piece = this.boardArr[r][c];
                    if (piece instanceof opponentPawnClass) return false;
                }
            }
        }
        return true;
    }

    #evaluateKingSafety(king, color) {
        if (!king) return 0;
        let score = 0;
        const pawnClass = color === PlayerColor.WHITE ? WhitePawn : BlackPawn;

        // Helper: Check pawn shield directly in front
        // King at g1 -> check f2, g2, h2
        // We mostly care about castled kings (on g or c file mostly)

        if (king.col > 4 || king.col < 3) { // Castled-ish position
            const forward = color === PlayerColor.WHITE ? -1 : 1;
            const r = king.row + forward;
            if (r >= 0 && r < 8) {
                for (let c = king.col - 1; c <= king.col + 1; c++) {
                    if (c >= 0 && c < 8) {
                        const p = this.boardArr[r][c];
                        if (p instanceof pawnClass) score += 20; // Shield bonus
                        else if (p === null) score -= 10; // Open file near king penalty
                    }
                }
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
    [WhitePawn, PST_TABLES["PAWN"]],
    [BlackPawn, PST_TABLES["PAWN"]],

    [WhiteKnight, PST_TABLES["KNIGHT"]],
    [BlackKnight, PST_TABLES["KNIGHT"]],

    [WhiteBishop, PST_TABLES["BISHOP"]],
    [BlackBishop, PST_TABLES["BISHOP"]],

    [WhiteRook, PST_TABLES["ROOK"]],
    [BlackRook, PST_TABLES["ROOK"]],

    [WhiteQueen, PST_TABLES["QUEEN"]],
    [BlackQueen, PST_TABLES["QUEEN"]],

    [WhiteKing, PST_TABLES["KING"]],
    [BlackKing, PST_TABLES["KING"]],
]);