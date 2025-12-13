class Piece {
    constructor(img, color, row, col) {
        this.image = img;
        this.color = color; // "white" | "black"
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.drag = false;
    }

    getPossibleMoves(board) {
        return [];
    }

    getX() {
        return this.col * 80;
    }

    getY() {
        return this.row * 80;
    }

    isMovable(){

    }
}

class WhiteKing extends Piece {
    constructor(img) {
        super(img, "white", 7, 4);
    }
}

class BlackKing extends Piece {
    constructor(img) {
        super(img, "black", 0, 4);
    }
}

class WhiteQueen extends Piece {
    constructor(img) {
        super(img, "white", 7, 3);
    }
}

class BlackQueen extends Piece {
    constructor(img) {
        super(img, "black", 0, 3);
    }
}

class WhiteRook extends Piece {
    constructor(img, col) {
        super(img, "white", 7, col); // col: 0 or 7
    }
}

class BlackRook extends Piece {
    constructor(img, col) {
        super(img, "black", 0, col); // col: 0 or 7
    }
}

class WhiteBishop extends Piece {
    constructor(img, col) {
        super(img, "white", 7, col); // col: 2 or 5
    }
}

class BlackBishop extends Piece {
    constructor(img, col) {
        super(img, "black", 0, col);
    }
}
class WhiteKnight extends Piece {
    constructor(img, col) {
        super(img, "white", 7, col); // col: 1 or 6
    }
}

class BlackKnight extends Piece {
    constructor(img, col) {
        super(img, "black", 0, col); // col: 1 or 6
    }
}
class WhitePawn extends Piece {
    constructor(img, col) {
        super(img, "white", 6, col); // col: 0–7
    }
}

class BlackPawn extends Piece {
    constructor(img, col) {
        super(img, "black", 1, col); // col: 0–7
    }
}