class Piece {
    constructor(img, color, row, col) {
        this.image = img;
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
    constructor(img) {
        super(img, PlayerColor.WHITE, 7, 4);
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

    getPseudoLegalMoves(board){
        let moves = super.getPseudoLegalMoves(board);
        if(this.hasMoved)
            return moves;
        if(board.isKingInCheck(this.color))
            return moves;

        if(this.checkKingSideCastling(board)){
            moves.push(Move.castling(this.row, this.col, 7, 6, 7, 5));
        }
        return moves;
    }
}

class BlackKing extends King {
    constructor(img) {
        super(img, PlayerColor.BLACK, 0, 4);
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

    getPseudoLegalMoves(board){
        let moves = super.getPseudoLegalMoves(board);
        if(this.hasMoved)
            return moves;
        if(board.isKingInCheck(this.color))
            return moves;

        if(this.checkKingSideCastling(board)){
            moves.push(Move.castling(this.row, this.col, 0, 6, 7, 5));
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
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col); // col: 0 or 7
    }
}

class BlackRook extends Rook {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 0, col); // col: 0 or 7
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
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col); // col: 2 or 5
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
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 7, col); // col: 1 or 6
    }
}

class BlackKnight extends Knight {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 0, col); // col: 1 or 6
    }
}

class WhitePawn extends Piece {
    constructor(img, col) {
        super(img, PlayerColor.WHITE, 6, col); // col: 0–7
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
        //TODO: En passant
        //TODO: promotion
        return false;
    }

    getPseudoLegalMoves(board) {
        let direction = [[-1, 0], [-2, 0], [-1, -1], [-1, 1]];
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

class BlackPawn extends Piece {
    constructor(img, col) {
        super(img, PlayerColor.BLACK, 1, col); // col: 0–7
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
        //TODO: En passant
        //TODO: promotion
        return false;
    }


    getPseudoLegalMoves(board) {
        let direction = [[1, 0], [2, 0], [1, -1], [1, 1]];
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


