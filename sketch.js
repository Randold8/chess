// sketch.js

// Piece emoji mapping
const PIECE_EMOJIS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = 'normal';
        this.occupyingPiece = null;
    }

    occupy(piece) {
        if (this.occupyingPiece) {
            throw new Error(`Tile at ${this.x},${this.y} is already occupied`);
        }
        this.occupyingPiece = piece;
    }

    clear() {
        this.occupyingPiece = null;
    }

    draw(tileSize) {
        // Draw tile
        fill((this.x + this.y) % 2 === 0 ? '#ffffff' : '#808080');
        rect(this.x * tileSize, this.y * tileSize, tileSize, tileSize);

        // Draw piece if exists
        if (this.occupyingPiece) {
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(tileSize * 0.8);
            text(
                PIECE_EMOJIS[this.occupyingPiece.color][this.occupyingPiece.name],
                this.x * tileSize + tileSize/2,
                this.y * tileSize + tileSize/2
            );
        }
    }
}

class Board {
    constructor(width = 8, height = 8) {
        this.width = width;
        this.height = height;
        this.tiles = this.createTiles();
    }

    createTiles() {
        const tiles = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                tiles.push(new Tile(x, y));
            }
        }
        return tiles;
    }

    getTileAt(x, y) {
        return this.tiles.find(tile => tile.x === x && tile.y === y);
    }

    draw() {
        this.tiles.forEach(tile => tile.draw(tileSize));
    }
}

// p5.js specific code
let board;
let tileSize;
let gameController;

function setup() {
    createCanvas(800, 800);
    board = new Board();
    tileSize = width / 8;
    gameController = new GameController(board);

    // Set up initial pieces
    // Black pieces
    Piece.createPiece('rook', 'black').spawn(board.getTileAt(0, 0));
    Piece.createPiece('knight', 'black').spawn(board.getTileAt(1, 0));
    Piece.createPiece('bishop', 'black').spawn(board.getTileAt(2, 0));
    Piece.createPiece('queen', 'black').spawn(board.getTileAt(3, 0));
    Piece.createPiece('king', 'black').spawn(board.getTileAt(4, 0));
    Piece.createPiece('bishop', 'black').spawn(board.getTileAt(5, 0));
    Piece.createPiece('knight', 'black').spawn(board.getTileAt(6, 0));
    Piece.createPiece('rook', 'black').spawn(board.getTileAt(7, 0));

    // Black pawns
    for(let i = 0; i < 8; i++) {
        Piece.createPiece('pawn', 'black').spawn(board.getTileAt(i, 1));
    }

    // White pieces
    Piece.createPiece('rook', 'white').spawn(board.getTileAt(0, 7));
    Piece.createPiece('knight', 'white').spawn(board.getTileAt(1, 7));
    Piece.createPiece('bishop', 'white').spawn(board.getTileAt(2, 7));
    Piece.createPiece('queen', 'white').spawn(board.getTileAt(3, 7));
    Piece.createPiece('king', 'white').spawn(board.getTileAt(4, 7));
    Piece.createPiece('bishop', 'white').spawn(board.getTileAt(5, 7));
    Piece.createPiece('knight', 'white').spawn(board.getTileAt(6, 7));
    Piece.createPiece('rook', 'white').spawn(board.getTileAt(7, 7));

    // White pawns
    for(let i = 0; i < 8; i++) {
        Piece.createPiece('pawn', 'white').spawn(board.getTileAt(i, 6));
    }
}

function draw() {
    background(220);
    board.draw();
    gameController.draw();
}

function mousePressed() {
    gameController.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
    gameController.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
    gameController.mouseReleased(mouseX, mouseY);
}
