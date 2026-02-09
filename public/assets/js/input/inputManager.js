class InputManager {
    constructor(game) {
        this.game = game;

        // Bind once
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onMenuMouseMove = this.onMenuMouseMove.bind(this);

        this.onGameMouseDown = this.onGameMouseDown.bind(this);
        this.onGameMouseMove = this.onGameMouseMove.bind(this);
        this.onGameMouseUp = this.onGameMouseUp.bind(this);
    }

    // -------- MENU ROUTERS --------
    onMenuClick(e) {
        this.game.activeMenu?.handleClick(e);
    }

    onMenuMouseMove(e) {
        this.game.activeMenu?.handleMouseMove?.(e);
    }

    activateMenuControllers() {
        canvas.addEventListener("click", this.onMenuClick);
        canvas.addEventListener("mousemove", this.onMenuMouseMove);
    }

    deactivateMenuControllers() {
        canvas.removeEventListener("click", this.onMenuClick);
        canvas.removeEventListener("mousemove", this.onMenuMouseMove);
    }

    //-------- GAME CONTROLLERS --------

    onGameMouseDown(e){
        if(this.game.phase === GameState.WHITE_TURN || this.game.phase === GameState.BLACK_TURN)
            this.game.handleMouseDown(e);
    }

    onGameMouseMove(e) {
        if(this.game.phase === GameState.WHITE_TURN || this.game.phase === GameState.BLACK_TURN)
            this.game.handleMouseMove(e);
    }

    onGameMouseUp(e){
        if(this.game.phase === GameState.WHITE_TURN || this.game.phase === GameState.BLACK_TURN)
            this.game.handleMouseUp(e);
    }

    activateGameControllers() {
        canvas.addEventListener("mousedown", this.onGameMouseDown);
        canvas.addEventListener("mousemove", this.onGameMouseMove);
        canvas.addEventListener("mouseup", this.onGameMouseUp);
    }

    deactivateGameControllers() {
        canvas.removeEventListener("mousedown", this.onGameMouseDown);
        canvas.removeEventListener("mousemove", this.onGameMouseMove);
        canvas.removeEventListener("mouseup", this.onGameMouseUp);
    }

}