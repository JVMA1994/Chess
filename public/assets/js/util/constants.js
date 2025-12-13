const CTX = document.getElementById('canvas').getContext('2d');
const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 640;
const SQUARE_SIZE = 80;
const PIECE_SIZE = 50;
const LIGHT_SQUARE = "#f0d9b5";
const DARK_SQUARE = "#b58863";
const canvas = document.getElementById('canvas');
const PIECE_CODES = {
    WHITE: { KING: "wK", QUEEN: "wQ", ROOK: "wR", BISHOP: "wB", KNIGHT: "wN", PAWN: "wP" },
    BLACK: { KING: "bK", QUEEN: "bQ", ROOK: "bR", BISHOP: "bB", KNIGHT: "bN", PAWN: "bP" }
};