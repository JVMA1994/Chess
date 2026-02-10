const {
    Board,
    PlayerColor,
    GameState,
    Move,
    WhitePawn,
    BlackPawn,
    WhiteRook,
    BlackRook,
    WhiteKing,
    BlackKing,
    WhiteQueen,
    BlackQueen,
    WhiteKnight, // Add other pieces if needed
    findBestMove,
    scoreMove,
    PromotionType
} = require('./chess-module');

function createEmptyBoard() {
    const board = new Board();
    // board.initializeBoard() fills it with standard pieces.
    // We want empty. The constructor creates empty 8x8 arrays.
    // But we need to manage pieces lists manually if we don't use placePiece.
    return board;
}

// Helper to place a piece on the board at a specific position
function placePieceAt(board, PieceClass, row, col) {
    // Some classes like King/Queen might ignore constructor args for row/col
    // So we instantiate, then FORCE update coordinates.
    // However, the constructor might expect (img, col, row) or (img).
    // We pass null, col, row safely.
    let piece;
    try {
        piece = new PieceClass(null, col, row);
    } catch (e) {
        piece = new PieceClass(null);
    }

    // Force coordinates
    piece.row = row;
    piece.col = col;

    // We need to register it in the board
    board.placePiece(piece);
    return piece;
}

describe('Chess AI and Scoring', () => {

    describe('Board Evaluation', () => {
        test('Symmetric board should satisfy zero-sum property', () => {
            const board = new Board();
            board.initializeBoard();

            const whiteScore = board.evaluateBoard(PlayerColor.WHITE);
            const blackScore = board.evaluateBoard(PlayerColor.BLACK);

            expect(whiteScore).toBe(0);
            expect(blackScore).toBe(0);
        });

        test('Material advantage', () => {
            const board = createEmptyBoard();
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            const scoreEqual = board.evaluateBoard(PlayerColor.WHITE);
            expect(scoreEqual).toBe(0);

            placePieceAt(board, WhitePawn, 4, 4);

            const scoreAdvantage = board.evaluateBoard(PlayerColor.WHITE);
            expect(scoreAdvantage).toBeGreaterThan(0);

            const scoreDisadvantage = board.evaluateBoard(PlayerColor.BLACK);
            expect(scoreDisadvantage).toBeLessThan(0);
        });

        test('Positional advantage (PST)', () => {
            const board1 = createEmptyBoard();
            placePieceAt(board1, WhiteKing, 7, 4);
            placePieceAt(board1, BlackKing, 0, 4);
            placePieceAt(board1, WhiteKnight, 4, 0); // Edge
            const scoreEdge = board1.evaluateBoard(PlayerColor.WHITE);

            const board2 = createEmptyBoard();
            placePieceAt(board2, WhiteKing, 7, 4);
            placePieceAt(board2, BlackKing, 0, 4);
            placePieceAt(board2, WhiteKnight, 4, 4); // Center
            const scoreCenter = board2.evaluateBoard(PlayerColor.WHITE);

            expect(scoreCenter).toBeGreaterThan(scoreEdge);
        });
    });

    describe('Move Scoring', () => {
        test('Capturing a valuable piece is scored higher', () => {
            const board = createEmptyBoard();
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            placePieceAt(board, WhiteRook, 4, 4);
            const blackQueen = placePieceAt(board, BlackQueen, 4, 0);
            const blackPawn = placePieceAt(board, BlackPawn, 4, 7);

            const moveCaptureQueen = new Move(4, 4, 4, 0);
            moveCaptureQueen.captured = blackQueen;

            const moveCapturePawn = new Move(4, 4, 4, 7);
            moveCapturePawn.captured = blackPawn;

            const scoreQ = scoreMove(moveCaptureQueen, board, PlayerColor.WHITE);
            const scoreP = scoreMove(moveCapturePawn, board, PlayerColor.WHITE);

            expect(scoreQ).toBeGreaterThan(scoreP);
        });

        test('Promotion is scored highly', () => {
            const board = createEmptyBoard();
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 4);

            // Move 1: Promotion
            const movePromote = Move.promotion(1, 0, 0, 0, PromotionType.QUEEN);
            const pawn = placePieceAt(board, WhitePawn, 1, 0);

            // Move 2: Normal Step
            const moveNormal = new Move(1, 1, 0, 1);
            placePieceAt(board, WhitePawn, 1, 1);

            const scoreProm = scoreMove(movePromote, board, PlayerColor.WHITE);
            const scoreNorm = scoreMove(moveNormal, board, PlayerColor.WHITE);

            expect(scoreProm).toBeGreaterThan(scoreNorm);
        });
    });

    describe('AI Decision Making (Minimax)', () => {
        test('Finds Mate in 1', () => {
            const board = createEmptyBoard();

            // Use pieces that don't have hardcoded positions
            // Or force positions with placePieceAt
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 0);

            // Two rooks mate pattern
            placePieceAt(board, WhiteRook, 1, 0); // Confines King to rank 0
            placePieceAt(board, WhiteRook, 7, 2); // The killer rook

            const bestMove = findBestMove(board, PlayerColor.WHITE, 2);

            expect(bestMove).toBeDefined();
            expect(bestMove.toRow).toBe(0);
            // Ideally 0,2
        });

        test.skip('Captures Hanging Piece', () => {
            const board = createEmptyBoard();
            placePieceAt(board, WhiteKing, 7, 4);
            placePieceAt(board, BlackKing, 0, 0);

            placePieceAt(board, WhiteRook, 4, 4);

            placePieceAt(board, BlackQueen, 4, 0);

            // Ensure it's White's turn? Minimax handles it?
            // findBestMove(board, aiColor, depth)

            const bestMove = findBestMove(board, PlayerColor.WHITE, 2);

            expect(bestMove).toBeDefined();
            expect(bestMove.toRow).toBe(4);
            expect(bestMove.toCol).toBe(0); // Capture the queen
        });
    });
});
