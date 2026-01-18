class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Registers a callback function for the specified event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {Function} callback - The callback function to invoke when the event is emitted.
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * Emits an event, invoking all registered callbacks with the provided data.
     * @param {string} eventName - The name of the event to emit.
     * @param {*} data - The data to pass to each event callback.
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }
}

/**
 * Responsibilities
 *
 * Initialize board, pieces, UI managers.
 * Track whose turn it is.
 * Route input events to board or menu.
 * Contain main update/draw loop.
 * Handle game states: menu, playing, promotion, checkmate, paused, etc.
 *
 * Key Methods
 *
 * startNewGame()
 * update(deltaTime)
 * draw(ctx)
 * handleClick(x, y)
 * switchTurn()
 * isGameOver()
 */
class Game extends EventEmitter {

    constructor(renderer, assets) {
        super();
        this.mainMenu = new MainMenu(this);
        this.resetMenu = new ResetMenu(this);
        this.activeMenu = this.mainMenu;
        this.inputManager = new InputManager(this);
        this.assets = assets;
        this.renderer = renderer;
        this.phase = GameState.NOT_STARTED;
    }

    start() {
        this.inputManager.activateMenuControllers();
        this.activeMenu.draw();
    }

    startNewGame() {
        this.board = new Board();
        this.inputManager.deactivateMenuControllers();
        this.board.initializeBoard(this.assets);
        this.renderer.drawBoard(this.board);
        this.inputManager.activateGameControllers();
        this.phase = GameState.WHITE_TURN;
    }

    switchTurn() {
        this.phase = this.phase === GameState.WHITE_TURN ? GameState.BLACK_TURN : GameState.WHITE_TURN;
    }

    isGameOver() {
        this.board.isCheckMate()
        this.board.isStaleMate();
    }

    /**
     * Handles mouse down events.
     * Selects a piece if it belongs to the current player and starts dragging.
     *
     * @param {MouseEvent} e - Mouse down event
     */
    handleMouseDown(e) {
        const {mx, my} = this.#getMousePosition(e);
        const {row, col} = this.#getBoardCoordinatesFromXY(mx, my);
        const piece = this.board.boardArr[row][col];

        if (!piece || !this.#isPlayersTurn(piece)) return;

        this.draggedPiece = piece;
        piece.drag = true;

        this.#renderDraggingPiece(mx, my);
    }

    /**
     * Handles mouse move events.
     * Re-renders the board and moves the dragged piece with the cursor.
     *
     * @param {MouseEvent} e - Mouse move event
     */
    handleMouseMove(e) {
        if (!this.draggedPiece) return;

        const {mx, my} = this.#getMousePosition(e);
        this.#renderDraggingPiece(mx, my);
    }

    /**
     * Handles mouse up events.
     * Drops the dragged piece, committing or reverting the move.
     *
     * @param {MouseEvent} e - Mouse up event
     */
    handleMouseUp(e) {
        if (!this.draggedPiece) return;

        const piece = this.draggedPiece;
        const {row, col} = this.#getBoardCoordinatesFromEvent(e);

        // Handle drops outside the board
        if (!this.#isInsideBoard(row, col)) {
            this.#resetPiecePosition(piece);
            return;
        }

        const move = new Move(piece.row, piece.col, row, col);

        // Attempt to make the move
        if (this.board.isLegalMove(piece, move)) {
            this.#executeLegalMove(move, piece);
        } else {
            this.#resetPiecePosition(piece);
        }
    }

    #executeLegalMove(move, piece) {
        this.board.makeMove(move);
        this.#resetPiecePosition(piece);

        const gameState = this.board.evaluateGameState(
            this.#getOpponentColor(piece.color)
        );

        if (gameState === GameState.CONTINUE) {
            this.switchTurn();
        } else {
            this.#handleGameEnd(gameState);
        }
    }

    #handleGameEnd(gameState) {
        this.phase = gameState;
        this.activeMenu = this.resetMenu;
        this.inputManager.deactivateGameControllers();
        this.activeMenu.draw();
        this.inputManager.activateMenuControllers();
    }

    #resetPiecePosition(piece) {
        this.#clearDragState(piece);
        this.renderer.drawBoard(this.board);
    }

    #getOpponentColor(color) {
        return PlayerColor.WHITE === color ? PlayerColor.BLACK : PlayerColor.WHITE;
    }

    /**
     * Returns mouse position relative to canvas.
     *
     * @param {MouseEvent} e
     * @returns {{mx: number, my: number}}
     */
    #getMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            mx: e.clientX - rect.left,
            my: e.clientY - rect.top
        };
    }

    #clearDragState(piece) {
        piece.drag = false;
        this.draggedPiece = null;
    }

    /**
     * Converts mouse position to board coordinates.
     *
     * @param {MouseEvent} e
     * @returns {{row: number, col: number}}
     */
    #getBoardCoordinatesFromEvent(e) {
        const {mx, my} = this.#getMousePosition(e);
        return {
            col: Math.floor((mx - BOARD_X) / SQUARE_SIZE),
            row: Math.floor((my - BOARD_Y) / SQUARE_SIZE)
        };
    }

    #getBoardCoordinatesFromXY(mx, my) {
        return {
            col: Math.floor((mx - BOARD_X) / SQUARE_SIZE),
            row: Math.floor((my - BOARD_Y) / SQUARE_SIZE)
        };
    }

    /**
     * Checks whether a piece belongs to the player whose turn it is.
     *
     * @param {Piece} piece
     * @returns {boolean}
     */
    #isPlayersTurn(piece) {
        return (
            (piece.color === PlayerColor.WHITE && this.phase === GameState.WHITE_TURN) ||
            (piece.color === PlayerColor.BLACK && this.phase === GameState.BLACK_TURN)
        );
    }

    /**
     * Checks whether the board coordinates are inside the chessboard.
     *
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    #isInsideBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    /**
     * Renders the board and draws the dragged piece at mouse position.
     *
     * @param {number} mx
     * @param {number} my
     */
    #renderDraggingPiece(mx, my) {
        this.renderer.drawBoard(this.board);
        this.renderer.drawValidPositions(this.board, this.draggedPiece)
        CTX.drawImage(
            this.draggedPiece.image,
            mx - PIECE_SIZE / 2,
            my - PIECE_SIZE / 2,
            PIECE_SIZE,
            PIECE_SIZE
        );
    }
}