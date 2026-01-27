/**
 * Test-friendly module exports for chess game classes
 * This file re-exports all classes for use in Jest tests
 */

// Constants - define without DOM dependency
const PlayerColor = Object.freeze({
    WHITE: 'WHITE',
    BLACK: 'BLACK'
});

const GameState = Object.freeze({
    NOT_STARTED: 'NOT_STARTED',
    SETUP: 'SETUP',
    WHITE_TURN: 'WHITE_TURN',
    BLACK_TURN: 'BLACK_TURN',
    WHITE_PROMOTING: 'WHITE_PROMOTING',
    BLACK_PROMOTING: 'BLACK_PROMOTING',
    CHECKMATE_WHITE_WINS: 'CHECKMATE_WHITE_WINS',
    CHECKMATE_BLACK_WINS: 'CHECKMATE_BLACK_WINS',
    STALEMATE: 'STALEMATE',
    DRAW_BY_AGREEMENT: 'DRAW_BY_AGREEMENT',
    DRAW_BY_INSUFFICIENT_MATERIAL: 'DRAW_BY_INSUFFICIENT_MATERIAL',
    DRAW_BY_FIFTY_MOVE_RULE: 'DRAW_BY_FIFTY_MOVE_RULE',
    DRAW_BY_THREEFOLD_REPETITION: 'DRAW_BY_THREEFOLD_REPETITION',
    PAUSED: 'PAUSED',
    CONTINUE: 'CONTINUE',
    RESIGNED_WHITE: 'RESIGNED_WHITE',
    RESIGNED_BLACK: 'RESIGNED_BLACK',
    ABANDONED: 'ABANDONED',
    TIMEOUT_WHITE: 'TIMEOUT_WHITE',
    TIMEOUT_BLACK: 'TIMEOUT_BLACK'
});

const KNIGHT_OFFSETS = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1]
];

const KING_OFFSETS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
];

const ROOK_DIRS = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
];

const BISHOP_DIRS = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];

// Move class
class Move {
    constructor(fromRow, fromCol, toRow, toCol) {
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
        this.piece = null;
        this.captured = null;
        this.isCastling = false;
        this.rookFromCol = null;
        this.rookToCol = null;
        this.isEnPassant = false;
        this.capturedPawnRow = null;
        this.capturedPawnCol = null;
        this.isPromotion = false;
        this.promotionPiece = null;
        this.prevHasMoved = false;
        this.prevRookHasMoved = false;
    }

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

// Piece classes
class Piece {
    constructor(img, color, row, col) {
        this.image = img;
        this.color = color;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.drag = false;
    }

    isValidMove(board, targetRow, targetCol) {
        return this.isInsideBoard(targetRow, targetCol);
    }

    getPseudoLegalMoves(board) {
        return [];
    }

    getX() {
        return this.col * 80;
    }

    getY() {
        return this.row * 80;
    }

    isInsideBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
}

class King extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        if (board.boardArr[targetRow][targetCol] === null ||
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[0, -1], [0, 1], [1, 0], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        let moves = [];
        direction.forEach(dir => {
            let r = this.row;
            let c = this.col;
            if (this.isValidMove(board, r + dir[0], c + dir[1])) {
                r += dir[0];
                c += dir[1];
                moves.push(new Move(this.row, this.col, r, c));
            }
        });
        return moves;
    }
}

class WhiteKing extends King {
    constructor(img) {
        super(img, PlayerColor.WHITE, 7, 4);
    }

    checkKingSideCastling(board) {
        const rook = board.getPiece(7, 7);
        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
            return false;
        const f1 = board.getPiece(7, 5);
        const g1 = board.getPiece(7, 6);
        if (f1 || g1)
            return false;
        return !(board.isSquareAttacked(7, 5, PlayerColor.BLACK) || board.isSquareAttacked(7, 6, PlayerColor.BLACK));
    }

    checkQueenSideCastling(board) {
        const rook = board.getPiece(7, 0);
        if (!rook || rook.color !== this.color || rook.hasMoved)
            return false;
        const b1 = board.getPiece(7, 1);
        const c1 = board.getPiece(7, 2);
        const d1 = board.getPiece(7, 3);
        if (b1 || c1 || d1)
            return false;
        return !(board.isSquareAttacked(7, 3, PlayerColor.BLACK) ||
            board.isSquareAttacked(7, 2, PlayerColor.BLACK));
    }

    getPseudoLegalMoves(board) {
        let moves = super.getPseudoLegalMoves(board);
        if (this.hasMoved)
            return moves;
        if (board.isKingInCheck(this.color))
            return moves;
        if (this.checkKingSideCastling(board)) {
            moves.push(Move.castling(this.row, this.col, 7, 6, 7, 5));
        }
        if (this.checkQueenSideCastling(board)) {
            moves.push(Move.castling(this.row, this.col, 7, 2, 0, 3));
        }
        return moves;
    }
}

class BlackKing extends King {
    constructor(img) {
        super(img, PlayerColor.BLACK, 0, 4);
    }

    checkKingSideCastling(board) {
        const rook = board.getPiece(0, 7);
        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
            return false;
        const f8 = board.getPiece(0, 5);
        const g8 = board.getPiece(0, 6);
        if (f8 || g8)
            return false;
        return !(board.isSquareAttacked(0, 5, PlayerColor.WHITE) || board.isSquareAttacked(0, 6, PlayerColor.WHITE));
    }

    checkQueenSideCastling(board) {
        const rook = board.getPiece(0, 0);
        if (!rook || rook.color !== this.color || rook.hasMoved)
            return false;
        const b8 = board.getPiece(0, 1);
        const c8 = board.getPiece(0, 2);
        const d8 = board.getPiece(0, 3);
        if (b8 || c8 || d8)
            return false;
        return !(board.isSquareAttacked(0, 3, PlayerColor.WHITE) ||
            board.isSquareAttacked(0, 2, PlayerColor.WHITE));
    }

    getPseudoLegalMoves(board) {
        let moves = super.getPseudoLegalMoves(board);
        if (this.hasMoved)
            return moves;
        if (board.isKingInCheck(this.color))
            return moves;
        if (this.checkKingSideCastling(board)) {
            moves.push(Move.castling(this.row, this.col, 0, 6, 7, 5));
        }
        if (this.checkQueenSideCastling(board)) {
            moves.push(Move.castling(this.row, this.col, 0, 2, 0, 3));
        }
        return moves;
    }
}

class Queen extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        if (board.boardArr[targetRow][targetCol] === null ||
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[0, -1], [0, 1], [1, 0], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        let moves = [];
        direction.forEach(dir => {
            let r = this.row;
            let c = this.col;
            while (this.isValidMove(board, r + dir[0], c + dir[1])) {
                r += dir[0];
                c += dir[1];
                moves.push(new Move(this.row, this.col, r, c));
                if (board.boardArr[r][c] !== null && board.boardArr[r][c].color !== this.color)
                    break;
            }
        });
        return moves;
    }
}

class WhiteQueen extends Queen {
    constructor(img) {
        super(img, PlayerColor.WHITE, 7, 3);
    }
}

class BlackQueen extends Queen {
    constructor(img) {
        super(img, PlayerColor.BLACK, 0, 3);
    }
}

class Rook extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        if (board.boardArr[targetRow][targetCol] === null ||
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[0, -1], [0, 1], [1, 0], [-1, 0]];
        let moves = [];
        direction.forEach(dir => {
            let r = this.row;
            let c = this.col;
            while (this.isValidMove(board, r + dir[0], c + dir[1])) {
                r += dir[0];
                c += dir[1];
                moves.push(new Move(this.row, this.col, r, c));
                if (board.boardArr[r][c] !== null && board.boardArr[r][c].color !== this.color)
                    break;
            }
        });
        return moves;
    }
}

class WhiteRook extends Rook {
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col);
    }
}

class BlackRook extends Rook {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 0, col);
    }
}

class Bishop extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        if (board.boardArr[targetRow][targetCol] === null ||
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        let moves = [];
        direction.forEach(dir => {
            let r = this.row;
            let c = this.col;
            while (this.isValidMove(board, r + dir[0], c + dir[1])) {
                r += dir[0];
                c += dir[1];
                moves.push(new Move(this.row, this.col, r, c));
                if (board.boardArr[r][c] !== null && board.boardArr[r][c].color !== this.color)
                    break;
            }
        });
        return moves;
    }
}

class WhiteBishop extends Bishop {
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col);
    }
}

class BlackBishop extends Bishop {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 0, col);
    }
}

class Knight extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        if (board.boardArr[targetRow][targetCol] === null ||
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[-2, 1], [-2, -1], [2, 1], [2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]];
        let moves = [];
        direction.forEach(dir => {
            if (this.isValidMove(board, this.row + dir[0], this.col + dir[1])) {
                moves.push(new Move(this.row, this.col, this.row + dir[0], this.col + dir[1]));
            }
        });
        return moves;
    }
}

class WhiteKnight extends Knight {
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col);
    }
}

class BlackKnight extends Knight {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 0, col);
    }
}

class Pawn extends Piece {
    constructor(img, row, col, color) {
        super(img, color, row, col);
    }
}

class WhitePawn extends Pawn {
    constructor(img, col) {
        super(img, 6, col, PlayerColor.WHITE);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) {
            return false;
        }
        const rowDiff = targetRow - this.row;
        const colDiff = Math.abs(targetCol - this.col);
        if (colDiff === 0) {
            if (rowDiff === -1 && board.boardArr[targetRow][targetCol] === null) {
                return true;
            }
            if (!this.hasMoved && rowDiff === -2 &&
                board.boardArr[this.row - 1][this.col] === null &&
                board.boardArr[targetRow][targetCol] === null) {
                return true;
            }
        }
        if (rowDiff === -1 && colDiff === 1 &&
            board.boardArr[targetRow][targetCol] !== null &&
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[-1, 0], [-2, 0], [-1, -1], [-1, 1]];
        let moves = [];
        direction.forEach(dir => {
            if (this.isValidMove(board, this.row + dir[0], this.col + dir[1])) {
                moves.push(new Move(this.row, this.col, this.row + dir[0], this.col + dir[1]));
            }
        });
        let diagonalSquares = [[-1, -1], [-1, 1]];
        if (board.enPassantTargetSquare) {
            diagonalSquares.forEach(dir => {
                if (board.enPassantTargetSquare.row === this.row + dir[0] && board.enPassantTargetSquare.col === this.col + dir[1]) {
                    moves.push(Move.enPassant(this.row, this.col, this.row + dir[0], this.col + dir[1], this.row, this.col + dir[1]));
                }
            });
        }
        return moves;
    }
}

class BlackPawn extends Pawn {
    constructor(img, col) {
        super(img, 1, col, PlayerColor.BLACK);
    }

    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;
        const rowDiff = targetRow - this.row;
        const colDiff = Math.abs(targetCol - this.col);
        if (colDiff === 0) {
            if (rowDiff === 1 && board.boardArr[targetRow][targetCol] === null) {
                return true;
            }
            if (!this.hasMoved && rowDiff === 2 &&
                board.boardArr[this.row + 1][this.col] === null &&
                board.boardArr[targetRow][targetCol] === null) {
                return true;
            }
        }
        if (rowDiff === 1 && colDiff === 1 &&
            board.boardArr[targetRow][targetCol] !== null &&
            board.boardArr[targetRow][targetCol].color !== this.color) {
            return true;
        }
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[1, 0], [2, 0], [1, -1], [1, 1]];
        let moves = [];
        direction.forEach(dir => {
            if (this.isValidMove(board, this.row + dir[0], this.col + dir[1])) {
                moves.push(new Move(this.row, this.col, this.row + dir[0], this.col + dir[1]));
            }
        });
        let diagonalSquares = [[1, -1], [1, 1]];
        if (board.enPassantTargetSquare) {
            diagonalSquares.forEach(dir => {
                if (board.enPassantTargetSquare.row === this.row + dir[0] && board.enPassantTargetSquare.col === this.col + dir[1]) {
                    moves.push(Move.enPassant(this.row, this.col, this.row + dir[0], this.col + dir[1], this.row, this.col + dir[1]));
                }
            });
        }
        return moves;
    }
}

// Board class
class Board {
    constructor() {
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.blackPieces = [];
        this.whitePieces = [];
        this.blackKing = null;
        this.whiteKing = null;
        this.legalMovesForAPieceCache = new Map();
        this.enPassantTargetSquare = null;
        this.previousEnPassantTargetSquare = null;
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
    }

    getPiece(row, col) {
        return this.boardArr[row][col];
    }

    getLegalMoveOrNull(piece, move) {
        const cachedMoves = this.legalMovesForAPieceCache?.get(piece);
        const moves = cachedMoves ?? this.getLegalMovesOfPiece(piece);
        return moves.find(m => m.toRow === move.toRow && m.toCol === move.toCol);
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
        if (this._isStaleMate(isKingInCheck, legalMoves)) {
            return GameState.STALEMATE;
        }
        if (this._isCheckMate(isKingInCheck, legalMoves)) {
            return PlayerColor.WHITE === color ? GameState.CHECKMATE_BLACK_WINS : GameState.CHECKMATE_WHITE_WINS;
        }
        return GameState.CONTINUE;
    }

    _isStaleMate(isKingInCheck, legalMoves) {
        if (isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    _isCheckMate(isKingInCheck, legalMoves) {
        if (!isKingInCheck)
            return false;
        return legalMoves.length === 0;
    }

    makeMove(move) {
        this.previousEnPassantTargetSquare = this.enPassantTargetSquare;
        this.enPassantTargetSquare = null;
        const piece = this.boardArr[move.fromRow][move.fromCol];
        move.captured = this.boardArr[move.toRow][move.toCol];
        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;
        piece.row = move.toRow;
        piece.col = move.toCol;
        move.prevHasMoved = piece.hasMoved;
        piece.hasMoved = true;
        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookFromCol];
            this.boardArr[piece.row][move.rookFromCol] = null;
            this.boardArr[piece.row][move.rookToCol] = rook;
            move.prevRookHasMoved = rook.hasMoved;
            rook.hasMoved = true;
        }
        if (move.isEnPassant) {
            move.captured = this.boardArr[move.capturedPawnRow][move.capturedPawnCol];
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = null;
        }
        if (Math.abs(move.toRow - move.fromRow) === 2) {
            if (piece instanceof WhitePawn)
                this.enPassantTargetSquare = { row: move.toRow + 1, col: move.toCol };
            else if (piece instanceof BlackPawn)
                this.enPassantTargetSquare = { row: move.toRow - 1, col: move.toCol };
        }
    }

    undoMove(move) {
        this.enPassantTargetSquare = this.previousEnPassantTargetSquare;
        const piece = this.boardArr[move.toRow][move.toCol];
        this.boardArr[move.toRow][move.toCol] = move.captured;
        this.boardArr[move.fromRow][move.fromCol] = piece;
        piece.row = move.fromRow;
        piece.col = move.fromCol;
        piece.hasMoved = move.prevHasMoved;
        if (move.isCastling) {
            const rook = this.boardArr[move.toRow][move.rookToCol];
            this.boardArr[move.toRow][move.rookToCol] = null;
            this.boardArr[move.fromRow][move.rookFromCol] = rook;
            rook.hasMoved = move.prevRookHasMoved;
        }
        if (move.isEnPassant) {
            this.boardArr[move.toRow][move.toCol] = null;
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = move.captured;
        }
    }

    isKingInCheck(color) {
        const king = color === PlayerColor.WHITE ? this.whiteKing : this.blackKing;
        return this.isSquareAttacked(king.row, king.col, this._getOpponentColor(color));
    }

    isSquareAttacked(row, col, byColor) {
        return (
            this._isPawnAttack(row, col, byColor) ||
            this._isKnightAttack(row, col, byColor) ||
            this._isSlidingAttack(row, col, byColor, ROOK_DIRS, Rook) ||
            this._isSlidingAttack(row, col, byColor, BISHOP_DIRS, Bishop) ||
            this._isKingAttack(row, col, byColor)
        );
    }

    _isKnightAttack(row, col, color) {
        for (const [dr, dc] of KNIGHT_OFFSETS) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this._isInsideBoard(newRow, newCol)) {
                let piece = this.boardArr[newRow][newCol];
                if (piece && piece.color === color && piece instanceof Knight) {
                    return true;
                }
            }
        }
        return false;
    }

    _isPawnAttack(row, col, color) {
        const dir = color === PlayerColor.WHITE ? 1 : -1;
        const pawnClass = color === PlayerColor.WHITE ? WhitePawn : BlackPawn;
        for (const c of [-1, 1]) {
            const newRow = row + dir;
            const newCol = col + c;
            if (this._isInsideBoard(newRow, newCol)) {
                let piece = this.boardArr[newRow][newCol];
                if (piece && piece instanceof pawnClass) {
                    return true;
                }
            }
        }
        return false;
    }

    _isKingAttack(row, col, color) {
        for (const [dr, dc] of KING_OFFSETS) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (this._isInsideBoard(newRow, newCol)) {
                const p = this.boardArr[newRow][newCol];
                if (p && p.color === color && p instanceof King) {
                    return true;
                }
            }
        }
        return false;
    }

    _isSlidingAttack(row, col, color, dir, pieceClass) {
        for (const [dr, dc] of dir) {
            let newRow = row + dr;
            let newCol = col + dc;
            while (this._isInsideBoard(newRow, newCol)) {
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

    _getOpponentColor(color) {
        return PlayerColor.WHITE === color ? PlayerColor.BLACK : PlayerColor.WHITE;
    }

    _isInsideBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    cacheLegalMoves(draggedPiece, legalMoves) {
        this.legalMovesForAPieceCache.set(draggedPiece, legalMoves);
    }

    evictLegalMovesCache() {
        this.legalMovesForAPieceCache.clear();
    }

    getCachedMoves(piece) {
        return this.legalMovesForAPieceCache.get(piece);
    }
}

// Export for testing
module.exports = {
    PlayerColor,
    GameState,
    Move,
    Piece,
    King,
    WhiteKing,
    BlackKing,
    Queen,
    WhiteQueen,
    BlackQueen,
    Rook,
    WhiteRook,
    BlackRook,
    Bishop,
    WhiteBishop,
    BlackBishop,
    Knight,
    WhiteKnight,
    BlackKnight,
    Pawn,
    WhitePawn,
    BlackPawn,
    Board,
    KNIGHT_OFFSETS,
    KING_OFFSETS,
    ROOK_DIRS,
    BISHOP_DIRS
};
