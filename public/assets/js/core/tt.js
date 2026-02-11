/**
 * Transposition Table Entry Types
 */
const EntryType = {
    EXACT: 0,
    ALPHA: 1,
    BETA: 2
};

/**
 * Transposition Table (TT) for caching search results.
 * 
 * Architecture:
 * - Uses 64-bit Zobrist hashes as keys.
 * - Stores depth, score, node type (Exact, Alpha bound, Beta bound), and best move.
 * - Helps skip redundant searches (transpositions) and improves move ordering.
 */
class TranspositionTable {
    /**
     * @param {number} size - Number of entries in the table (power of 2 recommended).
     */
    constructor(size = 65536) {
        this.size = size;
        this.table = new Array(size).fill(null);
    }

    /**
     * Maps a 64-bit BigInt hash to a table index.
     * @param {bigint} hash 
     * @returns {number}
     */
    getIndex(hash) {
        // Handle negative BigInt results from % by adding size
        const idx = Number(hash % BigInt(this.size));
        return idx < 0 ? idx + this.size : idx;
    }

    /**
     * Stores an entry in the table.
     * Uses a "depth-preferred" replacement strategy.
     */
    store(hash, depth, score, type, bestMove = null, ply = 0) {
        const index = this.getIndex(hash);
        const existing = this.table[index];

        // Replace if slot is empty or if existing entry was searched at a shallower depth
        if (!existing || existing.depth <= depth) {
            this.table[index] = {
                hash,
                depth,
                score: scoreToTT(score, ply),
                type,
                bestMove
            };
        }
    }

    /**
     * Looks up a position in the table.
     * @param {bigint} hash 
     * @param {number} depth - Desired search depth.
     * @param {number} alpha 
     * @param {number} beta 
     * @returns {Object|null} - The entry if it can be used for a cutoff, or null.
     */
    lookup(hash, depth, alpha, beta, ply = 0) {
        const index = this.getIndex(hash);
        const entry = this.table[index];

        if (entry && entry.hash === hash) {
            if (entry.depth >= depth) {
                const score = scoreFromTT(entry.score, ply);
                if (entry.type === EntryType.EXACT) return score;
                if (entry.type === EntryType.ALPHA && score <= alpha) return score;
                if (entry.type === EntryType.BETA && score >= beta) return score;
            }
        }
        return null;
    }

    /**
     * Returns the best move stored for this position, regardless of depth.
     * Useful for move ordering.
     */
    getBestMove(hash) {
        const index = this.getIndex(hash);
        const entry = this.table[index];
        if (entry && entry.hash === hash) {
            return entry.bestMove;
        }
        return null;
    }

    clear() {
        this.table.fill(null);
    }
}

// Global instance for the engine
const tt = new TranspositionTable(131072); // 2^17 entries

function scoreToTT(score, ply) {
    if (score > CHECKMATE_SCORE - 1000) return score + ply;
    if (score < -CHECKMATE_SCORE + 1000) return score - ply;
    return score;
}

function scoreFromTT(score, ply) {
    if (score > CHECKMATE_SCORE - 1000) return score - ply;
    if (score < -CHECKMATE_SCORE + 1000) return score + ply;
    return score;
}
