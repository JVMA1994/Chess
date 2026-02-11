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

const PromotionType = Object.freeze({
    QUEEN: 'QUEEN',
    ROOK: 'ROOK',
    BISHOP: 'BISHOP',
    KNIGHT: 'KNIGHT'
});

const PieceType = {
    PAWN: 0,
    KNIGHT: 1,
    BISHOP: 2,
    ROOK: 3,
    QUEEN: 4,
    KING: 5
};

const PST_TABLES = {

    PAWN: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],

    KNIGHT: [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50],
    ],

    BISHOP: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20],
    ],

    ROOK: [
        [0, 0, 5, 10, 10, 5, 0, 0],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],

    QUEEN: [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20],
    ],

    KING: [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20],
    ]

};

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
        this.type = null;
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
        this.type = PieceType.KING;
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
        // console.log('checkKingSideCastling: rook at 7,7 is', rook);
        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
            return false;

        console.log('checkKingSideCastling: Rook check PASSED! This should NOT happen if empty.');
        console.log('Rook details:', rook.color, rook.row, rook.col, rook.hasMoved);

        const f1 = board.getPiece(7, 5);
        const g1 = board.getPiece(7, 6);
        if (f1 || g1)
            return false;
        return !(board.isSquareAttacked(7, 5, PlayerColor.BLACK) || board.isSquareAttacked(7, 6, PlayerColor.BLACK));
    }

    checkQueenSideCastling(board) {
        const rook = board.getPiece(7, 0);
        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
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
        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
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
        this.type = PieceType.QUEEN;
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
        this.type = PieceType.ROOK;
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
        this.type = PieceType.BISHOP;
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
        this.type = PieceType.KNIGHT;
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
        this.type = PieceType.PAWN;
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
        const lastRank = 0; // 0th row is the last rank for White Pawn
        const direction = [[-1, 0], [-2, 0], [-1, -1], [-1, 1]];
        const moves = [];
        direction.forEach(dir => {
            const targetRow = this.row + dir[0];
            const targetCol = this.col + dir[1];
            if (this.isValidMove(board, targetRow, targetCol)) {
                if (targetRow === lastRank) {
                    for (const type of [PromotionType.QUEEN, PromotionType.ROOK, PromotionType.BISHOP, PromotionType.KNIGHT]) {
                        moves.push(Move.promotion(this.row, this.col, targetRow, targetCol, type));
                    }
                }
                else
                    moves.push(new Move(this.row, this.col, targetRow, targetCol));
            }
            if (Math.abs(dir[1]) === 1 && board.enPassantTargetSquare && board.enPassantTargetSquare.row === targetRow && board.enPassantTargetSquare.col === targetCol) {
                moves.push(Move.enPassant(this.row, this.col, targetRow, targetCol, this.row, targetCol));
            }
        });
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
        const lastRank = 7; // 7th row is the last rank for Black Pawn
        const direction = [[1, 0], [2, 0], [1, -1], [1, 1]];
        const moves = [];
        direction.forEach(dir => {
            const targetRow = this.row + dir[0];
            const targetCol = this.col + dir[1];
            if (this.isValidMove(board, targetRow, targetCol)) {
                if (targetRow === lastRank) {
                    for (const type of [PromotionType.QUEEN, PromotionType.ROOK, PromotionType.BISHOP, PromotionType.KNIGHT]) {
                        moves.push(Move.promotion(this.row, this.col, targetRow, targetCol, type));
                    }
                }
                else
                    moves.push(new Move(this.row, this.col, targetRow, targetCol));
            }
            if (Math.abs(dir[1]) === 1 && board.enPassantTargetSquare && board.enPassantTargetSquare.row === targetRow && board.enPassantTargetSquare.col === targetCol) {
                moves.push(Move.enPassant(this.row, this.col, targetRow, targetCol, this.row, targetCol));
            }
        });
        return moves;
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
        this.zobristKey = 0n;
        this.castlingRights = 15;
        this.whiteEvalScore = 0;
    }

    initializeBoard() {
        this.whiteEvalScore = 0;
        this.zobristKey = 0n;
        this.blackPieces = [];
        this.whitePieces = [];
        this.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));

        this.placePiece(new BlackRook(null, 0));
        this.placePiece(new BlackKnight(null, 1));
        this.placePiece(new BlackBishop(null, 2));
        this.placePiece(new BlackQueen(null));
        this.placePiece(new BlackKing(null));
        this.placePiece(new BlackBishop(null, 5));
        this.placePiece(new BlackKnight(null, 6));
        this.placePiece(new BlackRook(null, 7));
        for (let col = 0; col < 8; col++) this.placePiece(new BlackPawn(null, col));

        this.placePiece(new WhiteRook(null, 0));
        this.placePiece(new WhiteKnight(null, 1));
        this.placePiece(new WhiteBishop(null, 2));
        this.placePiece(new WhiteQueen(null));
        this.placePiece(new WhiteKing(null));
        this.placePiece(new WhiteBishop(null, 5));
        this.placePiece(new WhiteKnight(null, 6));
        this.placePiece(new WhiteRook(null, 7));
        for (let col = 0; col < 8; col++) this.placePiece(new WhitePawn(null, col));

        this.zobristKey = zobrist.computeHash(this, PlayerColor.WHITE);
        this.castlingRights = zobrist.getCastlingMask(this);
    }

    placePiece(piece) {
        if (PlayerColor.WHITE === piece.color) this.whitePieces.push(piece);
        else this.blackPieces.push(piece);
        this.boardArr[piece.row][piece.col] = piece;
        if (piece instanceof WhiteKing) this.whiteKing = piece;
        if (piece instanceof BlackKing) this.blackKing = piece;
        this._togglePieceState(piece, piece.row, piece.col, true);
    }

    getPiece(row, col) { return this.boardArr[row][col]; }

    getLegalMovesOfPiece(piece) {
        return piece.getPseudoLegalMoves(this).filter(move => {
            this.makeMove(move);
            const inCheck = this.isKingInCheck(piece.color);
            this.undoMove(move);
            return !inCheck;
        });
    }

    getLegalMoves(color) {
        let legalMoves = [];
        const pieces = color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;
        for (const piece of pieces) {
            if (this.boardArr[piece.row][piece.col] === piece) {
                const moves = piece.getPseudoLegalMoves(this);
                for (const m of moves) {
                    this.makeMove(m);
                    if (!this.isKingInCheck(color)) {
                        legalMoves.push(m);
                    }
                    this.undoMove(m);
                }
            }
        }
        return legalMoves;
    }

    getLegalMoveOrNull(piece, move) {
        const moves = this.getLegalMovesOfPiece(piece);
        return moves.find(m => m.toRow === move.toRow && m.toCol === move.toCol);
    }

    evaluateGameState(color) {
        const isKingInCheck = this.isKingInCheck(color);
        let legalMoves = this.getLegalMoves(color);
        if (legalMoves.length === 0) {
            return isKingInCheck ? (color === PlayerColor.WHITE ? GameState.CHECKMATE_BLACK_WINS : GameState.CHECKMATE_WHITE_WINS) : GameState.STALEMATE;
        }
        return GameState.CONTINUE;
    }

    getCaptures(color) {
        let captures = [];
        const pieces = color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;
        for (const piece of pieces) {
            if (this.boardArr[piece.row][piece.col] === piece) {
                const moves = piece.getPseudoLegalMoves(this);
                for (const m of moves) {
                    if (m.captured || m.isPromotion) {
                        this.makeMove(m);
                        if (!this.isKingInCheck(color)) {
                            captures.push(m);
                        }
                        this.undoMove(m);
                    }
                }
            }
        }
        return captures;
    }

    makeMove(move) {
        move.prevZobristKey = this.zobristKey;
        move.prevCastlingRights = this.castlingRights;
        move.prevWhiteEvalScore = this.whiteEvalScore;
        move.previousEnPassantTargetSquare = this.enPassantTargetSquare;

        this.zobristKey ^= zobrist.sideKey;
        if (this.enPassantTargetSquare) this.zobristKey ^= zobrist.enPassantKeys[this.enPassantTargetSquare.col];

        const piece = this.boardArr[move.fromRow][move.fromCol];
        move.captured = this.boardArr[move.toRow][move.toCol];

        this._togglePieceState(piece, move.fromRow, move.fromCol, false);
        if (move.captured && !move.isEnPassant) this._togglePieceState(move.captured, move.toRow, move.toCol, false);

        this.boardArr[move.fromRow][move.fromCol] = null;
        this.boardArr[move.toRow][move.toCol] = piece;
        piece.row = move.toRow; piece.col = move.toCol;
        move.prevHasMoved = piece.hasMoved; piece.hasMoved = true;
        this.enPassantTargetSquare = null;

        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookFromCol];
            this._togglePieceState(rook, move.fromRow, move.rookFromCol, false);
            this.boardArr[piece.row][move.rookFromCol] = null;
            this.boardArr[piece.row][move.rookToCol] = rook;
            move.prevRookHasMoved = rook.hasMoved; rook.hasMoved = true;
            rook.row = piece.row; rook.col = move.rookToCol;
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
            this.enPassantTargetSquare = { row: (move.toRow + move.fromRow) / 2, col: move.toCol };
            this.zobristKey ^= zobrist.enPassantKeys[this.enPassantTargetSquare.col];
        }

        if (move.isPromotion && move.promotionPiece) {
            move.originalPawn = piece;
            const promotedPiece = this._createPromotedPiece(move.promotionPiece, piece.color, move.toRow, move.toCol);
            this.boardArr[move.toRow][move.toCol] = promotedPiece;
            const pieceList = piece.color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;
            const idx = pieceList.indexOf(piece);
            if (idx !== -1) pieceList.splice(idx, 1);
            pieceList.push(promotedPiece);
            this._togglePieceState(promotedPiece, move.toRow, move.toCol, true);
        } else {
            this._togglePieceState(piece, move.toRow, move.toCol, true);
        }

        this.zobristKey ^= zobrist.castlingKeys[this.castlingRights];
        this.castlingRights = zobrist.getCastlingMask(this);
        this.zobristKey ^= zobrist.castlingKeys[this.castlingRights];
    }

    undoMove(move) {
        this.zobristKey = move.prevZobristKey;
        this.castlingRights = move.prevCastlingRights;
        this.whiteEvalScore = move.prevWhiteEvalScore;
        this.enPassantTargetSquare = move.previousEnPassantTargetSquare;

        const piece = this.boardArr[move.toRow][move.toCol];
        if (move.isPromotion && move.originalPawn) {
            this.boardArr[move.fromRow][move.fromCol] = move.originalPawn;
            move.originalPawn.row = move.fromRow; move.originalPawn.col = move.fromCol;
            const pieceList = move.originalPawn.color === PlayerColor.WHITE ? this.whitePieces : this.blackPieces;
            const idx = pieceList.indexOf(piece);
            if (idx !== -1) pieceList.splice(idx, 1);
            pieceList.push(move.originalPawn);
            this.boardArr[move.toRow][move.toCol] = move.captured;

            // Restore captured piece to list if it was a capture-promotion
            if (move.captured) {
                const opponentList = (move.captured.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
                opponentList.push(move.captured);
            }
        } else {
            this.boardArr[move.toRow][move.toCol] = move.captured;
            this.boardArr[move.fromRow][move.fromCol] = piece;
            piece.row = move.fromRow; piece.col = move.fromCol;

            // Restore captured piece to list
            if (move.captured) {
                const list = (move.captured.color === PlayerColor.WHITE) ? this.whitePieces : this.blackPieces;
                list.push(move.captured);
            }
        }
        piece.hasMoved = move.prevHasMoved;

        if (move.isCastling) {
            const rook = this.boardArr[move.fromRow][move.rookToCol];
            this.boardArr[move.fromRow][move.rookToCol] = null;
            this.boardArr[move.fromRow][move.rookFromCol] = rook;
            rook.hasMoved = move.prevRookHasMoved;
            rook.row = move.fromRow; rook.col = move.rookFromCol;
        }

        if (move.isEnPassant) {
            this.boardArr[move.toRow][move.toCol] = null;
            this.boardArr[move.capturedPawnRow][move.capturedPawnCol] = move.captured;
        }
    }

    _togglePieceState(piece, row, col, isAdding) {
        if (!piece) return;
        const colorIdx = (piece.color === PlayerColor.WHITE) ? 0 : 1;
        const squareIdx = row * 8 + col;
        if (piece.type !== null) this.zobristKey ^= zobrist.pieceKeys[colorIdx][piece.type][squareIdx];
        const val = (PIECE_VALUE.get(piece.constructor) || 0) + this._getPSTValue(piece, row, col);
        this.whiteEvalScore += (isAdding ? 1 : -1) * (piece.color === PlayerColor.WHITE ? val : -val);
    }

    _getPSTValue(piece, row, col) {
        const table = PST.get(piece.constructor);
        if (!table) return 0;
        return piece.color === PlayerColor.WHITE ? table[row][col] : table[7 - row][col];
    }

    evaluateBoard(perspectiveColor) {
        let score = (perspectiveColor === PlayerColor.WHITE ? this.whiteEvalScore : -this.whiteEvalScore);
        return score === 0 ? 0 : score;
    }

    isKingInCheck(color) {
        const king = color === PlayerColor.WHITE ? this.whiteKing : this.blackKing;
        return king ? this.isSquareAttacked(king.row, king.col, getOpponentColor(color)) : false;
    }

    isSquareAttacked(row, col, attackerColor) {
        if (this._isKnightAttack(row, col, attackerColor)) return true;
        if (this._isPawnAttack(row, col, attackerColor)) return true;
        if (this._isKingAttack(row, col, attackerColor)) return true;
        return this._isSlidingAttack(row, col, attackerColor, ROOK_DIRS, [Rook, Queen]) || this._isSlidingAttack(row, col, attackerColor, BISHOP_DIRS, [Bishop, Queen]);
    }

    _isKnightAttack(r, c, color) {
        for (const [dr, dc] of KNIGHT_OFFSETS) {
            const nr = r + dr, nc = c + dc;
            if (this._isInsideBoard(nr, nc)) {
                const p = this.boardArr[nr][nc];
                if (p && p.color === color && p instanceof Knight) return true;
            }
        }
        return false;
    }

    _isPawnAttack(r, c, color) {
        const dr = color === PlayerColor.WHITE ? 1 : -1;
        for (const dc of [-1, 1]) {
            const nc = c + dc;
            if (this._isInsideBoard(r + dr, nc)) {
                const p = this.boardArr[r + dr][nc];
                if (p && p.color === color && p instanceof Pawn) return true;
            }
        }
        return false;
    }

    _isKingAttack(r, c, color) {
        for (const [dr, dc] of KING_OFFSETS) {
            const nr = r + dr, nc = c + dc;
            if (this._isInsideBoard(nr, nc)) {
                const p = this.boardArr[nr][nc];
                if (p && p.color === color && p instanceof King) return true;
            }
        }
        return false;
    }

    _isSlidingAttack(r, c, color, dirs, classes) {
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (this._isInsideBoard(nr, nc)) {
                const p = this.boardArr[nr][nc];
                if (p) {
                    if (p.color === color && classes.some(cls => p instanceof cls)) return true;
                    break;
                }
                nr += dr; nc += dc;
            }
        }
        return false;
    }

    _isInsideBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

    _createPromotedPiece(type, color, r, c) {
        const isWhite = color === PlayerColor.WHITE;
        switch (type) {
            case PromotionType.QUEEN: return isWhite ? new WhiteQueen(null) : new BlackQueen(null);
            case PromotionType.ROOK: return isWhite ? new WhiteRook(null, c) : new BlackRook(null, c);
            case PromotionType.BISHOP: return isWhite ? new WhiteBishop(null, c) : new BlackBishop(null, c);
            case PromotionType.KNIGHT: return isWhite ? new WhiteKnight(null, c) : new BlackKnight(null, c);
            default: return isWhite ? new WhiteQueen(null) : new BlackQueen(null);
        }
    }
}

const CHECKMATE_SCORE = 100000;
const STALEMATE_SCORE = 0;
const SEARCH_STATS = { nodes: 0, startTime: 0, timeLimit: 5000, stop: false };

function findBestMove(board, aiColor, maxDepth) {
    SEARCH_STATS.nodes = 0; SEARCH_STATS.startTime = Date.now(); SEARCH_STATS.stop = false;
    let bestMove = null;
    const moves = board.getLegalMoves(aiColor);
    if (moves.length === 0) return null;
    for (let d = 1; d <= maxDepth; d++) {
        let alpha = -Infinity, beta = Infinity, bestScore = -Infinity, bestAtDepth = null;
        orderMoves(moves, board, tt.getBestMove(board.zobristKey));
        for (const m of moves) {
            board.makeMove(m);
            const s = -negamax(board, d - 1, -beta, -alpha, getOpponentColor(aiColor));
            board.undoMove(m);
            if (SEARCH_STATS.stop) break;
            if (s > bestScore) { bestScore = s; bestAtDepth = m; }
            alpha = Math.max(alpha, bestScore);
        }
        if (SEARCH_STATS.stop) break;
        bestMove = bestAtDepth;
        if (bestScore > CHECKMATE_SCORE - 100) break;
    }
    return bestMove;
}

function negamax(board, depth, alpha, beta, color) {
    SEARCH_STATS.nodes++;
    if ((SEARCH_STATS.nodes & 1023) === 0 && (Date.now() - SEARCH_STATS.startTime > SEARCH_STATS.timeLimit)) SEARCH_STATS.stop = true;
    if (SEARCH_STATS.stop) return 0;

    const h = board.zobristKey;
    const cached = tt.lookup(h, depth, alpha, beta);
    if (cached !== null) return cached;

    if (depth <= 0) return quiescence(board, alpha, beta, color);

    const inCheck = board.isKingInCheck(color);

    // 1. Null Move Pruning (NMP)
    if (depth >= 3 && !inCheck) {
        // Simplified check for "Zugzwang" potential: have at least one minor/major piece
        const pieceList = color === PlayerColor.WHITE ? board.whitePieces : board.blackPieces;
        let hasBigPiece = false;
        for (const p of pieceList) {
            if (p.type !== PieceType.PAWN && p.type !== PieceType.KING) {
                hasBigPiece = true;
                break;
            }
        }

        if (hasBigPiece) {
            const R = depth > 6 ? 3 : 2;
            // Make null move
            board.zobristKey ^= zobrist.sideKey; // toggle side
            if (board.enPassantTargetSquare) board.zobristKey ^= zobrist.enPassantKeys[board.enPassantTargetSquare.col];
            const prevEP = board.enPassantTargetSquare;
            board.enPassantTargetSquare = null;

            const score = -negamax(board, depth - 1 - R, -beta, -beta + 1, getOpponentColor(color));

            // Undo null move
            board.enPassantTargetSquare = prevEP;
            if (board.enPassantTargetSquare) board.zobristKey ^= zobrist.enPassantKeys[board.enPassantTargetSquare.col];
            board.zobristKey ^= zobrist.sideKey;

            if (score >= beta) return beta;
        }
    }

    const moves = board.getLegalMoves(color);
    if (moves.length === 0) return inCheck ? -(CHECKMATE_SCORE - depth) : STALEMATE_SCORE;

    orderMoves(moves, board, tt.getBestMove(h));

    const originalAlpha = alpha;
    let best = -Infinity;
    let bestM = null;
    let movesSearched = 0;

    for (const m of moves) {
        board.makeMove(m);
        movesSearched++;

        let s;
        // 2. Late Move Reductions (LMR)
        if (movesSearched > 4 && depth >= 3 && !inCheck && !m.captured && !m.isPromotion) {
            const reduction = 1;
            s = -negamax(board, depth - 1 - reduction, -alpha - 1, -alpha, getOpponentColor(color));

            // Re-search at full depth if LMR failed to prove this move is bad
            if (s > alpha) {
                s = -negamax(board, depth - 1, -beta, -alpha, getOpponentColor(color));
            }
        } else {
            s = -negamax(board, depth - 1, -beta, -alpha, getOpponentColor(color));
        }

        board.undoMove(m);
        if (SEARCH_STATS.stop) return 0;

        if (s > best) {
            best = s;
            bestM = m;
        }
        alpha = Math.max(alpha, best);
        if (alpha >= beta) break;
    }

    let type = (best <= originalAlpha) ? EntryType.ALPHA : (best >= beta ? EntryType.BETA : EntryType.EXACT);
    tt.store(h, depth, best, type, bestM);
    return best;
}

function quiescence(board, alpha, beta, color) {
    SEARCH_STATS.nodes++;
    let standPat = board.evaluateBoard(color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = board.getCaptures(color);
    orderMoves(moves, board);

    const opponent = getOpponentColor(color);
    for (const move of moves) {
        board.makeMove(move);
        const score = -quiescence(board, -beta, -alpha, opponent);
        board.undoMove(move);

        if (SEARCH_STATS.stop) return 0;
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

function orderMoves(moves, board, ttM = null) {
    for (const m of moves) {
        if (ttM && m.fromRow === ttM.fromRow && m.fromCol === ttM.fromCol && m.toRow === ttM.toRow && m.toCol === ttM.toCol) m._sortScore = 1000000;
        else m._sortScore = scoreMove(m, board);
    }
    moves.sort((a, b) => b._sortScore - a._sortScore);
}

function scoreMove(m, b) {
    const a = b.boardArr[m.fromRow][m.fromCol];
    if (!a) return 0;
    let s = m.captured ? 10 * (PIECE_VALUE.get(m.captured.constructor) || 0) - (PIECE_VALUE.get(a.constructor) || 0) : 0;
    if (m.isPromotion) s += 9000;
    const table = PST.get(a.constructor);
    if (table) {
        const fv = a.color === PlayerColor.WHITE ? table[m.fromRow][m.fromCol] : table[7 - m.fromRow][m.fromCol];
        const tv = a.color === PlayerColor.WHITE ? table[m.toRow][m.toCol] : table[7 - m.toRow][m.toCol];
        s += (tv - fv);
    }
    return s;
}

function getOpponentColor(c) { return c === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE; }

class Zobrist {
    constructor() {
        this.pieceKeys = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 64 }, () => 0n)));
        this.castlingKeys = new Array(16).fill(0n);
        this.enPassantKeys = new Array(8).fill(0n);
        this.sideKey = 0n;
        this.initKeys();
    }
    initKeys() {
        const r = () => BigInt(Math.floor(Math.random() * 0xFFFFFFFF)) << 32n | BigInt(Math.floor(Math.random() * 0xFFFFFFFF));
        for (let c = 0; c < 2; c++) for (let p = 0; p < 6; p++) for (let s = 0; s < 64; s++) this.pieceKeys[c][p][s] = r();
        for (let i = 0; i < 16; i++) this.castlingKeys[i] = r();
        for (let f = 0; f < 8; f++) this.enPassantKeys[f] = r();
        this.sideKey = r();
    }
    computeHash(b, ctm) {
        let h = 0n;
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
            const p = b.boardArr[r][c];
            if (p) h ^= this.pieceKeys[p.color === PlayerColor.WHITE ? 0 : 1][p.type][r * 8 + c];
        }
        if (ctm === PlayerColor.BLACK) h ^= this.sideKey;
        h ^= this.castlingKeys[this.getCastlingMask(b)];
        if (b.enPassantTargetSquare) h ^= this.enPassantKeys[b.enPassantTargetSquare.col];
        return h;
    }
    getCastlingMask(b) {
        let m = 0;
        if (b.whiteKing && !b.whiteKing.hasMoved) {
            const r1 = b.boardArr[7][7], r2 = b.boardArr[7][0];
            if (r1 && r1 instanceof Rook && !r1.hasMoved) m |= 1;
            if (r2 && r2 instanceof Rook && !r2.hasMoved) m |= 2;
        }
        if (b.blackKing && !b.blackKing.hasMoved) {
            const r1 = b.boardArr[0][7], r2 = b.boardArr[0][0];
            if (r1 && r1 instanceof Rook && !r1.hasMoved) m |= 4;
            if (r2 && r2 instanceof Rook && !r2.hasMoved) m |= 8;
        }
        return m;
    }
}
const zobrist = new Zobrist();
const EntryType = { EXACT: 0, ALPHA: 1, BETA: 2 };
class TranspositionTable {
    constructor(s = 65536) { this.size = s; this.table = new Array(s).fill(null); }
    getIndex(h) { let i = Number(h % BigInt(this.size)); return i < 0 ? i + this.size : i; }
    store(h, d, s, t, m) { const i = this.getIndex(h); if (!this.table[i] || this.table[i].depth <= d) this.table[i] = { hash: h, depth: d, score: s, type: t, bestMove: m }; }
    lookup(h, d, a, b) {
        const e = this.table[this.getIndex(h)];
        if (e && e.hash === h && e.depth >= d) {
            if (e.type === EntryType.EXACT) return e.score;
            if (e.type === EntryType.ALPHA && e.score <= a) return e.score;
            if (e.type === EntryType.BETA && e.score >= b) return e.score;
        }
        return null;
    }
    getBestMove(h) { const e = this.table[this.getIndex(h)]; return (e && e.hash === h) ? e.bestMove : null; }
    clear() { this.table.fill(null); }
}
const tt = new TranspositionTable(131072);

module.exports = {
    PlayerColor, GameState, Move, Piece, King, WhiteKing, BlackKing, Queen, WhiteQueen, BlackQueen, Rook, WhiteRook, BlackRook, Bishop, WhiteBishop, BlackBishop, Knight, WhiteKnight, BlackKnight, Pawn, WhitePawn, BlackPawn, Board, KNIGHT_OFFSETS, KING_OFFSETS, ROOK_DIRS, BISHOP_DIRS, PromotionType, PieceType, CHECKMATE_SCORE, findBestMove, negamax, scoreMove, orderMoves, getOpponentColor, zobrist, Zobrist, tt, TranspositionTable, EntryType, quiescence,
};
