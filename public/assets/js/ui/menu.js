class Menu {
    draw() {}
    handleClick(e) {}
}

/**
 * Defines necessary methods and types for main menu
 */
class MainMenu extends Menu {
    #buttons = [
        { text: "2 Player", x: 250, y: 200, w: 200, h: 60 }
    ];

    constructor(game) {
        super();
        this.game = game;
    }

    draw() {
        CTX.fillStyle = "#222";
        CTX.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        CTX.fillStyle = "white";
        CTX.font = "48px Arial";
        CTX.fillText("Chess", 200, 120);

        this.#buttons.forEach(btn => {
            CTX.fillStyle = "#ffcc00";
            CTX.fillRect(btn.x, btn.y, btn.w, btn.h);

            CTX.fillStyle = "#000";
            CTX.font = "24px Arial";
            CTX.fillText(btn.text, btn.x + 30, btn.y + 38);
        });
    }

    handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        for (const btn of this.#buttons) {
            if (
                mx > btn.x && mx < btn.x + btn.w &&
                my > btn.y && my < btn.y + btn.h
            ) {
                this.game.startNewGame();
                break;
            }
        }
    }
}

class ResetMenu extends Menu {
    draw() {
        super.draw();
    }

    handleClick(e) {
        super.handleClick();
    }
}

