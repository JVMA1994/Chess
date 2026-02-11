const { Board, PlayerColor } = require('./tests/chess-module');

const board = new Board();
board.initializeBoard();
console.log('White Score:', board.evaluateBoard(PlayerColor.WHITE));
console.log('Black Score:', board.evaluateBoard(PlayerColor.BLACK));
console.log('White Eval Score (raw):', board.whiteEvalScore.toPrecision(20));

for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
        const piece = board.boardArr[r][c];
        if (piece) {
            // Check individual piece evals
            const material = 0;
            const positional = board._getPSTValue(piece, r, c);
            if (piece.color === PlayerColor.WHITE) {
                // ...
            }
        }
    }
}
