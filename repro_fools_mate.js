const m = require('./tests/chess-module');
const board = new m.Board();
board.initializeBoard();

function findMove(b, fromR, fromC, toR, toC, color) {
    const moves = b.getLegalMoves(color);
    return moves.find(mv => mv.fromRow === fromR && mv.fromCol === fromC && mv.toRow === toR && mv.toCol === toC);
}

const f3 = findMove(board, 6, 5, 5, 5, m.PlayerColor.WHITE);
if (!f3) { console.log('Could not find f3'); process.exit(1); }
board.makeMove(f3);

const e5 = findMove(board, 1, 4, 3, 4, m.PlayerColor.BLACK);
if (!e5) { console.log('Could not find e5'); process.exit(1); }
board.makeMove(e5);

const g4 = findMove(board, 6, 6, 4, 6, m.PlayerColor.WHITE);
if (!g4) { console.log('Could not find g4'); process.exit(1); }
board.makeMove(g4);

console.log('Board state updated to fool\'s mate setup.');
console.log('Turn:', m.PlayerColor.BLACK);

const bestMove = m.findBestMove(board, m.PlayerColor.BLACK, 3);

if (bestMove) {
    console.log(`Best move found: (${bestMove.fromRow},${bestMove.fromCol}) -> (${bestMove.toRow},${bestMove.toCol})`);
    if (bestMove.toRow === 4 && bestMove.toCol === 7) {
        console.log('SUCCESS: AI found Qh4#!');
    } else {
        console.log('FAILURE: AI chose something else.');
        // Debug score for Qh4
        const qh4 = findMove(board, 0, 3, 4, 7, m.PlayerColor.BLACK);
        if (qh4) {
            board.makeMove(qh4);
            const evalScore = board.evaluateBoard(m.PlayerColor.BLACK);
            console.log('Qh4 evaluation (standalone):', evalScore);
            console.log('King in check?', board.isKingInCheck(m.PlayerColor.WHITE));
            const whiteMoves = board.getLegalMoves(m.PlayerColor.WHITE);
            console.log('White legal moves count:', whiteMoves.length);
            board.undoMove(qh4);
        }
    }
} else {
    console.log('No best move found.');
}
