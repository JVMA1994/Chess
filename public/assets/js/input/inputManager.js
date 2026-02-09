class InputManager {
    constructor(game) {
        this.game = game;
    }

    addEventListeners(){
        canvas.addEventListener('mousedown', e => this.#onMouseDown(e));
        canvas.addEventListener('mousemove', e => this.#onMouseMove(e));
        canvas.addEventListener('mouseup',   e => this.#onMouseUp(e));
        canvas.addEventListener('click',     e => this.#onClick(e));
    }

    #onMouseDown(e) {
        if (this.#isGamePhase())
            this.game.handleMouseDown(e);
    }

    #onMouseMove(e) {
        if (this.#isPromotionPhase() || this.#isMenuPhase())
            this.game.activeMenu?.handleMouseMove(e);
        else
            this.game.handleMouseMove(e);
    }

    #onMouseUp(e) {
        if (this.#isGamePhase())
            this.game.handleMouseUp(e);
    }

    #onClick(e) {
        if (this.#isPromotionPhase() || this.#isMenuPhase())
            this.game.activeMenu?.handleClick(e);
    }

    #isGamePhase() {
        return (
            this.game.phase === GameState.WHITE_TURN ||
            this.game.phase === GameState.BLACK_TURN
        );
    }

    #isPromotionPhase() {
        return (
            this.game.phase === GameState.WHITE_PROMOTING ||
            this.game.phase === GameState.BLACK_PROMOTING
        );
    }

    #isMenuPhase() {
        return (
            this.game.phase === GameState.NOT_STARTED ||
                this.game.phase === GameState.CHECKMATE_BLACK_WINS ||
                this.game.phase === GameState.CHECKMATE_WHITE_WINS ||
                this.game.phase === GameState.STALEMATE
        );
    }

}