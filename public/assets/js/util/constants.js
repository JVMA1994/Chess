const CTX = document.getElementById('canvas').getContext('2d');

const CANVAS_SIZE = 700;
const BOARD_SIZE = 640;

const BOARD_X = (CANVAS_SIZE - BOARD_SIZE) / 2;
const BOARD_Y = (CANVAS_SIZE - BOARD_SIZE) / 2;

const SQUARE_SIZE = BOARD_SIZE / 8;
const PIECE_SIZE = 50;
const LIGHT_SQUARE = "#f0d9b5";
const DARK_SQUARE = "#b58863";
const canvas = document.getElementById('canvas');
const PIECE_CODES = Object.freeze({
    WHITE: { KING: "wK", QUEEN: "wQ", ROOK: "wR", BISHOP: "wB", KNIGHT: "wN", PAWN: "wP" },
    BLACK: { KING: "bK", QUEEN: "bQ", ROOK: "bR", BISHOP: "bB", KNIGHT: "bN", PAWN: "bP" }
});
const PlayerColor = Object.freeze({
    WHITE: 'WHITE',
    BLACK: 'BLACK'
})
const GameState = Object.freeze({
    // Initial states
    NOT_STARTED: 'NOT_STARTED',
    SETUP: 'SETUP',

    // Active gameplay states
    WHITE_TURN: 'WHITE_TURN',
    BLACK_TURN: 'BLACK_TURN',

    // Promotion states
    WHITE_PROMOTING: 'WHITE_PROMOTING',
    BLACK_PROMOTING: 'BLACK_PROMOTING',

    // End game states
    CHECKMATE_WHITE_WINS: 'CHECKMATE_WHITE_WINS',
    CHECKMATE_BLACK_WINS: 'CHECKMATE_BLACK_WINS',
    STALEMATE: 'STALEMATE',
    DRAW_BY_AGREEMENT: 'DRAW_BY_AGREEMENT',
    DRAW_BY_INSUFFICIENT_MATERIAL: 'DRAW_BY_INSUFFICIENT_MATERIAL',
    DRAW_BY_FIFTY_MOVE_RULE: 'DRAW_BY_FIFTY_MOVE_RULE',
    DRAW_BY_THREEFOLD_REPETITION: 'DRAW_BY_THREEFOLD_REPETITION',

    // Special states
    PAUSED: 'PAUSED',
    CONTINUE: 'CONTINUE',
    RESIGNED_WHITE: 'RESIGNED_WHITE',
    RESIGNED_BLACK: 'RESIGNED_BLACK',
    ABANDONED: 'ABANDONED',
    TIMEOUT_WHITE: 'TIMEOUT_WHITE',
    TIMEOUT_BLACK: 'TIMEOUT_BLACK'
});
const UserMessage = Object.freeze({
    CHECKMATE_WHITE_WINS: 'Checkmate: White wins',
    CHECKMATE_BLACK_WINS: 'Checkmate: Black wins',
    STALEMATE: 'Stalemate',
    PAUSED: 'Game Paused',
})

const CHECKMATE_SCORE = 100000;
const STALEMATE_SCORE = 0;
const MAX_PLY = 100;

const KNIGHT_OFFSETS = [
    [-2, -1], [-2, 1],
    [-1, -2], [-1, 2],
    [1, -2], [1, 2],
    [2, -1], [2, 1]
];

const KING_OFFSETS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
];

const ROOK_DIRS = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
];

const BISHOP_DIRS = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
];
const PromotionType = {
    QUEEN: 'QUEEN',
    ROOK: 'ROOK',
    BISHOP: 'BISHOP',
    KNIGHT: 'KNIGHT'
};

const PST_TABLES = {

    PAWN: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],

    KNIGHT: [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50],
    ],

    BISHOP: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20],
    ],

    ROOK: [
        [0, 0, 5, 10, 10, 5, 0, 0],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],

    QUEEN: [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20],
    ],

    KING: [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20],
    ]

};

