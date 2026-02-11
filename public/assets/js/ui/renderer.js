class Renderer {

    constructor(assets) {
        this.assets = assets;
    }

    drawBoard(board) {
        CTX.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let fillStyle = (row + col) % 2 !== 0 ? DARK_SQUARE : LIGHT_SQUARE;

                // Highlight Last Move (Lighter/Different color)
                if (board.lastMove &&
                    ((board.lastMove.from.row === row && board.lastMove.from.col === col) ||
                        (board.lastMove.to.row === row && board.lastMove.to.col === col))) {
                    // Use a yellowish highlight for last move
                    fillStyle = (row + col) % 2 !== 0 ? '#baca44' : '#f6f669';
                }

                // Highlight Checked King (Reddish)
                if (board.checkedKing && board.checkedKing.row === row && board.checkedKing.col === col) {
                    // Use a reddish highlight for check
                    fillStyle = '#ff6b6b';
                }

                CTX.fillStyle = fillStyle;
                CTX.fillRect(BOARD_X + col * SQUARE_SIZE, BOARD_Y + row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
                if (board.boardArr[row][col] !== null && board.boardArr[row][col].drag === false) {
                    CTX.drawImage(this.assets[board.boardArr[row][col].imgCode], BOARD_X + col * SQUARE_SIZE + 15, BOARD_Y + row * SQUARE_SIZE + 15, 50, 50);
                }
            }
        }
    }

    drawValidPositions(board, validMoves) {
        if (validMoves) {
            validMoves.forEach(coord => {
                CTX.beginPath();
                CTX.fillStyle = 'green';
                CTX.arc(BOARD_X + coord.toCol * SQUARE_SIZE + SQUARE_SIZE / 2, BOARD_Y + coord.toRow * SQUARE_SIZE + SQUARE_SIZE / 2, 10, 0, Math.PI * 2);
                CTX.fill();
            })
        }
    }

    drawPromotionOverlay(row, baseCol, options, color) {
        for (let i = 0; i < options.length; i++) {
            const col = baseCol + i;
            this.#drawPieceIcon(options[i], color, row, col);
        }
    }

    #drawPieceIcon(type, color, row, col) {
        const img = this.#getPromotionImage(type, color);

        if (!img) return;

        const x = BOARD_X + col * SQUARE_SIZE;
        const y = BOARD_Y + row * SQUARE_SIZE;

        // Optional background highlight
        CTX.save();
        CTX.globalAlpha = 0.85;
        CTX.fillStyle = "rgba(0, 0, 0, 0.4)";
        CTX.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        CTX.restore();

        CTX.drawImage(img, x + 6, y + 6, SQUARE_SIZE - 12, SQUARE_SIZE - 12);
    }

    #getPromotionImage(type, color) {
        const a = this.assets;
        const white = color === PlayerColor.WHITE;

        if (type === PromotionType.QUEEN) return white ? a.wQ : a.bQ;
        if (type === PromotionType.ROOK) return white ? a.wR : a.bR;
        if (type === PromotionType.BISHOP) return white ? a.wB : a.bB;
        if (type === PromotionType.KNIGHT) return white ? a.wN : a.bN;
    }

    renderDraggingPiece(mx, my, validMoves, board, draggedPiece) {
        this.drawBoard(board);
        this.drawValidPositions(board, validMoves)
        CTX.drawImage(
            this.assets[draggedPiece.imgCode],
            mx - PIECE_SIZE / 2,
            my - PIECE_SIZE / 2,
            PIECE_SIZE,
            PIECE_SIZE
        );
    }
}