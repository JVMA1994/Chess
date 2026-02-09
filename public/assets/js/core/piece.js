class Piece {
    constructor(imgCode, color, row, col) {
        this.imgCode = imgCode;
        this.color = color; // "white" | "black"
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.drag = false;
    }

    isValidMove(board, targetRow, targetCol) {
        return this.isInsideBoard(targetRow, targetCol);
    }

    getPseudoLegalMoves(board) {

    }

    getX() {
        return BOARD_X + this.col * SQUARE_SIZE;
    }

    getY() {
        return BOARD_Y + this.row * SQUARE_SIZE;
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

    /**
     * A king can castle if and only if:
     *
     * King has not moved
     *
     * Corresponding rook has not moved
     *
     * Squares between king and rook are empty
     *
     * King is NOT in check
     *
     * King does NOT pass through check
     *
     * King does NOT end in check
     * @param board
     * @returns {*[]}
     */
    getPseudoLegalMoves(board) {
        let direction = [[0, -1], [0, 1], [1, 0], [-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        let moves = [];
        direction
            .forEach(dir => {
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
    constructor() {
        super(PIECE_CODES.WHITE.KING, PlayerColor.WHITE, 7, 4);
    }

    checkKingSideCastling(board){
        const rook = board.getPiece(7, 7)

        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
            return false

        const f1 = board.getPiece(7, 5)
        const g1 = board.getPiece(7, 6)

        if(f1 || g1)
            return false

        return !(board.isSquareAttacked(7, 5, PlayerColor.BLACK) || board.isSquareAttacked(7, 6, PlayerColor.BLACK));
    }

    checkQueenSideCastling(board) {
        const rook = board.getPiece(7, 0);

        if (!rook || rook.color !== this.color || rook.hasMoved)
            return false;

        const b1 = board.getPiece(7, 1);
        const c1 = board.getPiece(7, 2);
        const d1 = board.getPiece(7, 3);

        // Squares between king and rook must be empty
        if (b1 || c1 || d1)
            return false;

        // King must not pass through or land on attacked squares
        return !(board.isSquareAttacked(7, 3, PlayerColor.BLACK) ||
            board.isSquareAttacked(7, 2, PlayerColor.BLACK));
    }

    getPseudoLegalMoves(board){
        let moves = super.getPseudoLegalMoves(board);
        if(this.hasMoved)
            return moves;
        if(board.isKingInCheck(this.color))
            return moves;

        if(this.checkKingSideCastling(board)){
            moves.push(Move.castling(this.row, this.col, 7, 6, 7, 5));
        }

        if (this.checkQueenSideCastling(board)) {
            moves.push(
                Move.castling(this.row, this.col, 7, 2, 0, 3)
            );
        }
        return moves;
    }
}

class BlackKing extends King {
    constructor() {
        super(PIECE_CODES.BLACK.KING, PlayerColor.BLACK, 0, 4);
    }

    checkKingSideCastling(board){
        const rook = board.getPiece(0, 7)

        if (!rook || rook.color !== this.color || rook.hasMoved || !(rook instanceof Rook))
            return false

        const f8 = board.getPiece(0, 5)
        const g8 = board.getPiece(0, 6)

        if(f8 || g8)
            return false

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

    getPseudoLegalMoves(board){
        let moves = super.getPseudoLegalMoves(board);
        if(this.hasMoved)
            return moves;
        if(board.isKingInCheck(this.color))
            return moves;

        if(this.checkKingSideCastling(board)){
            moves.push(Move.castling(this.row, this.col, 0, 6, 7, 5));
        }

        if (this.checkQueenSideCastling(board)) {
            moves.push(
                Move.castling(this.row, this.col, 0, 2, 0, 3)
            );
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
        direction
            .forEach(dir => {
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
    constructor(col, row = 7) {
        super(PIECE_CODES.WHITE.QUEEN, PlayerColor.WHITE, row, col);
    }
}

class BlackQueen extends Queen {
    constructor(col, row = 0) {
        super(PIECE_CODES.BLACK.QUEEN, PlayerColor.BLACK, row, col);
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
        direction
            .forEach(dir => {
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
    constructor(col, row = 7) {
        super(PIECE_CODES.WHITE.ROOK, PlayerColor.WHITE, row, col); // col: 0 or 7
    }
}

class BlackRook extends Rook {
    constructor(col, row = 0) {
        super(PIECE_CODES.BLACK.ROOK, PlayerColor.BLACK, row, col); // col: 0 or 7
    }
}

class Bishop extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    /**
     * Validates white knight movement.
     */
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
        direction
            .forEach(dir => {
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
    constructor(col, row = 7) {
        super(PIECE_CODES.WHITE.BISHOP, PlayerColor.WHITE, row, col); // col: 2 or 5
    }


}

class BlackBishop extends Bishop {
    constructor(col, row = 0) {
        super(PIECE_CODES.BLACK.BISHOP, PlayerColor.BLACK, row, col);
    }
}

class Knight extends Piece {
    constructor(img, color, row, col) {
        super(img, color, row, col);
    }

    /**
     * Validates white knight movement.
     */
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
        direction
            .forEach(dir => {
                if (this.isValidMove(board, this.row + dir[0], this.col + dir[1])) {
                    moves.push(new Move(this.row, this.col, this.row + dir[0], this.col + dir[1]));
                }
            });
        return moves;
    }

}

class WhiteKnight extends Knight {
    constructor( col, row = 7) {
        super(PIECE_CODES.WHITE.KNIGHT, PlayerColor.WHITE, row, col); // col: 1 or 6
    }
}

class BlackKnight extends Knight {
    constructor( col, row = 0) {
        super(PIECE_CODES.BLACK.KNIGHT, PlayerColor.BLACK, row, col); // col: 1 or 6
    }
}

class Pawn extends Piece {
    constructor(img, row, col, color) {
        super(img, color, row, col); // col: 0–7
    }
}
class WhitePawn extends Pawn {
    constructor(col) {
        super(PIECE_CODES.WHITE.PAWN, 6, col, PlayerColor.WHITE); // col: 0–7
    }

    /**
     * Validates white pawn movement.
     * Excludes: check validation, en passant, promotion.
     */
    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) {
            return false;
        }

        const rowDiff = targetRow - this.row;
        const colDiff = Math.abs(targetCol - this.col);

        // 1. Forward move (no capture)
        if (colDiff === 0) {
            // One square forward
            if (rowDiff === -1 && board.boardArr[targetRow][targetCol] === null) {
                return true;
            }

            // Two squares forward (first move only)
            if (
                !this.hasMoved &&
                rowDiff === -2 &&
                board.boardArr[this.row - 1][this.col] === null &&
                board.boardArr[targetRow][targetCol] === null
            ) {
                return true;
            }
        }

        // 2. Diagonal capture
        if (
            rowDiff === -1 &&
            colDiff === 1 &&
            board.boardArr[targetRow][targetCol] !== null &&
            board.boardArr[targetRow][targetCol].color !== this.color
        ) {
            return true;
        }
        //TODO: promotion
        return false;
    }

    getPseudoLegalMoves(board) {
        const lastRank = 0; //0th row is the last rank for the White Pawn
        const direction = [[-1, 0], [-2, 0], [-1, -1], [-1, 1]];
        const moves = [];
        direction
            .forEach(dir => {
                const targetRow = this.row + dir[0];
                const targetCol = this.col + dir[1];
                if (this.isValidMove(board, targetRow, targetCol)) {
                    if(targetRow === lastRank)
                        moves.push(Move.promotion(this.row, this.col, targetRow, targetCol));
                    else
                        moves.push(new Move(this.row, this.col, targetRow, targetCol));
                }
                if(Math.abs(dir[1]) === 1 && board.enPassantTargetSquare && board.enPassantTargetSquare.row === targetRow && board.enPassantTargetSquare.col === targetCol){
                    moves.push(Move.enPassant(this.row, this.col, targetRow, targetCol, this.row, targetCol));
                }
            });

        return moves;
    }
}

class BlackPawn extends Pawn {
    constructor(col) {
        super(PIECE_CODES.BLACK.PAWN, 1, col, PlayerColor.BLACK); // col: 0–7
    }

    /**
     * Validates black pawn movement.
     * Excludes: check validation, en passant, promotion.
     */
    isValidMove(board, targetRow, targetCol) {
        if (!super.isValidMove(board, targetRow, targetCol)) return false;

        const rowDiff = targetRow - this.row;
        const colDiff = Math.abs(targetCol - this.col);

        // 1. Forward move (no capture)
        if (colDiff === 0) {
            // One square forward
            if (rowDiff === 1 && board.boardArr[targetRow][targetCol] === null) {
                return true;
            }

            // Two squares forward (first move only)
            if (
                !this.hasMoved &&
                rowDiff === 2 &&
                board.boardArr[this.row + 1][this.col] === null &&
                board.boardArr[targetRow][targetCol] === null
            ) {
                return true;
            }
        }

        // 2. Diagonal capture
        if (
            rowDiff === 1 &&
            colDiff === 1 &&
            board.boardArr[targetRow][targetCol] !== null &&
            board.boardArr[targetRow][targetCol].color !== this.color
        ) {
            return true;
        }
        //TODO: promotion
        return false;
    }


    getPseudoLegalMoves(board) {
        const lastRank = 7; //7th row is the last rank for the Black Pawn
        const direction = [[1, 0], [2, 0], [1, -1], [1, 1]];
        const moves = [];
        direction
            .forEach(dir => {
                const targetRow = this.row + dir[0];
                const targetCol = this.col + dir[1];
                if (this.isValidMove(board, targetRow, targetCol)) {
                    if(targetRow === lastRank)
                        moves.push(Move.promotion(this.row, this.col, targetRow, targetCol));
                    else
                        moves.push(new Move(this.row, this.col, targetRow, targetCol));
                }
                if(Math.abs(dir[1]) === 1 && board.enPassantTargetSquare && board.enPassantTargetSquare.row === targetRow && board.enPassantTargetSquare.col === targetCol){
                    moves.push(Move.enPassant(this.row, this.col, targetRow, targetCol, this.row, targetCol));
                }
            });

        return moves;
    }
}


