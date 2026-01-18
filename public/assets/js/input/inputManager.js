class InputManager {
    constructor(game) {
        this.game = game;

        // Bind once
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onMenuMouseMove = this.onMenuMouseMove.bind(this);

        this.handleGameMouseDown = game.handleMouseDown.bind(game);
        this.handleGameMouseMove = game.handleMouseMove.bind(game);
        this.handleGameMouseUp = game.handleMouseUp.bind(game);
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

    activateGameControllers() {
        canvas.addEventListener("mousedown", this.handleGameMouseDown);
        canvas.addEventListener("mousemove", this.handleGameMouseMove);
        canvas.addEventListener("mouseup", this.handleGameMouseUp);
    }

    deactivateGameControllers() {
        canvas.removeEventListener("mousedown", this.handleGameMouseDown);
        canvas.removeEventListener("mousemove", this.handleGameMouseMove);
        canvas.removeEventListener("mouseup", this.handleGameMouseUp);
    }

}