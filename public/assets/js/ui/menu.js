class Menu {
    draw() {
    }

    handleClick(e) {
    }

    getMouse(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            mx: e.clientX - rect.left, my: e.clientY - rect.top
        };
    }
}

/**
 * Defines necessary methods and types for main menu
 */
class MainMenu extends Menu {
    #buttons = [{text: "2 Player", w: 220, h: 60}];

    constructor(game) {
        super();
        this.game = game;
        this.hoveredButton = null;
    }

    draw() {
        // Background
        CTX.fillStyle = "#1e1e1e";
        CTX.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Title
        CTX.fillStyle = "#ffffff";
        CTX.font = "bold 56px serif";
        CTX.textAlign = "center";
        CTX.fillText("CHESS", CANVAS_SIZE / 2, 140);

        this.#buttons.forEach((btn, i) => {
            const x = CANVAS_SIZE / 2 - btn.w / 2;
            const y = 240 + i * 90;

            btn.x = x;
            btn.y = y;

            const isHover = this.hoveredButton === btn;

            // Shadow
            CTX.shadowColor = "rgba(0,0,0,0.5)";
            CTX.shadowBlur = isHover ? 20 : 10;

            CTX.fillStyle = isHover ? "#e6c75f" : "#d4af37";
            drawRoundedRect(CTX, x, y, btn.w, btn.h, 12);
            CTX.fill();

            CTX.shadowBlur = 0;

            // Text
            CTX.fillStyle = "#000";
            CTX.font = "24px Arial";
            CTX.fillText(btn.text, CANVAS_SIZE / 2, y + 38);
        });

        CTX.textAlign = "left";
    }

    handleMouseMove(e) {
        const {mx, my} = this.getMouse(e);
        this.hoveredButton = null;

        for (const btn of this.#buttons) {
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                this.hoveredButton = btn;
            }
        }
        this.draw();
    }

    handleClick(e) {
        if (this.hoveredButton) {
            this.hoveredButton = null;
            this.game.startNewGame();
        }
    }
}

class ResetMenu extends Menu {
    #buttons = [{text: "Resume", w: 160, h: 50, action: "resume"}, {
        text: "Reset Game",
        w: 160,
        h: 50,
        action: "reset"
    }];

    constructor(game) {
        super();
        this.game = game;
        this.hoveredButton = null;
    }

    draw() {
        // Translucent overlay
        CTX.fillStyle = "rgba(0, 0, 0, 0.6)";
        CTX.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        this.#drawModal();
    }

    #drawModal() {
        // Modal box
        const boxW = 420;
        const boxH = 240;
        const boxX = CANVAS_SIZE / 2 - boxW / 2;
        const boxY = CANVAS_SIZE / 2 - boxH / 2;

        CTX.fillStyle = "#2b2b2b";
        drawRoundedRect(CTX, boxX, boxY, boxW, boxH, 16);
        CTX.fill();

        // Title
        CTX.fillStyle = "#fff";
        CTX.font = "bold 28px Arial";
        CTX.textAlign = "center";
        CTX.fillText(UserMessage[this.game.phase], CANVAS_SIZE / 2, boxY + 50);

        // Buttons
        this.#buttons.forEach((btn, i) => {
            const x = CANVAS_SIZE / 2 - btn.w / 2;
            const y = boxY + 90 + i * 70;

            btn.x = x;
            btn.y = y;

            const isHover = this.hoveredButton === btn;

            CTX.fillStyle = isHover ? "#e6c75f" : "#d4af37";
            drawRoundedRect(CTX, x, y, btn.w, btn.h, 10);
            CTX.fill();

            CTX.fillStyle = "#000";
            CTX.font = "20px Arial";
            CTX.fillText(btn.text, CANVAS_SIZE / 2, y + 32);
        });

        CTX.textAlign = "left";
    }

    handleMouseMove(e) {
        if (!(this.game.phase === GameState.CHECKMATE_WHITE_WINS || this.game.phase === GameState.CHECKMATE_BLACK_WINS || this.game.phase === GameState.PAUSED || this.game.phase === GameState.STALEMATE)) {
            return;
        }
        const {mx, my} = this.getMouse(e);
        this.hoveredButton = null;

        for (const btn of this.#buttons) {
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
                this.hoveredButton = btn;
            }
        }
        this.#drawModal();
    }

    handleClick() {
        if (!(this.game.phase === GameState.CHECKMATE_WHITE_WINS || this.game.phase === GameState.CHECKMATE_BLACK_WINS || this.game.phase === GameState.PAUSED || this.game.phase === GameState.STALEMATE)) {
            return;
        }
        if (!this.hoveredButton) return;

        if (this.hoveredButton.action === "resume") {
            this.hoveredButton = null;
            this.game.resume();
        } else if (this.hoveredButton.action === "reset") {
            this.hoveredButton = null;
            this.game.startNewGame();
        }
    }
}

// class PromotionMenu extends Menu {
//     constructor({
//                    game, assets, board, renderer, inputManager, pawn, onComplete
//                 }) {
//         super();
//         this.game = game;
//         this.assets = assets;
//         this.board = board;
//         this.renderer = renderer;
//         this.inputManager = inputManager;
//
//         this.pawn = pawn;
//         this.row = pawn.row;
//         this.col = pawn.col;
//
//         this.onComplete = onComplete;
//     }
//
//     #buildOptions(col) {
//         const baseCol = col <= 3 ? 0 : 4;
//         const promotionPieces = [Queen, Rook, Bishop, Knight];
//
//         this.options = promotionPieces.map((pieceClass, index) => ({
//             pieceClass, row: this.row, col: baseCol + index
//         }));
//     }
//
//     handleClick(e) {
//         if(!(this.game.phase === GameState.WHITE_PROMOTING || this.game.phase === GameState.BLACK_PROMOTING))
//             return;
//         const {mx, my} = this.getMouse(e);
//         const {row, col} = this.#getBoardCoordinatesFromXY(mx, my);
//
//         const selected = this.options.find(o => o.row === row && o.col === col);
//
//         if (!selected) return;
//         this.#promote(selected);
//     }
//
//     #promote(selectedPiece) {
//         const img = this.#getPromotionImage(selectedPiece.pieceClass, this.pawn.color);
//         const piece = new WhiteRook(img, this.col, this.row);
//         this.board.placePiece(piece);
//         this.onComplete();
//     }
//
//     #getBoardCoordinatesFromXY(mx, my) {
//         return {
//             col: Math.floor((mx - BOARD_X) / SQUARE_SIZE), row: Math.floor((my - BOARD_Y) / SQUARE_SIZE)
//         };
//     }
//
//     draw() {
//         this.renderer.drawBoard(this.board);
//         this.#buildOptions(this.col);
//         this.drawPromotionOverlay(this.options, this.pawn.color);
//     }
//
//     drawPromotionOverlay(options, color) {
//         for (const opt of options) {
//             this.drawPieceIcon(opt.pieceClass, color, opt.row, opt.col);
//         }
//     }
//
//
//     drawPieceIcon(PieceClass, color, row, col) {
//         const img = this.#getPromotionImage(PieceClass, color);
//
//         if (!img) return;
//
//         const x = BOARD_X + col * SQUARE_SIZE;
//         const y = BOARD_Y + row * SQUARE_SIZE;
//
//         // Optional background highlight
//         CTX.save();
//         CTX.globalAlpha = 0.85;
//         CTX.fillStyle = "rgba(0, 0, 0, 0.4)";
//         CTX.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
//         CTX.restore();
//
//         CTX.drawImage(img, x + 6, y + 6, SQUARE_SIZE - 12, SQUARE_SIZE - 12);
//     }
//
//     #getPromotionImage(PieceClass, color) {
//         const isWhite = color === PlayerColor.WHITE;
//
//         if (PieceClass === Queen) return isWhite ? this.assets.wQ : this.assets.bQ;
//         if (PieceClass === Rook) return isWhite ? this.assets.wR : this.assets.bR;
//         if (PieceClass === Bishop) return isWhite ? this.assets.wB : this.assets.bB;
//         if (PieceClass === Knight) return isWhite ? this.assets.wN : this.assets.bN;
//
//         return null;
//     }
//
//     handleMouseMove(e) {
//         if(!(this.game.phase === GameState.WHITE_PROMOTING || this.game.phase === GameState.BLACK_PROMOTING))
//             return;
//         this.draw();
//
//         const {mx, my} = this.getMouse(e);
//         const {row, col} = this.#getBoardCoordinatesFromXY(mx, my);
//         const x = BOARD_X + col * SQUARE_SIZE;
//         const y = BOARD_Y + row * SQUARE_SIZE;
//         if (col >= this.options.at(0).col && col <= this.options.at(3).col && this.options.at(0).row === row) {
//             CTX.save();
//             CTX.strokeStyle = "#FFD700";
//             CTX.lineWidth = 3;
//             CTX.strokeRect(x + 2, y + 2, SQUARE_SIZE - 4, SQUARE_SIZE - 4);
//             CTX.restore();
//         }
//     }
//
//     getMouse(e) {
//         const rect = canvas.getBoundingClientRect();
//         return {
//             mx: e.clientX - rect.left, my: e.clientY - rect.top
//         };
//     }
//
//
// }


class PromotionMenu extends Menu {
    constructor({game, pawn}) {
        super();
        this.game = game;
        this.pawn = pawn;
        this.row = pawn.row;
        this.col = pawn.col;

        this.options = [
            PromotionType.QUEEN,
            PromotionType.ROOK,
            PromotionType.BISHOP,
            PromotionType.KNIGHT
        ];
    }

    handleClick(e) {
        console.log("CLICK");
        if (!(this.game.phase === GameState.WHITE_PROMOTING || this.game.phase === GameState.BLACK_PROMOTING))
            return;
        const {mx, my} = this.getMouse(e)
        const {row, col} = this.#getBoardCoordinatesFromXY(mx, my);
        const index = col - this.#baseCol();

        if (index < 0 || index > 3 || row !== this.row) return;

        const selectedType = this.options[index];
        debugger;
        this.game.promotePawn(this.pawn, selectedType);
    }

    handleMouseMove(e) {
        if (!(this.game.phase === GameState.WHITE_PROMOTING || this.game.phase === GameState.BLACK_PROMOTING))
            return;
        this.draw();

        const {mx, my} = this.getMouse(e);
        const {row, col} = this.#getBoardCoordinatesFromXY(mx, my);
        const x = BOARD_X + col * SQUARE_SIZE;
        const y = BOARD_Y + row * SQUARE_SIZE;
        const index = col - this.#baseCol();

        if (index < 0 || index > 3 || row !== this.row)
            return;
        CTX.save();
        CTX.strokeStyle = "#FFD700";
        CTX.lineWidth = 3;
        CTX.strokeRect(x + 2, y + 2, SQUARE_SIZE - 4, SQUARE_SIZE - 4);
        CTX.restore();
    }


    draw() {
        this.game.renderer.drawBoard(this.game.board);
        this.game.renderer.drawPromotionOverlay(
            this.row,
            this.#baseCol(),
            this.options,
            this.pawn.color
        );
    }

    #baseCol() {
        return this.col <= 3 ? 0 : 4;
    }

    #getBoardCoordinatesFromXY(mx, my) {
        return {
            col: Math.floor((mx - BOARD_X) / SQUARE_SIZE), row: Math.floor((my - BOARD_Y) / SQUARE_SIZE)
        };
    }
}

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}