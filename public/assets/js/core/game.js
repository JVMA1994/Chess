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
class Game{

    constructor(renderer, assets) {
        this.mainMenu = new MainMenu(this);
        this.activeMenu = this.mainMenu;
        this.inputManager = new InputManager(this);
        this.board = new Board();
        this.assets = assets;
        this.renderer = renderer;
    }

    start() {
        this.inputManager.activateMainMenuControllers();
        this.activeMenu.draw();
    }

    startNewGame(){
        //TODO need to move this to event handlers
        this.inputManager.deactivateMainMenuControllers();
        this.board.initializeBoard(this.assets);
        this.renderer.drawBoard(this.board);
        //TODO need to move this to event handlers
        this.inputManager.activateGameControllers();
    }

    switchTurn(){

    }

    isGameOver(){

    }

    handleMouseDown(e){
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for(let piece of this.board.pieces){
            if (mx >= piece.getX() && mx <= piece.getX() + SQUARE_SIZE && my >= piece.getY() && my <= piece.getY() + SQUARE_SIZE){
                this.board.boardArr[piece.row][piece.col] = null;
                this.renderer.drawBoard(this.board);
                CTX.drawImage(piece.image, mx - PIECE_SIZE / 2, my - PIECE_SIZE / 2, 60, 60);
                piece.drag = true;
            }
        }
    }

    handleMouseMove(e){
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for(let piece of this.board.pieces){
            if (piece.drag){
                this.renderer.drawBoard(this.board);
                CTX.drawImage(piece.image, mx - PIECE_SIZE / 2, my - PIECE_SIZE / 2, 60, 60);
            }
        }
    }

    handleMouseUp(e){
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let x = Math.floor(mx/80);
        let y = Math.floor(my/80);
        console.log(`X: ${x}, Y: ${y}`);
        for(let piece of this.board.pieces){
            if (piece.drag){
                piece.row = y;
                piece.col = x;
                this.board.boardArr[y][x] = piece;
                piece.drag = false;
            }
        }
        this.renderer.drawBoard(this.board);
    }
}