function findBestMove(board, aiColor, depth) {
    const moves = board.getLegalMoves(aiColor);

    let bestScore = -Infinity;
    let bestMove = null;

    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
        board.makeMove(move);

        const score = minimax(
            board,
            depth - 1,
            alpha,
            beta,
            false,
            aiColor
        );

        board.undoMove(move);

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }

        alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
}
function getOpponentColor(colorToMove){
    return PlayerColor.WHITE === colorToMove ? PlayerColor.BLACK : PlayerColor.WHITE;
}
function minimax(board, depth, alpha, beta, isMaximizing, perspectiveColor) {
    if (depth === 0) {
        return board.evaluateBoard(perspectiveColor);
    }

    const colorToMove = isMaximizing
        ? perspectiveColor
        : (perspectiveColor === PlayerColor.WHITE
            ? PlayerColor.BLACK
            : PlayerColor.WHITE);

    const moves = board.getLegalMoves(colorToMove);
    moves.sort((a, b) => this.scoreMove(b, board, getOpponentColor(colorToMove)) - this.scoreMove(a, board, getOpponentColor(colorToMove)));

    if (moves.length === 0) {
        return board.evaluateBoard(perspectiveColor);
    }

    if (isMaximizing) {
        let best = -Infinity;

        for (const move  of moves) {
            board.makeMove(move);

            const score = minimax(
                board,
                depth - 1,
                alpha,
                beta,
                false,
                perspectiveColor
            );

            board.undoMove(move);

            best = Math.max(best, score);
            if(best >= beta) break;
            alpha = Math.max(alpha, best);
        }

        return best;

    } else {
        let best = Infinity;

        for (const move  of moves) {
            board.makeMove(move);

            const score = minimax(
                board,
                depth - 1,
                alpha,
                beta,
                true,
                perspectiveColor
            );

            board.undoMove(move);

            best = Math.min(best, score);
            if (best <= alpha) break;
            beta = Math.min(beta, best);
        }

        return best;
    }
}

function getPSTValue(piece, row, col) {
    const table = PST.get(piece.constructor);
    if (!table) return 0;

    // White uses table as-is
    if (piece.color === PlayerColor.WHITE) {
        return table[row][col];
    }

    // Black is mirrored vertically
    return table[7 - row][col];
}

function scoreMove(move, board, color) {
    let score = 0;

    const attacker = board.boardArr[move.fromRow][move.fromCol];
    const victim   = move.captured;

    // 1. Captures — MVV LVA (Most Valuable Victim, Least Valuable Attacker)
    if (victim) {
        const victimValue = PIECE_VALUE.get(victim.constructor);
        const attackerValue = PIECE_VALUE.get(attacker.constructor);
        score += 10 * victimValue - attackerValue;
    }

    // 2. Promotion
    if (move.isPromotion) {
        score += 9000;
    }

    // 3. Check (very powerful for pruning)
    if (board.isKingInCheck(color)) {
        score += 500;
    }

    // 4. PST improvement for quiet moves
    const fromPST = getPSTValue(attacker, move.fromRow, move.fromCol);
    const toPST   = getPSTValue(attacker, move.toRow, move.toCol);
    score += (toPST - fromPST);

    return score;
}
