// cards.js
class Card {
    constructor(name, description, board) {
        this.name = name;
        this.description = description;
        this.board = board;
        this.selectablePieces = new Map(); // Piece -> Target Tile mapping
        this.selectedPieces = new Map();    // Selected Piece -> Target Tile mapping
        this.maxSelections = 0;             // Override in subclasses
    }

    // Helper method to get all pieces of a specific type and color
    getPiecesByType(pieceName, colorRequirement = 'any') {
        return this.board.pieces.filter(piece => {
            if (piece.state === 'dead') return false;
            if (piece.name !== pieceName) return false;

            switch(colorRequirement) {
                case 'own':
                    return piece.color === this.board.gameState.currentPlayer;
                case 'enemy':
                    return piece.color !== this.board.gameState.currentPlayer;
                case 'any':
                    return true;
                default:
                    return false;
            }
        });
    }
    transformPiece(piece, newType) {
        return this.board.transformPiece(piece, newType);
    }

    // Add helper method to get pieces of multiple types
    getPiecesByTypes(pieceNames, colorRequirement = 'any') {
        return this.board.pieces.filter(piece => {
            if (piece.state === 'dead') return false;
            if (!pieceNames.includes(piece.name)) return false;

            switch(colorRequirement) {
                case 'own':
                    return piece.color === this.board.gameState.currentPlayer;
                case 'enemy':
                    return piece.color !== this.board.gameState.currentPlayer;
                case 'any':
                    return true;
                default:
                    return false;
            }
        });
    }

    // Called when card is drawn to determine valid selections
    determineSelectablePieces() {
        this.selectablePieces.clear();
        // Override in subclasses
    }

    // Handle piece selection/deselection
    toggleSelection(piece) {
        if (this.selectedPieces.has(piece)) {
            this.selectedPieces.delete(piece);
            return false; // Returns false for deselection
        } else if (this.selectablePieces.has(piece) &&
                  this.selectedPieces.size < this.maxSelections) {
            this.selectedPieces.set(piece, this.selectablePieces.get(piece));
            return true; // Returns true for selection
        }
        return null; // Returns null for no action
    }

    execute() {
        // Override in subclasses
    }

    draw(x, y, width, height) {
        // Draw card background
        fill(255);
        stroke(0);
        rect(x, y, width, height);

        // Draw card text
        fill(0);
        textAlign(CENTER, TOP);
        textSize(20);
        text(this.name, x + width/2, y + 10);

        textSize(16);
        text(this.description, x + width/2, y + 40);
    }

    // Helper method to highlight selectable tiles
    highlightSelectableTiles() {
        // Reset all tiles to normal state first
        this.board.tiles.forEach(tile => tile.resetState());

        // Set selectable tiles
        this.selectablePieces.forEach((targetTile, piece) => {
            piece.currentTile.state = 'selectable';
        });

        // Set selected tiles
        this.selectedPieces.forEach((targetTile, piece) => {
            piece.currentTile.state = 'selected';
        });
    }
}

class OnslaughtCard extends Card {
    constructor(board) {
        super("Onslaught",
              "Move up to three pawns one tile forward",
              board);
        this.maxSelections = 3;
    }

    determineSelectablePieces() {
        this.selectablePieces.clear();

        // Get all friendly pawns
        const pawns = this.getPiecesByType('pawn', 'own');

        // Check each pawn for valid forward movement
        pawns.forEach(pawn => {
            const forwardY = pawn.currentTile.y + (pawn.color === 'white' ? -1 : 1);
            const forwardTile = this.board.getTileAt(pawn.currentTile.x, forwardY);

            if (forwardTile && !forwardTile.occupyingPiece) {
                this.selectablePieces.set(pawn, forwardTile);
            }
        });
    }

    execute() {
        this.selectedPieces.forEach((targetTile, piece) => {
            piece.currentTile.clear();
            piece.spawn(targetTile);
        });
    }
}
class PolymorphCard extends Card {
    constructor(board) {
        super("Polymorph",
              "Demote any bishop or rook to a knight",
              board);
        this.maxSelections = 1;
    }

    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pieces = this.getPiecesByTypes(['bishop', 'rook'], 'any');
        pieces.forEach(piece => {
            this.selectablePieces.set(piece, piece.currentTile);
        });
    }

    execute() {
        this.selectedPieces.forEach((targetTile, piece) => {
            this.transformPiece(piece, 'knight');
        });
    }
}
class BizarreMutationCard extends Card {
    constructor(board) {
        super("Bizarre Mutation",
              "Promote a pawn to a jumper",
              board);
        this.maxSelections = 1;
    }

    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pawns = this.getPiecesByType('pawn', 'any');
        pawns.forEach(pawn => {
            this.selectablePieces.set(pawn, pawn.currentTile);
        });
    }

    execute() {
        this.selectedPieces.forEach((targetTile, piece) => {
            this.transformPiece(piece, 'jumper');
        });
    }
}

class DraughtCard extends Card {
    constructor(board) {
        super("Draught",
              "Demote a rook, bishop or knight to a jumper",
              board);
        this.maxSelections = 1;
    }

    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pieces = this.getPiecesByTypes(['rook', 'bishop', 'knight'], 'any');
        pieces.forEach(piece => {
            this.selectablePieces.set(piece, piece.currentTile);
        });
    }

    execute() {
        this.selectedPieces.forEach((targetTile, piece) => {
            this.transformPiece(piece, 'jumper');
        });
    }
}