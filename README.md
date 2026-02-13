# JS Chess Engine

A robust, JavaScript-based Chess engine featuring a custom AI, complete rules implementation, and a Canvas-based user interface.

## 🌟 Features

### 🧠 Artificial Intelligence
 The engine uses a **Minimax algorithm with Alpha-Beta Pruning** to search for the best moves. It includes several optimizations to play competitively:
*   **Move Ordering**: enhancing pruning efficiency by prioritizing:
    *   Captures (MVV-LVA: Most Valuable Victim, Least Valuable Attacker)
    *   Promotions
    *   Checks
    *   Positional improvements (PST)
*   **Sophisticated Evaluation**:
    *   **Material**: Standard piece values.
    *   **Piece-Square Tables (PST)**: Context-aware piece placement scoring.
    *   **Positional Terms**:
        *   **Pawn Structure**: Penalties for isolated/doubled pawns, and **quadratic bonuses** for pushing passed pawns.
        *   **King Safety**: Penalties for open files near the king and bonuses for pawn shields.
    *   **Incremental Evaluation**: Efficient score updates ($O(1)$) during search.

### ♟️ Core Game Mechanics
*   **Move Validation**: Complete strict move generation including pins and checks.
*   **Special Moves**:
    *   **Castling**: Logic for King-side and Queen-side castling.
    *   **En Passant**: Correct capture handling.
    *   **Promotion**: Menu selection (UI).
*   **End Game Detection**: Checkmate, Stalemate, and Draw conditions.

### 🎨 User Interface
*   **Canvas Rendering**: Smooth, responsive chessboard drawn on HTML5 Canvas.
*   **Visual Aids**:
    *   **Last Move Highlight**: Yellow highlight for the squares involved in the most recent move.
    *   **Check Indicator**: Red highlight for the King when in check.
    *   **Valid Move Hints**: Dots showing where a selected piece can move.
*   **Menus**: Start menu, Pause/Resume, and Game Over modals.

## 🛠️ Code Structure

*   `public/assets/js/core/`
    *   **`board.js`**: The heart of the engine. Manages state, move generation (`getLegalMoves`), incremental hashing/evaluation, and applies moves.
    *   **`chessAI.js`**: Contains the `findBestMove` function and the Minimax/Alpha-Beta search logic.
    *   **`game.js`**: Orchestrates the game loop, handles input events, and manages UI interaction.
    *   **`piece.js`**: Classes for each Piece type (`Rook`, `Knight`, etc.) defining movement rules.
    *   **`move.js`**: Data structure representing a chess move.
    *   **`zobrist.js`**: Implements Zobrist Hashing for efficient board state identification (prepared for Transposition Tables).
    *   **`tt.js`**: Transposition Table implementation (AI cache).
*   `public/assets/js/ui/`
    *   **`renderer.js`**: Handles all drawing operations on the Canvas.
    *   **`menu.js`**: Manages UI overlays and buttons.

## 🚀 How to Run

1.  Clone the repository.
2.  Open `index.html` in any modern web browser.
3.  Play against the AI!

## 🎮 Controls

*   **Click & Drag**: Move pieces.
*   **Click**: Select a piece to see valid moves.
*   **Menus**: Use on-screen buttons to Reset or Resume.

## 🔮 Future Improvements

*   **Transposition Table**: Fully integrate the implemented TT into the search to handle transpositions.
*   **Quiescence Search**: Fix horizon effects by searching dynamic capture chains at depth limits.
*   **Iterative Deepening**: Implement time management for the AI.
*   **Fix**: Promotion logic for AI. 4 piece promotion to be supported [QUEEN, KNIGHT, BISHOP, ROOK].
