class Renderer{

    drawBoard(board){
        CTX.fillStyle = LIGHT_SQUARE;
        CTX.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                if((row + col) % 2 !== 0){
                    CTX.fillStyle = DARK_SQUARE;
                    CTX.fillRect(col * 80, row * 80, 80, 80);
                }
                if(board.boardArr[row][col] !== null){
                    CTX.drawImage(board.boardArr[row][col].image, col * 80 + 15, row * 80 + 15, 50, 50);
                }
            }
        }
    }
}