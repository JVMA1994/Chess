class Zobrist {
    constructor() {
        // [color 0..1][piece 0..5][square 0..63]
        this.pieceKeys = new Array(2).fill(null).map(() =>
            new Array(6).fill(null).map(() =>
                new Array(64).fill(0n)
            )
        );
        // Castling rights: 4 bits mask (0-15)
        // bit 0: White King Side
        // bit 1: White Queen Side
        // bit 2: Black King Side
        // bit 3: Black Queen Side
        this.castlingKeys = new Array(16).fill(0n);

        // En Passant file (0-7), or no EP (8 possibilities? Or 1 key per file)
        // Typically 8 keys for files a-h. If no EP, XOR nothing.
        this.enPassantKeys = new Array(8).fill(0n);

        this.sideKey = 0n;

        this.initKeys();
    }

    initKeys() {
        const rand64 = () => {
            return BigInt(Math.floor(Math.random() * 0xFFFFFFFF)) << 32n | BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
        };

        for (let c = 0; c < 2; c++) {
            for (let p = 0; p < 6; p++) {
                for (let s = 0; s < 64; s++) {
                    this.pieceKeys[c][p][s] = rand64();
                }
            }
        }

        for (let i = 0; i < 16; i++) {
            this.castlingKeys[i] = rand64();
        }

        for (let f = 0; f < 8; f++) {
            this.enPassantKeys[f] = rand64();
        }

        this.sideKey = rand64();
    }

    /**
     * Computes the Zobrist hash of the current board state.
     * @param {Board} board - The board object.
     * @param {string} colorToMove - 'white' or 'black' (or PlayerColor enum).
     * @returns {bigint} - The 64-bit hash.
     */
    computeHash(board, colorToMove) {
        let hash = 0n;

        // 1. Pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board.boardArr[r][c];
                if (piece) {
                    const colorIdx = (piece.color === 'white' || piece.color === 'WHITE') ? 0 : 1;
                    const typeIdx = piece.type; // 0-5
                    const square = r * 8 + c;

                    if (typeIdx !== null && typeIdx >= 0 && typeIdx <= 5) {
                        hash ^= this.pieceKeys[colorIdx][typeIdx][square];
                    }
                }
            }
        }

        // 2. Side to move
        if (colorToMove === 'black' || colorToMove === 'BLACK') {
            hash ^= this.sideKey;
        }

        // 3. Castling Rights
        const castlingMask = this.getCastlingMask(board);
        hash ^= this.castlingKeys[castlingMask];

        // 4. En Passant
        if (board.enPassantTargetSquare) {
            hash ^= this.enPassantKeys[board.enPassantTargetSquare.col];
        }

        return hash;
    }

    getCastlingMask(board) {
        // bit 0: W_KS, 1: W_QS, 2: B_KS, 3: B_QS
        let mask = 0;

        // White
        // Note: checking if King/Rook moved.
        // Needs access to pieces. using safe getters if possible or direct array access.
        // Assuming standard initial positions for rooks.

        // White King at 7,4?
        const wk = board.whiteKing; // Assuming board tracks kings? undefined in board.js outline?
        // Board outline showed whiteKing/blackKing fields.

        // Actually board.whiteKing might be null if captured (not possible for King) 
        // or just reference.

        // But correct check:
        // White King Side: White King not moved AND Rook at 7,7 not moved.
        // If King is missing (shouldn't happen), then 0.

        // We need to find the King. Board usually has `this.whiteKing` reference.
        // Let's assume board keeps these references compliant with `piece.js`.

        // White
        if (board.whiteKing && !board.whiteKing.hasMoved) {
            const wrk = board.boardArr[7][7];
            const wrq = board.boardArr[7][0];

            // KingSide
            if (wrk && wrk.type === 3 && wrk.color === board.whiteKing.color && !wrk.hasMoved) {
                mask |= 1;
            }
            // QueenSide
            if (wrq && wrq.type === 3 && wrq.color === board.whiteKing.color && !wrq.hasMoved) {
                mask |= 2;
            }
        }

        // Black
        if (board.blackKing && !board.blackKing.hasMoved) {
            const brk = board.boardArr[0][7];
            const brq = board.boardArr[0][0];

            // KingSide
            if (brk && brk.type === 3 && brk.color === board.blackKing.color && !brk.hasMoved) {
                mask |= 4;
            }
            // QueenSide
            if (brq && brq.type === 3 && brq.color === board.blackKing.color && !brq.hasMoved) {
                mask |= 8;
            }
        }

        return mask;
    }
}

// Global instance
const zobrist = new Zobrist();
