/**
 * Chess Engine Test Suite
 * 
 * Comprehensive tests for:
 * - Checkmate detection
 * - Stalemate detection
 * - En passant
 * - Castling (king-side and queen-side)
 * - Piece movement validation
 */

// Import chess classes from the testable module
const {
    PlayerColor,
    GameState,
    Move,
    Board,
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
    BlackPawn
} = require('./chess-module');

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Creates a mock image object for pieces
 */
function createMockImage() {
    return { src: '', onload: null, onerror: null };
}

/**
 * Creates an empty board for custom test positions
 */
function createEmptyBoard() {
    const board = new Board();
    board.boardArr = Array.from({ length: 8 }, () => Array(8).fill(null));
    board.whitePieces = [];
    board.blackPieces = [];
    return board;
}

/**
 * Helper to place a piece on the board at a specific position
 */
function placePieceAt(board, PieceClass, row, col, color = null) {
    const img = createMockImage();
    let piece;

    // Handle pieces with different constructor signatures
    if (PieceClass === WhiteKing || PieceClass === BlackKing ||
        PieceClass === WhiteQueen || PieceClass === BlackQueen) {
        piece = new PieceClass(img);
        piece.row = row;
        piece.col = col;
    } else if (PieceClass === WhitePawn || PieceClass === BlackPawn) {
        piece = new PieceClass(img, col);
        piece.row = row;
        piece.col = col;
    } else {
        piece = new PieceClass(img, col);
        piece.row = row;
        piece.col = col;
    }

    board.boardArr[row][col] = piece;

    if (piece.color === PlayerColor.WHITE) {
        board.whitePieces.push(piece);
        if (piece instanceof WhiteKing) board.whiteKing = piece;
    } else {
        board.blackPieces.push(piece);
        if (piece instanceof BlackKing) board.blackKing = piece;
    }

    return piece;
}

// ============================================================================
// CHECKMATE TESTS
// ============================================================================

describe('Checkmate Detection', () => {

    describe('Back Rank Mate', () => {
        test('Rook delivers back rank mate', () => {
            const board = createEmptyBoard();

            // White king trapped on back rank
            placePieceAt(board, WhiteKing, 7, 6);

            // White pawns blocking escape
            placePieceAt(board, WhitePawn, 6, 5);
            placePieceAt(board, WhitePawn, 6, 6);
            placePieceAt(board, WhitePawn, 6, 7);

            // Black rook delivering mate
            placePieceAt(board, BlackRook, 7, 0);

            // Black king somewhere safe
            placePieceAt(board, BlackKing, 0, 4);

            const gameState = board.evaluateGameState(PlayerColor.WHITE);
            expect(gameState).toBe(GameState.CHECKMATE_BLACK_WINS);
        });

        test('Black king back rank mate', () => {
            const board = createEmptyBoard();

            // Black king trapped on back rank
            placePieceAt(board, BlackKing, 0, 6);

            // Black pawns blocking escape
            placePieceAt(board, BlackPawn, 1, 5);
            placePieceAt(board, BlackPawn, 1, 6);
            placePieceAt(board, BlackPawn, 1, 7);

            // White rook delivering mate
            placePieceAt(board, WhiteRook, 0, 0);

            // White king somewhere safe
            placePieceAt(board, WhiteKing, 7, 4);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CHECKMATE_WHITE_WINS);
        });
    });

    describe('Smothered Mate', () => {
        test('Knight delivers smothered mate', () => {
            const board = createEmptyBoard();

            // Classic smothered mate position
            // Black king in corner h8, smothered by own pieces
            placePieceAt(board, BlackKing, 0, 7); // h8
            placePieceAt(board, BlackRook, 0, 6); // g8 (blocks g8 escape)
            placePieceAt(board, BlackPawn, 1, 6); // g7 (blocks g7 escape)
            placePieceAt(board, BlackPawn, 1, 7); // h7 (blocks h7 escape)

            // White knight on f7 delivers mate - attacks h8 and h6
            placePieceAt(board, WhiteKnight, 1, 5); // f7 - this attacks h8!

            // White king somewhere safe  
            placePieceAt(board, WhiteKing, 7, 4);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CHECKMATE_WHITE_WINS);
        });
    });

    describe('Two Rook Mate', () => {
        test('Two rooks deliver ladder mate', () => {
            const board = createEmptyBoard();

            // Black king on edge
            placePieceAt(board, BlackKing, 0, 4);

            // Two white rooks creating ladder
            placePieceAt(board, WhiteRook, 0, 0);
            placePieceAt(board, WhiteRook, 1, 7);

            // White king somewhere safe
            placePieceAt(board, WhiteKing, 7, 4);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CHECKMATE_WHITE_WINS);
        });
    });

    describe('Queen and King Mate', () => {
        test('Queen delivers mate with king support', () => {
            const board = createEmptyBoard();

            // Black king on edge
            placePieceAt(board, BlackKing, 0, 0);

            // White queen adjacent
            placePieceAt(board, WhiteQueen, 1, 1);

            // White king supporting
            placePieceAt(board, WhiteKing, 2, 2);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CHECKMATE_WHITE_WINS);
        });
    });

    describe('Not Checkmate (King Can Escape)', () => {
        test('King has escape square', () => {
            const board = createEmptyBoard();

            // White king with escape route
            placePieceAt(board, WhiteKing, 7, 4);

            // Black rook giving check but king can escape
            placePieceAt(board, BlackRook, 7, 0);

            // Black king somewhere safe
            placePieceAt(board, BlackKing, 0, 4);

            const gameState = board.evaluateGameState(PlayerColor.WHITE);
            expect(gameState).toBe(GameState.CONTINUE);
        });

        test('Piece can block the check', () => {
            const board = createEmptyBoard();

            // White king in check
            placePieceAt(board, WhiteKing, 7, 4);

            // Black rook giving check
            placePieceAt(board, BlackRook, 7, 0);

            // White rook can block
            placePieceAt(board, WhiteRook, 5, 2);

            // Black king somewhere safe
            placePieceAt(board, BlackKing, 0, 4);

            const gameState = board.evaluateGameState(PlayerColor.WHITE);
            expect(gameState).toBe(GameState.CONTINUE);
        });

        test('Attacker can be captured', () => {
            const board = createEmptyBoard();

            // White king in check
            placePieceAt(board, WhiteKing, 7, 4);

            // Blocking pawns
            placePieceAt(board, WhitePawn, 6, 3);
            placePieceAt(board, WhitePawn, 6, 4);
            placePieceAt(board, WhitePawn, 6, 5);

            // Black rook giving check
            const blackRook = placePieceAt(board, BlackRook, 7, 0);

            // White rook can capture the attacker
            placePieceAt(board, WhiteRook, 3, 0);

            // Black king somewhere safe
            placePieceAt(board, BlackKing, 0, 4);

            const gameState = board.evaluateGameState(PlayerColor.WHITE);
            expect(gameState).toBe(GameState.CONTINUE);
        });
    });
});

// ============================================================================
// STALEMATE TESTS
// ============================================================================

describe('Stalemate Detection', () => {

    describe('Classic Stalemate Positions', () => {
        test('King in corner with no legal moves', () => {
            const board = createEmptyBoard();

            // Black king in corner with no legal moves
            placePieceAt(board, BlackKing, 0, 0);

            // White queen blocking all squares but not giving check
            placePieceAt(board, WhiteQueen, 2, 1);

            // White king
            placePieceAt(board, WhiteKing, 2, 2);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.STALEMATE);
        });

        test('Lone king stalemate', () => {
            const board = createEmptyBoard();

            // Black king on a8 - lone king stalemate
            placePieceAt(board, BlackKing, 0, 0);

            // White king on b3
            placePieceAt(board, WhiteKing, 5, 1);

            // White queen on b6 - blocks all moves without giving check
            // a8 king can't move to: a7 (queen), b8 (queen), b7 (queen)
            placePieceAt(board, WhiteQueen, 2, 1);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.STALEMATE);
        });
    });

    describe('Not Stalemate', () => {
        test('King has legal move', () => {
            const board = createEmptyBoard();

            // Black king has a legal move
            placePieceAt(board, BlackKing, 4, 4);

            // White pieces not fully blocking
            placePieceAt(board, WhiteKing, 7, 4);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CONTINUE);
        });

        test('Other piece has legal move', () => {
            const board = createEmptyBoard();

            // Black king trapped but pawn can move
            placePieceAt(board, BlackKing, 0, 0);
            placePieceAt(board, WhiteQueen, 2, 1);
            placePieceAt(board, WhiteKing, 3, 3);

            // Black pawn that can move
            const pawn = placePieceAt(board, BlackPawn, 4, 4);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            expect(gameState).toBe(GameState.CONTINUE);
        });

        test('King in check is not stalemate', () => {
            const board = createEmptyBoard();

            // Black king in check (this is checkmate, not stalemate)
            placePieceAt(board, BlackKing, 0, 0);
            placePieceAt(board, WhiteQueen, 1, 1);
            placePieceAt(board, WhiteKing, 2, 2);

            const gameState = board.evaluateGameState(PlayerColor.BLACK);
            // This should be checkmate, not stalemate
            expect(gameState).toBe(GameState.CHECKMATE_WHITE_WINS);
        });
    });
});

// ============================================================================
// EN PASSANT TESTS
// ============================================================================

describe('En Passant', () => {

    describe('White Pawn En Passant', () => {
        test('White pawn can capture en passant to the left', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn on 5th rank (row 3)
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn that just moved two squares (to the left)
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;

            // Set en passant target square
            board.enPassantTargetSquare = { row: 2, col: 3 };

            const moves = whitePawn.getPseudoLegalMoves(board);
            const enPassantMove = moves.find(m => m.isEnPassant);

            expect(enPassantMove).toBeDefined();
            expect(enPassantMove.toRow).toBe(2);
            expect(enPassantMove.toCol).toBe(3);
            expect(enPassantMove.capturedPawnRow).toBe(3);
            expect(enPassantMove.capturedPawnCol).toBe(3);
        });

        test('White pawn can capture en passant to the right', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn on 5th rank
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn that just moved two squares (to the right)
            const blackPawn = placePieceAt(board, BlackPawn, 3, 5);
            blackPawn.hasMoved = true;

            // Set en passant target square
            board.enPassantTargetSquare = { row: 2, col: 5 };

            const moves = whitePawn.getPseudoLegalMoves(board);
            const enPassantMove = moves.find(m => m.isEnPassant);

            expect(enPassantMove).toBeDefined();
            expect(enPassantMove.toRow).toBe(2);
            expect(enPassantMove.toCol).toBe(5);
        });

        test('En passant capture removes opponent pawn', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);

            // White pawn should be at new position
            expect(board.boardArr[2][3]).toBe(whitePawn);
            // Original position should be empty
            expect(board.boardArr[3][4]).toBeNull();
            // Captured pawn should be removed
            expect(board.boardArr[3][3]).toBeNull();
        });
    });

    describe('Black Pawn En Passant', () => {
        test('Black pawn can capture en passant to the left', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // Black pawn on 4th rank (row 4)
            const blackPawn = placePieceAt(board, BlackPawn, 4, 4);
            blackPawn.hasMoved = true;

            // White pawn that just moved two squares
            const whitePawn = placePieceAt(board, WhitePawn, 4, 3);
            whitePawn.hasMoved = true;

            // Set en passant target square
            board.enPassantTargetSquare = { row: 5, col: 3 };

            const moves = blackPawn.getPseudoLegalMoves(board);
            const enPassantMove = moves.find(m => m.isEnPassant);

            expect(enPassantMove).toBeDefined();
            expect(enPassantMove.toRow).toBe(5);
            expect(enPassantMove.toCol).toBe(3);
        });

        test('Black pawn can capture en passant to the right', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // Black pawn on 4th rank
            const blackPawn = placePieceAt(board, BlackPawn, 4, 4);
            blackPawn.hasMoved = true;

            // White pawn that just moved two squares
            const whitePawn = placePieceAt(board, WhitePawn, 4, 5);
            whitePawn.hasMoved = true;

            // Set en passant target square
            board.enPassantTargetSquare = { row: 5, col: 5 };

            const moves = blackPawn.getPseudoLegalMoves(board);
            const enPassantMove = moves.find(m => m.isEnPassant);

            expect(enPassantMove).toBeDefined();
            expect(enPassantMove.toRow).toBe(5);
            expect(enPassantMove.toCol).toBe(5);
        });
    });

    describe('En Passant Edge Cases', () => {
        test('En passant only available immediately after double pawn push', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn next to it
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;

            // No en passant target set (opponent didn't just do double push)
            board.enPassantTargetSquare = null;

            const moves = whitePawn.getPseudoLegalMoves(board);
            const enPassantMove = moves.find(m => m.isEnPassant);

            expect(enPassantMove).toBeUndefined();
        });

        test('En passant target cleared after being used', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);

            expect(board.enPassantTargetSquare).toBeNull();
        });

        test('Undo en passant restores captured pawn', () => {
            const board = createEmptyBoard();

            // Setup kings
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // White pawn
            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;

            // Black pawn
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);
            board.undoMove(enPassantMove);

            // Pieces should be back in original positions
            expect(board.boardArr[3][4]).toBe(whitePawn);
            expect(board.boardArr[3][3]).toBe(blackPawn);
            expect(board.boardArr[2][3]).toBeNull();
        });
    });
});

// ============================================================================
// CASTLING TESTS
// ============================================================================

describe('Castling', () => {

    describe('White King-side Castling', () => {
        test('King-side castling is available when conditions are met', () => {
            const board = createEmptyBoard();

            // White king on e1, hasn't moved
            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            // White rook on h1, hasn't moved
            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            // Black king somewhere
            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 6);

            expect(castlingMove).toBeDefined();
            expect(castlingMove.rookFromCol).toBe(7);
            expect(castlingMove.rookToCol).toBe(5);
        });

        test('King-side castling blocked by piece between', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            // Piece blocking
            placePieceAt(board, WhiteBishop, 7, 5);

            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 6);

            expect(castlingMove).toBeUndefined();
        });

        test('King-side castling not allowed if king has moved', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = true;  // King has moved

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling);

            expect(castlingMove).toBeUndefined();
        });

        test('King-side castling not allowed if rook has moved', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = true;  // Rook has moved

            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 6);

            expect(castlingMove).toBeUndefined();
        });

        test('King-side castling not allowed when king is in check', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            // Black rook giving check
            placePieceAt(board, BlackRook, 0, 4);
            placePieceAt(board, BlackKing, 0, 0);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling);

            expect(castlingMove).toBeUndefined();
        });

        test('King-side castling not allowed when king passes through attacked square', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            // Black rook attacking f1 (king passes through)
            placePieceAt(board, BlackRook, 0, 5);
            placePieceAt(board, BlackKing, 0, 0);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 6);

            expect(castlingMove).toBeUndefined();
        });
    });

    describe('White Queen-side Castling', () => {
        test('Queen-side castling is available when conditions are met', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 0);
            whiteRook.hasMoved = false;

            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 2);

            expect(castlingMove).toBeDefined();
        });

        test('Queen-side castling blocked by piece between', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 0);
            whiteRook.hasMoved = false;

            // Piece blocking
            placePieceAt(board, WhiteQueen, 7, 3);

            placePieceAt(board, BlackKing, 0, 4);

            const moves = whiteKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 2);

            expect(castlingMove).toBeUndefined();
        });
    });

    describe('Black King-side Castling', () => {
        test('King-side castling is available when conditions are met', () => {
            const board = createEmptyBoard();

            const blackKing = placePieceAt(board, BlackKing, 0, 4);
            blackKing.hasMoved = false;

            const blackRook = placePieceAt(board, BlackRook, 0, 7);
            blackRook.hasMoved = false;

            placePieceAt(board, WhiteKing, 7, 4);

            const moves = blackKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 6);

            expect(castlingMove).toBeDefined();
        });
    });

    describe('Black Queen-side Castling', () => {
        test('Queen-side castling is available when conditions are met', () => {
            const board = createEmptyBoard();

            const blackKing = placePieceAt(board, BlackKing, 0, 4);
            blackKing.hasMoved = false;

            const blackRook = placePieceAt(board, BlackRook, 0, 0);
            blackRook.hasMoved = false;

            placePieceAt(board, WhiteKing, 7, 4);

            const moves = blackKing.getPseudoLegalMoves(board);
            const castlingMove = moves.find(m => m.isCastling && m.toCol === 2);

            expect(castlingMove).toBeDefined();
        });
    });

    describe('Castling Move Execution', () => {
        test('King-side castling moves both king and rook', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);

            // King should be on g1
            expect(board.boardArr[7][6]).toBe(whiteKing);
            expect(whiteKing.col).toBe(6);

            // Rook should be on f1
            expect(board.boardArr[7][5]).toBe(whiteRook);

            // Original positions should be empty
            expect(board.boardArr[7][4]).toBeNull();
            expect(board.boardArr[7][7]).toBeNull();
        });

        test('Undo castling restores original positions', () => {
            const board = createEmptyBoard();

            const whiteKing = placePieceAt(board, WhiteKing, 7, 4);
            whiteKing.hasMoved = false;

            const whiteRook = placePieceAt(board, WhiteRook, 7, 7);
            whiteRook.hasMoved = false;

            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);
            board.undoMove(castlingMove);

            // King should be back on e1
            expect(board.boardArr[7][4]).toBe(whiteKing);
            expect(whiteKing.col).toBe(4);
            expect(whiteKing.hasMoved).toBe(false);

            // Rook should be back on h1
            expect(board.boardArr[7][7]).toBe(whiteRook);
            expect(whiteRook.hasMoved).toBe(false);
        });
    });
});

// ============================================================================
// PIECE MOVEMENT TESTS
// ============================================================================

describe('Piece Movement', () => {

    describe('Pawn Movement', () => {
        test('White pawn can move one square forward', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const pawn = placePieceAt(board, WhitePawn, 6, 4);
            pawn.hasMoved = true;

            const moves = pawn.getPseudoLegalMoves(board);
            const forwardMove = moves.find(m => m.toRow === 5 && m.toCol === 4);

            expect(forwardMove).toBeDefined();
        });

        test('White pawn can move two squares on first move', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const pawn = placePieceAt(board, WhitePawn, 6, 4);
            pawn.hasMoved = false;

            const moves = pawn.getPseudoLegalMoves(board);
            const doublePush = moves.find(m => m.toRow === 4 && m.toCol === 4);

            expect(doublePush).toBeDefined();
        });

        test('Pawn cannot move two squares after first move', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const pawn = placePieceAt(board, WhitePawn, 5, 4);
            pawn.hasMoved = true;

            const moves = pawn.getPseudoLegalMoves(board);
            const doublePush = moves.find(m => m.toRow === 3 && m.toCol === 4);

            expect(doublePush).toBeUndefined();
        });

        test('Pawn can capture diagonally', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const whitePawn = placePieceAt(board, WhitePawn, 4, 4);
            whitePawn.hasMoved = true;

            // Enemy piece to capture
            placePieceAt(board, BlackPawn, 3, 5);

            const moves = whitePawn.getPseudoLegalMoves(board);
            const captureMove = moves.find(m => m.toRow === 3 && m.toCol === 5);

            expect(captureMove).toBeDefined();
        });

        test('Pawn cannot capture forward', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const whitePawn = placePieceAt(board, WhitePawn, 4, 4);
            whitePawn.hasMoved = true;

            // Enemy piece directly in front
            placePieceAt(board, BlackPawn, 3, 4);

            const moves = whitePawn.getPseudoLegalMoves(board);
            const forwardMove = moves.find(m => m.toRow === 3 && m.toCol === 4);

            expect(forwardMove).toBeUndefined();
        });
    });

    describe('Knight Movement', () => {
        test('Knight moves in L-shape', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const knight = placePieceAt(board, WhiteKnight, 4, 4);

            const moves = knight.getPseudoLegalMoves(board);

            // Knight should have 8 possible moves from center
            expect(moves.length).toBe(8);

            // Check specific L-shaped moves
            expect(moves.some(m => m.toRow === 2 && m.toCol === 3)).toBe(true);
            expect(moves.some(m => m.toRow === 2 && m.toCol === 5)).toBe(true);
            expect(moves.some(m => m.toRow === 6 && m.toCol === 3)).toBe(true);
            expect(moves.some(m => m.toRow === 6 && m.toCol === 5)).toBe(true);
        });

        test('Knight can jump over pieces', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const knight = placePieceAt(board, WhiteKnight, 4, 4);

            // Surround the knight with pawns
            placePieceAt(board, WhitePawn, 3, 4);
            placePieceAt(board, WhitePawn, 5, 4);
            placePieceAt(board, WhitePawn, 4, 3);
            placePieceAt(board, WhitePawn, 4, 5);

            const moves = knight.getPseudoLegalMoves(board);

            // Knight should still be able to jump over
            expect(moves.length).toBe(8);
        });
    });

    describe('Bishop Movement', () => {
        test('Bishop moves diagonally', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const bishop = placePieceAt(board, WhiteBishop, 4, 4);

            const moves = bishop.getPseudoLegalMoves(board);

            // All moves should be diagonal
            moves.forEach(m => {
                const rowDiff = Math.abs(m.toRow - 4);
                const colDiff = Math.abs(m.toCol - 4);
                expect(rowDiff).toBe(colDiff);
            });
        });

        test('Bishop is blocked by pieces', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const bishop = placePieceAt(board, WhiteBishop, 4, 4);

            // Block one diagonal
            placePieceAt(board, WhitePawn, 3, 3);

            const moves = bishop.getPseudoLegalMoves(board);

            // Should not be able to move past the pawn
            expect(moves.some(m => m.toRow === 2 && m.toCol === 2)).toBe(false);
        });
    });

    describe('Rook Movement', () => {
        test('Rook moves horizontally and vertically', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const rook = placePieceAt(board, WhiteRook, 4, 4);

            const moves = rook.getPseudoLegalMoves(board);

            // All moves should be in same row or same column
            moves.forEach(m => {
                const sameRow = m.toRow === 4;
                const sameCol = m.toCol === 4;
                expect(sameRow || sameCol).toBe(true);
            });
        });
    });

    describe('Queen Movement', () => {
        test('Queen moves like rook and bishop combined', () => {
            const board = createEmptyBoard();

            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const queen = placePieceAt(board, WhiteQueen, 4, 4);

            const moves = queen.getPseudoLegalMoves(board);

            // All moves should be either straight or diagonal
            moves.forEach(m => {
                const rowDiff = Math.abs(m.toRow - 4);
                const colDiff = Math.abs(m.toCol - 4);
                const isDiagonal = rowDiff === colDiff;
                const isStraight = m.toRow === 4 || m.toCol === 4;
                expect(isDiagonal || isStraight).toBe(true);
            });
        });
    });

    describe('King Movement', () => {
        test('King moves one square in any direction', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 4, 4);
            placePieceAt(board, BlackKing, 0, 0);

            const moves = king.getPseudoLegalMoves(board);

            // King should have 8 moves from center (excluding castling since moved flag isn't set)
            const regularMoves = moves.filter(m => !m.isCastling);
            expect(regularMoves.length).toBe(8);

            // All moves should be exactly one square away
            regularMoves.forEach(m => {
                const rowDiff = Math.abs(m.toRow - 4);
                const colDiff = Math.abs(m.toCol - 4);
                expect(rowDiff <= 1 && colDiff <= 1).toBe(true);
                expect(rowDiff + colDiff).toBeGreaterThan(0);
            });
        });
    });
});

// ============================================================================
// CHECK DETECTION TESTS
// ============================================================================

describe('Check Detection', () => {

    test('King is in check from rook', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 4, 4);
        placePieceAt(board, BlackKing, 0, 0);
        placePieceAt(board, BlackRook, 4, 0);  // Same row as white king

        expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(true);
    });

    test('King is in check from bishop', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 4, 4);
        placePieceAt(board, BlackKing, 0, 0);
        placePieceAt(board, BlackBishop, 2, 2);  // Diagonal to white king

        expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(true);
    });

    test('King is in check from knight', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 4, 4);
        placePieceAt(board, BlackKing, 0, 0);
        placePieceAt(board, BlackKnight, 2, 3);  // L-shape from white king

        expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(true);
    });

    test('King is in check from pawn', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 4, 4);
        placePieceAt(board, BlackKing, 0, 0);
        placePieceAt(board, BlackPawn, 3, 3);  // Diagonal in front

        expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(true);
    });

    test('King is not in check when path is blocked', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 4, 4);
        placePieceAt(board, BlackKing, 0, 0);
        placePieceAt(board, BlackRook, 4, 0);  // Would give check
        placePieceAt(board, WhitePawn, 4, 2);  // Blocking the check

        expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(false);
    });
});

// ============================================================================
// LEGAL MOVE GENERATION TESTS
// ============================================================================

describe('Legal Move Generation', () => {

    test('Cannot make move that leaves king in check', () => {
        const board = createEmptyBoard();

        // White king with a pinned piece
        placePieceAt(board, WhiteKing, 7, 4);
        const pinnedBishop = placePieceAt(board, WhiteBishop, 6, 4);
        placePieceAt(board, BlackRook, 0, 4);  // Pinning the bishop
        placePieceAt(board, BlackKing, 0, 0);

        const legalMoves = board.getLegalMovesOfPiece(pinnedBishop);

        // Bishop cannot move sideways as it would expose king to rook
        expect(legalMoves.length).toBe(0);
    });

    test('Must block or capture when in check', () => {
        const board = createEmptyBoard();

        placePieceAt(board, WhiteKing, 7, 4);
        placePieceAt(board, WhiteRook, 7, 7);  // Can block or capture
        placePieceAt(board, BlackRook, 0, 4);  // Giving check
        placePieceAt(board, BlackKing, 0, 0);

        const allLegalMoves = board.getLegalMoves(PlayerColor.WHITE);

        // All moves should either move the king or block/capture the attacker
        allLegalMoves.forEach(m => {
            board.makeMove(m);
            expect(board.isKingInCheck(PlayerColor.WHITE)).toBe(false);
            board.undoMove(m);
        });
    });
});

// ============================================================================
// MAKE MOVE TESTS
// ============================================================================

describe('makeMove', () => {

    describe('Regular Moves', () => {
        test('Moves piece to new square', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 4, 6, 4);
            board.makeMove(move);

            expect(board.boardArr[6][4]).toBe(king);
            expect(board.boardArr[7][4]).toBeNull();
        });

        test('Updates piece row and col properties', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 7, 0);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 0, 3, 0);
            board.makeMove(move);

            expect(rook.row).toBe(3);
            expect(rook.col).toBe(0);
        });

        test('Sets hasMoved flag to true', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 7, 0);
            rook.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 0, 5, 0);
            board.makeMove(move);

            expect(rook.hasMoved).toBe(true);
        });

        test('Stores previous hasMoved state in move', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 7, 0);
            rook.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 0, 5, 0);
            board.makeMove(move);

            expect(move.prevHasMoved).toBe(false);
        });
    });

    describe('Captures', () => {
        test('Removes captured piece from board', () => {
            const board = createEmptyBoard();

            const whiteRook = placePieceAt(board, WhiteRook, 4, 4);
            const blackPawn = placePieceAt(board, BlackPawn, 4, 5);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const captureMove = new Move(4, 4, 4, 5);
            board.makeMove(captureMove);

            expect(board.boardArr[4][5]).toBe(whiteRook);
            expect(board.boardArr[4][4]).toBeNull();
        });

        test('Stores captured piece in move.captured', () => {
            const board = createEmptyBoard();

            const whiteRook = placePieceAt(board, WhiteRook, 4, 4);
            const blackPawn = placePieceAt(board, BlackPawn, 4, 5);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const captureMove = new Move(4, 4, 4, 5);
            board.makeMove(captureMove);

            expect(captureMove.captured).toBe(blackPawn);
        });
    });

    describe('Pawn Double Push', () => {
        test('White pawn double push sets en passant target', () => {
            const board = createEmptyBoard();

            const pawn = placePieceAt(board, WhitePawn, 6, 4);
            pawn.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const doublePush = new Move(6, 4, 4, 4);
            board.makeMove(doublePush);

            expect(board.enPassantTargetSquare).toEqual({ row: 5, col: 4 });
        });

        test('Black pawn double push sets en passant target', () => {
            const board = createEmptyBoard();

            const pawn = placePieceAt(board, BlackPawn, 1, 4);
            pawn.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const doublePush = new Move(1, 4, 3, 4);
            board.makeMove(doublePush);

            expect(board.enPassantTargetSquare).toEqual({ row: 2, col: 4 });
        });

        test('Single pawn push clears en passant target', () => {
            const board = createEmptyBoard();

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const pawn = placePieceAt(board, WhitePawn, 4, 4);
            pawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const singlePush = new Move(4, 4, 3, 4);
            board.makeMove(singlePush);

            expect(board.enPassantTargetSquare).toBeNull();
        });
    });

    describe('Castling Move', () => {
        test('King-side castling moves rook to f1', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);

            expect(board.boardArr[7][5]).toBe(rook);
            expect(board.boardArr[7][7]).toBeNull();
            expect(rook.hasMoved).toBe(true);
        });

        test('Queen-side castling moves rook to d1', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 0);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 2, 0, 3);
            board.makeMove(castlingMove);

            expect(board.boardArr[7][3]).toBe(rook);
            expect(board.boardArr[7][0]).toBeNull();
        });

        test('Castling stores previous rook hasMoved state', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);

            expect(castlingMove.prevRookHasMoved).toBe(false);
        });
    });

    describe('En Passant Move', () => {
        test('En passant removes captured pawn from original square', () => {
            const board = createEmptyBoard();

            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);

            // White pawn at target square
            expect(board.boardArr[2][3]).toBe(whitePawn);
            // Original white pawn square empty
            expect(board.boardArr[3][4]).toBeNull();
            // Captured black pawn square empty
            expect(board.boardArr[3][3]).toBeNull();
        });

        test('En passant stores captured pawn in move.captured', () => {
            const board = createEmptyBoard();

            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);

            expect(enPassantMove.captured).toBe(blackPawn);
        });
    });
});

// ============================================================================
// UNDO MOVE TESTS
// ============================================================================

describe('undoMove', () => {

    describe('Regular Moves', () => {
        test('Restores piece to original square', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 4, 6, 4);
            board.makeMove(move);
            board.undoMove(move);

            expect(board.boardArr[7][4]).toBe(king);
            expect(board.boardArr[6][4]).toBeNull();
        });

        test('Restores piece row and col properties', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 7, 0);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 0, 3, 0);
            board.makeMove(move);
            board.undoMove(move);

            expect(rook.row).toBe(7);
            expect(rook.col).toBe(0);
        });

        test('Restores hasMoved flag to previous state', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 7, 0);
            rook.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(7, 0, 5, 0);
            board.makeMove(move);
            expect(rook.hasMoved).toBe(true);

            board.undoMove(move);
            expect(rook.hasMoved).toBe(false);
        });

        test('Piece that already moved stays hasMoved after undo', () => {
            const board = createEmptyBoard();

            const rook = placePieceAt(board, WhiteRook, 5, 0);
            rook.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const move = new Move(5, 0, 3, 0);
            board.makeMove(move);
            board.undoMove(move);

            expect(rook.hasMoved).toBe(true);
        });
    });

    describe('Captures', () => {
        test('Restores captured piece to its square', () => {
            const board = createEmptyBoard();

            const whiteRook = placePieceAt(board, WhiteRook, 4, 4);
            const blackPawn = placePieceAt(board, BlackPawn, 4, 5);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const captureMove = new Move(4, 4, 4, 5);
            board.makeMove(captureMove);
            board.undoMove(captureMove);

            expect(board.boardArr[4][4]).toBe(whiteRook);
            expect(board.boardArr[4][5]).toBe(blackPawn);
        });

        test('Multiple captures and undos work correctly', () => {
            const board = createEmptyBoard();

            const whiteRook = placePieceAt(board, WhiteRook, 4, 0);
            const blackPawn1 = placePieceAt(board, BlackPawn, 4, 2);
            const blackPawn2 = placePieceAt(board, BlackPawn, 4, 4);
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const capture1 = new Move(4, 0, 4, 2);
            const capture2 = new Move(4, 2, 4, 4);

            board.makeMove(capture1);
            board.makeMove(capture2);

            board.undoMove(capture2);
            expect(board.boardArr[4][2]).toBe(whiteRook);
            expect(board.boardArr[4][4]).toBe(blackPawn2);

            board.undoMove(capture1);
            expect(board.boardArr[4][0]).toBe(whiteRook);
            expect(board.boardArr[4][2]).toBe(blackPawn1);
        });
    });

    describe('Pawn Double Push', () => {
        test('Restores previous en passant target square', () => {
            const board = createEmptyBoard();

            // Set an existing en passant target
            board.enPassantTargetSquare = { row: 5, col: 3 };

            const pawn = placePieceAt(board, WhitePawn, 6, 4);
            pawn.hasMoved = false;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const doublePush = new Move(6, 4, 4, 4);
            board.makeMove(doublePush);
            expect(board.enPassantTargetSquare).toEqual({ row: 5, col: 4 });

            board.undoMove(doublePush);
            expect(board.enPassantTargetSquare).toEqual({ row: 5, col: 3 });
        });
    });

    describe('Castling Move', () => {
        test('Restores king to original position', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);
            board.undoMove(castlingMove);

            expect(board.boardArr[7][4]).toBe(king);
            expect(king.col).toBe(4);
        });

        test('Restores rook to original position', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);
            board.undoMove(castlingMove);

            expect(board.boardArr[7][7]).toBe(rook);
            expect(board.boardArr[7][5]).toBeNull();
        });

        test('Restores king hasMoved flag', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);
            board.undoMove(castlingMove);

            expect(king.hasMoved).toBe(false);
        });

        test('Restores rook hasMoved flag', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            king.hasMoved = false;
            const rook = placePieceAt(board, WhiteRook, 7, 7);
            rook.hasMoved = false;
            placePieceAt(board, BlackKing, 0, 4);

            const castlingMove = Move.castling(7, 4, 7, 6, 7, 5);
            board.makeMove(castlingMove);
            board.undoMove(castlingMove);

            expect(rook.hasMoved).toBe(false);
        });
    });

    describe('En Passant Move', () => {
        test('Restores capturing pawn to original square', () => {
            const board = createEmptyBoard();

            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);
            board.undoMove(enPassantMove);

            expect(board.boardArr[3][4]).toBe(whitePawn);
            expect(whitePawn.row).toBe(3);
            expect(whitePawn.col).toBe(4);
        });

        test('Restores captured pawn to its original square', () => {
            const board = createEmptyBoard();

            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);
            board.undoMove(enPassantMove);

            expect(board.boardArr[3][3]).toBe(blackPawn);
        });

        test('Target square is empty after undo', () => {
            const board = createEmptyBoard();

            const whitePawn = placePieceAt(board, WhitePawn, 3, 4);
            whitePawn.hasMoved = true;
            const blackPawn = placePieceAt(board, BlackPawn, 3, 3);
            blackPawn.hasMoved = true;
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            board.enPassantTargetSquare = { row: 2, col: 3 };

            const enPassantMove = Move.enPassant(3, 4, 2, 3, 3, 3);
            board.makeMove(enPassantMove);
            board.undoMove(enPassantMove);

            expect(board.boardArr[2][3]).toBeNull();
        });
    });

    describe('Board State Consistency', () => {
        test('Multiple move/undo cycles preserve board state', () => {
            const board = createEmptyBoard();

            const king = placePieceAt(board, WhiteKing, 7, 4);
            const rook = placePieceAt(board, WhiteRook, 7, 0);
            const pawn = placePieceAt(board, WhitePawn, 6, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // Snapshot original state
            const originalKingPos = { row: king.row, col: king.col };
            const originalRookPos = { row: rook.row, col: rook.col };

            // Make several moves
            const moves = [
                new Move(6, 4, 5, 4),
                new Move(7, 0, 5, 0),
                new Move(7, 4, 6, 4)
            ];

            for (const move of moves) {
                board.makeMove(move);
            }

            // Undo all moves in reverse order
            for (let i = moves.length - 1; i >= 0; i--) {
                board.undoMove(moves[i]);
            }

            // Verify original state
            expect(board.boardArr[7][4]).toBe(king);
            expect(board.boardArr[7][0]).toBe(rook);
            expect(board.boardArr[6][4]).toBe(pawn);
        });
    });
});
