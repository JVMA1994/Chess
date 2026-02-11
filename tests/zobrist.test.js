const {
    Board,
    PlayerColor,
    zobrist,
    WhitePawn,
    BlackPawn,
    WhiteRook,
    BlackRook,
    WhiteKing,
    BlackKing
} = require('./chess-module');

function placePieceAt(board, PieceClass, row, col) {
    let piece;
    try {
        piece = new PieceClass(null, col, row);
    } catch (e) {
        piece = new PieceClass(null);
    }
    piece.row = row;
    piece.col = col;
    board.placePiece(piece);

    // Set king references if applicable
    if (piece instanceof WhiteKing) board.whiteKing = piece;
    if (piece instanceof BlackKing) board.blackKing = piece;

    return piece;
}

describe('Zobrist Hashing', () => {
    test('Same position produces same hash', () => {
        const board1 = new Board();
        board1.initializeBoard();
        const hash1 = zobrist.computeHash(board1, PlayerColor.WHITE);

        const board2 = new Board();
        board2.initializeBoard();
        const hash2 = zobrist.computeHash(board2, PlayerColor.WHITE);

        expect(hash1).toBe(hash2);
    });

    test('Different side to move produces different hash', () => {
        const board = new Board();
        board.initializeBoard();

        const whiteHash = zobrist.computeHash(board, PlayerColor.WHITE);
        const blackHash = zobrist.computeHash(board, PlayerColor.BLACK);

        expect(whiteHash).not.toBe(blackHash);
    });

    test('Different piece position produces different hash', () => {
        const board1 = new Board();
        board1.initializeBoard();
        const hash1 = zobrist.computeHash(board1, PlayerColor.WHITE);

        // Move a piece manually (bypass makeMove for direct state check)
        const piece = board1.boardArr[6][0];
        board1.boardArr[6][0] = null;
        board1.boardArr[5][0] = piece;
        piece.row = 5;

        const hash2 = zobrist.computeHash(board1, PlayerColor.WHITE);

        expect(hash1).not.toBe(hash2);
    });

    test('Hash is restored after move and undo', () => {
        const board = new Board();
        board.initializeBoard();
        const initialHash = zobrist.computeHash(board, PlayerColor.WHITE);

        const moves = board.getLegalMoves(PlayerColor.WHITE);
        const move = moves[0];

        board.makeMove(move);
        const movedHash = zobrist.computeHash(board, PlayerColor.BLACK);
        expect(movedHash).not.toBe(initialHash);

        board.undoMove(move);
        const restoredHash = zobrist.computeHash(board, PlayerColor.WHITE);

        expect(restoredHash).toBe(initialHash);
    });

    test('Castling rights change affects hash', () => {
        const board = new Board();
        const wk = placePieceAt(board, WhiteKing, 7, 4);
        const wr = placePieceAt(board, WhiteRook, 7, 7);

        const beforeMoveHash = zobrist.computeHash(board, PlayerColor.WHITE);

        // Move the rook to lose castling rights
        const move = board.getLegalMoves(PlayerColor.WHITE).find(m => m.fromRow === 7 && m.fromCol === 7);
        board.makeMove(move);

        const afterMoveHash = zobrist.computeHash(board, PlayerColor.BLACK);
        expect(afterMoveHash).not.toBe(beforeMoveHash);

        board.undoMove(move);
        const undoneHash = zobrist.computeHash(board, PlayerColor.WHITE);
        expect(undoneHash).toBe(beforeMoveHash);

        // Verify that if we manually set hasMoved, the hash changes
        wr.hasMoved = true;
        const lostRightsHash = zobrist.computeHash(board, PlayerColor.WHITE);
        expect(lostRightsHash).not.toBe(beforeMoveHash);
    });

    test('En passant availability affects hash', () => {
        const board = new Board();
        placePieceAt(board, WhiteKing, 7, 0);
        placePieceAt(board, BlackKing, 0, 7);
        placePieceAt(board, WhitePawn, 6, 3);
        placePieceAt(board, BlackPawn, 1, 4); // Dummy piece

        const hashBefore = zobrist.computeHash(board, PlayerColor.WHITE);

        // Trigger double pawn push to set en passant target
        const moves = board.getLegalMoves(PlayerColor.WHITE);
        const doublePush = moves.find(m => Math.abs(m.toRow - m.fromRow) === 2);

        expect(doublePush).toBeDefined();

        board.makeMove(doublePush);

        const hashWithEP = zobrist.computeHash(board, PlayerColor.BLACK);
        expect(hashWithEP).not.toBe(hashBefore);

        // Check if removing EP target manually changes hash
        board.enPassantTargetSquare = null;
        const hashWithoutEP = zobrist.computeHash(board, PlayerColor.BLACK);

        expect(hashWithEP).not.toBe(hashWithoutEP);
    });
});
