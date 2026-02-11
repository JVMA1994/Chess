/**
 * Chess AI Engine — Negamax with Alpha-Beta Pruning
 *
 * ## Architecture
 * Uses the Negamax variant of minimax search. Negamax simplifies the code
 * by always maximizing from the current player's perspective:
 *   score = -negamax(opponent, -beta, -alpha)
 *
 * This eliminates the dual isMaximizing/isMinimizing branches, halving
 * the search code and making future enhancements (null-move pruning, LMR)
 * much simpler to implement.
 *
 * ## Evaluation Convention
 * board.evaluateBoard(color) returns a positive score when `color` is winning.
 * Negamax always evaluates from the **current mover's** perspective.
 */

// ============================================================
// Constants
// ============================================================

// Killers: [ply][0] and [ply][1]
const KILLER_MOVES = Array.from({ length: 100 }, () => [null, null]);

// History Heuristic: [fromSquare][toSquare] (64x64)
const HISTORY_HEURISTIC = Array.from({ length: 64 }, () => new Float32Array(64).fill(0));

// ============================================================
// Search State
// ============================================================

const SEARCH_STATS = {
    nodes: 0,
    startTime: 0,
    timeLimit: 0,
    stop: false
};

// ============================================================
// Public API
// ============================================================

/**
 * Finds the best move for the AI using Negamax search.
 *
 * ## What it does
 * Evaluates every legal move to the given depth and returns the one
 * with the highest score. Uses alpha-beta pruning to skip obviously
 * bad branches.
 *
 * @param {Board} board   - The current board state.
 * @param {string} aiColor - The AI's color (PlayerColor.WHITE or BLACK).
 * @param {number} depth   - How many moves ahead to search.
 * @returns {Move|null}    - The best move, or null if no legal moves exist.
 */
function findBestMove(board, aiColor, maxDepth) {
    SEARCH_STATS.nodes = 0;
    SEARCH_STATS.startTime = Date.now();
    SEARCH_STATS.timeLimit = 6000; // Default 6 seconds
    SEARCH_STATS.stop = false;

    // Reset Heuristics for new search (optional, but cleaner for specific puzzles)
    // For match play, keeping History is often good, but let's clear to avoid pollution from previous games.
    for (let i = 0; i < MAX_PLY; i++) {
        KILLER_MOVES[i][0] = null;
        KILLER_MOVES[i][1] = null;
    }
    // We can keep History across moves in a game, but maybe decay it? 
    // For now, let's keep it but maybe divide by 2?
    for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 64; j++) {
            HISTORY_HEURISTIC[i][j] /= 8;
        }
    }

    let bestMoveSoFar = null;
    const moves = board.getLegalMoves(aiColor);

    if (moves.length === 0) return null;

    // Iterative Deepening
    for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
        let bestScore = -Infinity;
        let bestMoveAtThisDepth = null;
        let alpha = -Infinity;
        const beta = Infinity;

        const opponent = getOpponentColor(aiColor);

        // Sort moves at root (crucial for ID)
        const hash = board.zobristKey;
        const ttBestMove = tt.getBestMove(hash);
        orderMoves(moves, board, ttBestMove, 0);

        for (const move of moves) {
            board.makeMove(move);
            // PVS: First move full window, but at root we usually search all fully unless we do AspWindow
            // Let's just do standard root search for simplicity, PVS inside negamax.
            const score = -negamax(board, currentDepth - 1, -beta, -alpha, opponent, 1);
            board.undoMove(move);

            if (SEARCH_STATS.stop) break;

            if (score > bestScore) {
                bestScore = score;
                bestMoveAtThisDepth = move;
            }
            alpha = Math.max(alpha, bestScore);
        }

        if (bestMoveAtThisDepth) {
            bestMoveSoFar = bestMoveAtThisDepth;
        }

        if (SEARCH_STATS.stop) {
            break;
        }

        console.log(`Depth ${currentDepth} complete. Score: ${bestScore}. Best move:`, bestMoveSoFar, `Nodes: ${SEARCH_STATS.nodes}`);

        // If we have a forced checkmate, no need to search deeper
        if (bestScore > CHECKMATE_SCORE - 1000) break;
    }

    return bestMoveSoFar;
}

// ============================================================
// Core Search
// ============================================================

/**
 * Negamax search with alpha-beta pruning and PVS.
 */
function negamax(board, depth, alpha, beta, color, ply) {
    SEARCH_STATS.nodes++;

    // Periodic time check (every 2048 nodes)
    if ((SEARCH_STATS.nodes & 2047) === 0) {
        if (Date.now() - SEARCH_STATS.startTime > SEARCH_STATS.timeLimit) {
            SEARCH_STATS.stop = true;
        }
    }

    if (SEARCH_STATS.stop) return 0;

    const hash = board.zobristKey;

    // 1. TT Lookup
    // Pass ply for mate score normalization
    const ttScore = tt.lookup(hash, depth, alpha, beta, ply);
    if (ttScore !== null) return ttScore;

    if (depth <= 0) {
        return quiescence(board, alpha, beta, color, ply);
    }

    const inCheck = board.isKingInCheck(color);

    // Check Extension: If in check, extend depth
    // (Careful with explosion, but essential for tactics)
    // Let's simple not reduce depth? No, negamax is called with depth-1.
    // If we want extension, we call recursive with depth instead of depth-1.
    // But we must limit total extension.
    let extension = 0;
    if (inCheck) extension = 1;

    // Cap extension to avoid infinite loops in rare cases (or relying on max ply)
    if (ply + depth > MAX_PLY) extension = 0;

    const newDepth = depth + extension;
    // We passed 'depth' to this function. The loop calls 'newDepth - 1'.
    // If we extend, we effectively search deeper.

    // 2. Null Move Pruning (NMP)
    // (Skip if in check or endgame or shallow)
    if (depth >= 3 && !inCheck && ply > 0) {
        // Verify we have pieces (not just king/pawns) - Zugzwang risk
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
            board.zobristKey ^= zobrist.sideKey;
            const prevEP = board.enPassantTargetSquare;
            if (prevEP) board.zobristKey ^= zobrist.enPassantKeys[prevEP.col];
            board.enPassantTargetSquare = null;

            // Search with reduced depth
            const score = -negamax(board, depth - 1 - R, -beta, -beta + 1, getOpponentColor(color), ply + 1);

            board.enPassantTargetSquare = prevEP;
            if (prevEP) board.zobristKey ^= zobrist.enPassantKeys[prevEP.col];
            board.zobristKey ^= zobrist.sideKey;

            if (score >= beta) return beta;
        }
    }

    const moves = board.getLegalMoves(color);

    if (moves.length === 0) {
        // Correct Mate Scoring: prioritize immediate mates
        return inCheck ? -(CHECKMATE_SCORE - ply) : STALEMATE_SCORE;
    }

    // 3. Move Ordering
    const ttBestMove = tt.getBestMove(hash);
    orderMoves(moves, board, ttBestMove, ply);

    const opponent = getOpponentColor(color);
    const originalAlpha = alpha;
    let bestScore = -Infinity;
    let bestMove = null;
    let movesSearched = 0;

    for (const move of moves) {
        board.makeMove(move);
        movesSearched++;

        let score;

        // Principal Variation Search (PVS)
        if (movesSearched === 1) {
            // Full window for the first move (PV-node)
            score = -negamax(board, newDepth - 1, -beta, -alpha, opponent, ply + 1);
        } else {
            // Late Move Reduction (LMR) logic could go here
            let reduction = 0;
            // Aggressive LMR: reduce by 1 or more for late quiet moves
            if (movesSearched > 4 && depth >= 3 && !inCheck && !move.captured && !move.isPromotion && !extension) {
                reduction = 1;
                if (movesSearched > 10) reduction = 2;
            }

            // Zero Window Search (Null-Window)
            // Prove that this move is NOT better than alpha (beta = alpha+1)
            score = -negamax(board, newDepth - 1 - reduction, -alpha - 1, -alpha, opponent, ply + 1);

            // Re-search if reduced
            if (reduction > 0 && score > alpha) {
                score = -negamax(board, newDepth - 1, -alpha - 1, -alpha, opponent, ply + 1);
            }

            // If zero-window failed high (score > alpha), it might be a new best move.
            // Re-search with full window to get exact score.
            if (score > alpha && score < beta) {
                score = -negamax(board, newDepth - 1, -beta, -alpha, opponent, ply + 1);
            }
        }

        board.undoMove(move);

        if (SEARCH_STATS.stop) return 0;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }

        if (score > alpha) {
            alpha = score;

            // Beta Cutoff (Fail High)
            if (alpha >= beta) {
                // Update Killers and History (if quiet move)
                if (!move.captured && !move.isPromotion && ply < MAX_PLY) {
                    storeKiller(ply, move);
                    updateHistory(move, depth);
                }
                break;
            }
        }
    }

    // 5. TT Store
    let type = EntryType.EXACT;
    if (bestScore <= originalAlpha) type = EntryType.ALPHA;
    else if (bestScore >= beta) type = EntryType.BETA;

    // Pass ply to store normalized score
    tt.store(hash, depth, bestScore, type, bestMove, ply);

    return bestScore;
}

/**
 * Quiescence Search
 */
function quiescence(board, alpha, beta, color, ply) {
    SEARCH_STATS.nodes++;

    // 1. Stand-pat score
    let standPat = board.evaluateBoard(color);
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Delta Pruning (Safety Margin)
    // If standPat + Queen < alpha, we probably can't improve even with a capture.
    // (Except promotion... assume 900 value)
    const BIG_DELTA = 950;
    if (standPat < alpha - BIG_DELTA) {
        // We still need to check promotions? 
        // Simplify: Just return alpha, risk is low if margin is huge.
        // return alpha; 
        // Actually, let's play safe for now. No delta pruning yet.
    }

    const moves = board.getCaptures(color);
    orderMoves(moves, board, null, ply);

    const opponent = getOpponentColor(color);

    for (const move of moves) {
        board.makeMove(move);
        const score = -quiescence(board, -beta, -alpha, opponent, ply + 1);
        board.undoMove(move);

        if (SEARCH_STATS.stop) return 0;

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }

    return alpha;
}

// ============================================================
// Move Ordering
// ============================================================

function storeKiller(ply, move) {
    if (ply >= MAX_PLY) return;
    // Don't store if already first killer
    if (KILLER_MOVES[ply][0] && isEqualMove(KILLER_MOVES[ply][0], move)) return;

    // Shift
    KILLER_MOVES[ply][1] = KILLER_MOVES[ply][0];
    KILLER_MOVES[ply][0] = move;
}

function updateHistory(move, depth) {
    const from = move.fromRow * 8 + move.fromCol;
    const to = move.toRow * 8 + move.toCol;
    const bonus = depth * depth;
    HISTORY_HEURISTIC[from][to] += bonus;

    // Cap history to avoid overflow? Not really needed with Float32/JS Number
    if (HISTORY_HEURISTIC[from][to] > 200000) { // arbitrary cap
        for (let i = 0; i < 64; i++) for (let j = 0; j < 64; j++) HISTORY_HEURISTIC[i][j] /= 2;
    }
}

function isEqualMove(m1, m2) {
    return m1.fromRow === m2.fromRow && m1.fromCol === m2.fromCol && m1.toRow === m2.toRow && m1.toCol === m2.toCol;
}

function orderMoves(moves, board, ttBestMove = null, ply = 0) {
    for (const move of moves) {
        if (ttBestMove && isEqualMove(move, ttBestMove)) {
            move._sortScore = 2000000; // Best move from TT
        } else {
            move._sortScore = scoreMove(move, board, ply);
        }
    }
    moves.sort((a, b) => b._sortScore - a._sortScore);
}

function scoreMove(move, board, ply) {
    let score = 0;

    const attacker = board.boardArr[move.fromRow][move.fromCol];
    if (!attacker) return 0;
    const victim = move.captured;

    // 1. MVV-LVA
    if (victim) {
        const victimValue = PIECE_VALUE.get(victim.constructor) || 0;
        const attackerValue = PIECE_VALUE.get(attacker.constructor) || 0;
        score += 10 * victimValue - attackerValue + 100000;
    }

    // 2. Promotions
    if (move.isPromotion) {
        score += 90000;
    }

    // 3. Killer Moves
    if (ply < MAX_PLY) {
        if (KILLER_MOVES[ply][0] && isEqualMove(move, KILLER_MOVES[ply][0])) score += 9000;
        else if (KILLER_MOVES[ply][1] && isEqualMove(move, KILLER_MOVES[ply][1])) score += 8000;
    }

    // 4. History Heuristic
    const from = move.fromRow * 8 + move.fromCol;
    const to = move.toRow * 8 + move.toCol;
    score += HISTORY_HEURISTIC[from][to];

    // 5. PST as tiebreaker
    const fromPST = getPSTValue(attacker, move.fromRow, move.fromCol);
    const toPST = getPSTValue(attacker, move.toRow, move.toCol);
    score += (toPST - fromPST);

    return score;
}

// ============================================================
// Utilities
// ============================================================

/**
 * Returns the PST (Piece-Square Table) value for a piece at a given square.
 *
 * Black's table is vertically mirrored because Black plays from the
 * opposite side of the board.
 *
 * @param {Piece} piece  - The piece to evaluate.
 * @param {number} row   - Board row (0-7).
 * @param {number} col   - Board column (0-7).
 * @returns {number}     - Positional bonus/penalty.
 */
function getPSTValue(piece, row, col) {
    const table = PST.get(piece.constructor);
    if (!table) return 0;

    if (piece.color === PlayerColor.WHITE) {
        return table[row][col];
    }

    // Black: mirror the row index
    return table[7 - row][col];
}

/**
 * Returns the opponent's color.
 *
 * @param {string} color - Current player's color.
 * @returns {string}     - Opponent's color.
 */
function getOpponentColor(color) {
    return color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
}
