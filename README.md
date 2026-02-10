# Chess Game Engine

A JavaScript-based Chess engine with AI, featuring move validation, special moves (Castling, En Passant, Promotion), and a minimax-based AI.

## Features

### Core Game Logic
*   **Move Validation:** Full support for legal chess moves.
*   **Special Moves:**
    *   **Castling:** King-side and Queen-side castling.
    *   **En Passant:** Capture logic for pawns.
    *   **Promotion:** Pawn promotion to Queen, Rook, Bishop, or Knight.
*   **Game States:** Detection of Checkmate, Stalemate, and Draws.

### Artificial Intelligence
The AI uses a **Minimax Algorithm** with **Alpha-Beta Pruning** to determine the best move.

*   **Scoring System:**
    *   **Material Value:** Pieces are weighted (Pawn: 100, Knight: 320, Bishop: 330, Rook: 500, Queen: 900, King: 20000).
    *   **Piece-Square Tables (PST):** Positional bonuses encourage controlling the center and developing pieces (e.g., Knights in the center are worth more).
*   **Move Ordering:** Prioritizes captures, promotions, and checks to improve pruning efficiency.

## Code Structure

*   `public/assets/js/core/board.js`: Manages the board state, piece placement, and move execution (`makeMove`, `undoMove`).
*   `public/assets/js/core/chessAI.js`: AI logic including `findBestMove` and `minimax`.
*   `public/assets/js/util/constants.js`: Game constants, piece values, and PST definitions.

## Recent Fixes
*   **Castling Bug:** Fixed a crash where the Rook's internal coordinates were not updated during castling, causing the AI to fail.
*   **Promotion Undo:** Fixed an issue where undoing a promotion did not correctly restore the original pawn's position.

## Future Enhancements
*   **Opening Book:** Integrate an opening book to improve early-game play and reduce calculation time.
*   **Transposition Table:** Cache board states to avoid re-evaluating positions reached via different move orders.
*   **Quiescence Search:** Extend search at leaf nodes to resolve unstable positions (e.g., capture chains) to prevent the "horizon effect".
*   **Iterative Deepening:** Use iterative deepening to manage time constraints effectively.
*   **UI Improvements:** Add visual indicators for the last move, valid moves, and checked king.
