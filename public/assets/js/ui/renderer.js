class Renderer{

    drawBoard(board){
        CTX.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                if((row + col) % 2 !== 0){
                    CTX.fillStyle = DARK_SQUARE;
                }else{
                    CTX.fillStyle = LIGHT_SQUARE;
                }
                CTX.fillRect(BOARD_X + col * SQUARE_SIZE, BOARD_Y + row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
                if(board.boardArr[row][col] !== null && board.boardArr[row][col].drag === false){
                    CTX.drawImage(board.boardArr[row][col].image, BOARD_X + col * SQUARE_SIZE + 15, BOARD_Y + row * SQUARE_SIZE + 15, 50, 50);
                }
            }
        }
    }

    drawValidPositions(board, validMoves){
        if(validMoves){
            validMoves.forEach(coord => {
                CTX.beginPath();
                CTX.fillStyle = 'green';
                CTX.arc(BOARD_X + coord.toCol * SQUARE_SIZE + SQUARE_SIZE/2, BOARD_Y + coord.toRow * SQUARE_SIZE + SQUARE_SIZE/2, 10, 0, Math.PI * 2);
                CTX.fill();
            })

        }
    }
}