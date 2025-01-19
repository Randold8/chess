// sketch.js

// Piece emoji mapping
const PIECE_EMOJIS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
        jumper: '⛀'  
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
        jumper: '⛂' 
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
class Graveyard {
    constructor(color, x, y, width, height) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.deadPieces = {
            pawn: 0,
            rook: 0,
            knight: 0,
            bishop: 0,
            queen: 0,
            king: 0
        };
    }

    updateDeadPieces(board) {
        // Reset counts
        Object.keys(this.deadPieces).forEach(key => this.deadPieces[key] = 0);

        // Count dead pieces
        board.pieces.forEach(piece => {
            if (piece.color === this.color && piece.state === 'dead') {
                this.deadPieces[piece.name]++;
            }
        });
    }

    draw() {
        // Draw graveyard background
        fill(200);
        rect(this.x, this.y, this.width, this.height);

        // Draw pieces
        let xOffset = 10;
        let yOffset = 20;
        textSize(tileSize * 0.4); // Smaller size for graveyard pieces

        Object.entries(this.deadPieces).forEach(([pieceName, count]) => {
            if (count > 0) {
                // Draw piece emoji
                fill(0); // Set fill to black for the piece
                textAlign(LEFT, CENTER);
                text(PIECE_EMOJIS[this.color][pieceName],
                     this.x + xOffset,
                     this.y + yOffset);

                // Draw count
                textAlign(LEFT, CENTER);
                text(`x${count}`,
                     this.x + xOffset + tileSize * 0.5, // Increased spacing
                     this.y + yOffset);

                yOffset += tileSize * 0.5;
            }
        });
    }
}

class Board {
    constructor(width = 8, height = 8) {
        this.width = width;
        this.height = height;
        this.tiles = this.createTiles();
        this.pieces = []; // New property to track all pieces
    }

    addPiece(piece) {
        this.pieces.push(piece);
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
    // Make canvas wider to accommodate graveyards
    createCanvas(1000, 800);
    board = new Board();
    tileSize = 800 / 8; // Board size remains 800x800

    // Create graveyards
    whiteGraveyard = new Graveyard('white', 810, 400, 180, 390);
    blackGraveyard = new Graveyard('black', 810, 10, 180, 390);

    gameController = new GameController(board);

    // When creating pieces, add them to the board's piece array
    function setupPiece(name, color, x, y) {
        const piece = Piece.createPiece(name, color);
        piece.spawn(board.getTileAt(x, y));
        board.addPiece(piece);
    }

    // Set up black pieces
    setupPiece('rook', 'black', 0, 0);
    setupPiece('knight', 'black', 1, 0);
    setupPiece('bishop', 'black', 2, 0);
    setupPiece('queen', 'black', 3, 0);
    setupPiece('king', 'black', 4, 0);
    setupPiece('bishop', 'black', 5, 0);
    setupPiece('knight', 'black', 6, 0);
    setupPiece('rook', 'black', 7, 0);

    // Set up black pawns
    for(let i = 0; i < 8; i++) {
        setupPiece('pawn', 'black', i, 1);
    }

    // Set up white pieces
    setupPiece('rook', 'white', 0, 7);
    setupPiece('knight', 'white', 1, 7);
    setupPiece('bishop', 'white', 2, 7);
    setupPiece('queen', 'white', 3, 7);
    setupPiece('king', 'white', 4, 7);
    setupPiece('bishop', 'white', 5, 7);
    setupPiece('knight', 'white', 6, 7);
    setupPiece('rook', 'white', 7, 7);

    // Set up white pawns
    for(let i = 0; i < 8; i++) {
        setupPiece('pawn', 'white', i, 6);
    }
    setupPiece('jumper', 'white', 3, 5);
}

function draw() {
    background(220);
    board.draw();
    gameController.draw();

    // Update and draw graveyards
    whiteGraveyard.updateDeadPieces(board);
    blackGraveyard.updateDeadPieces(board);
    whiteGraveyard.draw();
    blackGraveyard.draw();
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
