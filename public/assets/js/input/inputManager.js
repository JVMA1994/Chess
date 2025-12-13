class InputManager {
    constructor(game) {
        this.handleMenuClick = game.activeMenu.handleClick.bind(game.activeMenu);
        this.handleGameMouseDown = game.handleMouseDown.bind(game);
        this.handleGameMouseMove = game.handleMouseMove.bind(game);
        this.handleGameMouseUp = game.handleMouseUp.bind(game);
    }

    activateMainMenuControllers() {
        canvas.addEventListener("click", this.handleMenuClick);
    }

    deactivateMainMenuControllers() {
        canvas.removeEventListener("click", this.handleMenuClick);
    }

    activateGameControllers() {
        canvas.addEventListener("mousedown", this.handleGameMouseDown);
        canvas.addEventListener("mousemove", this.handleGameMouseMove);
        canvas.addEventListener("mouseup", this.handleGameMouseUp);
    }

}