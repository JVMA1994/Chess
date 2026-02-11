const m = require('./chess-module');
const b = new m.Board();

function place(P, r, c) {
    let p;
    try { p = new P(null, c, r); } catch (e) { p = new P(null); }
    p.row = r;
    p.col = c;
    b.placePiece(p);
    return p;
}

place(m.WhiteKing, 7, 0);
place(m.BlackKing, 0, 4);
place(m.BlackPawn, 1, 3);
place(m.BlackPawn, 1, 4);
place(m.BlackPawn, 1, 5);
place(m.WhiteRook, 5, 0);

console.log('=== White legal moves ===');
const moves = b.getLegalMoves(m.PlayerColor.WHITE);
console.log('Count:', moves.length);
moves.forEach(mv => {
    console.log('  (' + mv.fromRow + ',' + mv.fromCol + ')->(' + mv.toRow + ',' + mv.toCol + ')');
});

console.log('\\n=== Testing if Rook to (0,0) is mate ===');
// Simulate Rook to (0,0)
const testMove = moves.find(mv => mv.fromRow === 5 && mv.fromCol === 0 && mv.toRow === 0 && mv.toCol === 0);
if (testMove) {
    b.makeMove(testMove);
    console.log('Black in check?', b.isKingInCheck(m.PlayerColor.BLACK));
    const blackMoves = b.getLegalMoves(m.PlayerColor.BLACK);
    console.log('Black legal moves:', blackMoves.length);
    blackMoves.forEach(mv => {
        console.log('  (' + mv.fromRow + ',' + mv.fromCol + ')->(' + mv.toRow + ',' + mv.toCol + ')');
    });
    b.undoMove(testMove);
} else {
    console.log('Move not found!');
}

const best = m.findBestMove(b, m.PlayerColor.WHITE, 3);
if (best) {
    console.log('\\nBest move: (' + best.fromRow + ',' + best.fromCol + ')->(' + best.toRow + ',' + best.toCol + ')');
} else {
    console.log('Best: null');
}
