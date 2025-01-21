// cards.js
class CardManager {
    constructor(board) {
        this.board = board;
        this.cardTypes = [
            OnslaughtCard,
            TelekinesisCard,
            DraughtCard,
            BizarreMutationCard,
            PolymorphCard
        ];
    }

    getAvailableCards() {
        const availableCards = [];

        this.cardTypes.forEach(CardClass => {
            // Create temporary card to check requirements
            const tempCard = new CardClass(this.board);
            if (tempCard.checkRequirements()) {
                availableCards.push(CardClass);
            }
        });

        return availableCards;
    }
}
class Card {
    constructor(name, description, board) {
        this.name = name;
        this.description = description;
        this.board = board;
        this.stages = 1;
        this.currentStage = 0;
        this.selectablePieces = new Map();
        this.selectedPieces = new Map();
        this.maxSelections = [1];

        // Initialize maps for all stages
        this.initializeStages();
    }
    initializeStages() {
        for (let i = 0; i < this.stages; i++) {
            this.selectedPieces.set(i, new Map());
        }
    }
    reset() {
        this.currentStage = 0;
        this.selectedPieces.clear();
        this.initializeStages();
        this.determineSelectablePieces();
    }

    // Called when advancing to next stage
    advanceStage() {
        if (this.currentStage < this.stages - 1) {
            this.currentStage++;
            return true;
        }
        return false;
    }

    // Returns true if current stage has reached its selection limit
    isStageComplete() {
        const currentSelections = this.selectedPieces.get(this.currentStage);
        return currentSelections.size >= this.maxSelections[this.currentStage];
    }
    addSelectable(target, destinationTile) {
        if (target && destinationTile) {
            // If target is a piece, verify it's alive
            if (target instanceof Piece) {
                if (target.state !== 'alive') return false;
            }
            this.selectablePieces.set(target, destinationTile);
            return true;
        }
        return false;
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
    movePiece(piece, targetTile) {
        if (piece && piece.state === 'alive' && targetTile) {
            piece.currentTile.clear();
            piece.spawn(targetTile);
            return true;
        }
        return false;
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
    checkRequirements() {
        // Override in subclasses
        return false;
    }

    // Handle piece selection/deselection
    toggleSelection(piece) {
        const currentSelections = this.selectedPieces.get(this.currentStage);

        if (currentSelections.has(piece)) {
            currentSelections.delete(piece);
            // If we unselect in a later stage, go back to stage 0
            if (this.currentStage > 0) {
                this.reset();
            } else {
                this.determineSelectablePieces();
            }
            return false;
        } else if (this.selectablePieces.has(piece) &&
                   currentSelections.size < this.maxSelections[this.currentStage]) {
            currentSelections.set(piece, this.selectablePieces.get(piece));

            // If stage is complete, automatically advance to next stage
            if (this.isStageComplete()) {
                this.advanceStage();
            }

            // Recalculate selectable pieces for the new stage
            this.determineSelectablePieces();
            return true;
        }
        return null;
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

        // Highlight selectable options for current stage
        this.selectablePieces.forEach((targetTile, target) => {
            if (target instanceof Piece) {
                if (target.currentTile && target.state === 'alive') {
                    target.currentTile.state = 'selectable';
                }
            } else if (target instanceof Tile) {
                target.state = 'selectable';
            }
        });

        // Highlight selections from all completed stages
        for (let stage = 0; stage < this.currentStage + 1; stage++) {
            const stageSelections = this.selectedPieces.get(stage);
            if (stageSelections) {
                stageSelections.forEach((targetTile, target) => {
                    if (target instanceof Piece) {
                        if (target.currentTile && target.state === 'alive') {
                            target.currentTile.state = 'selected';
                        }
                    } else if (target instanceof Tile) {
                        target.state = 'selected';
                    }
                });
            }
        }

        // For the current stage, also highlight target tiles if they're different from source
        const currentSelections = this.selectedPieces.get(this.currentStage);
        if (currentSelections) {
            currentSelections.forEach((targetTile, target) => {
                if (targetTile !== target && targetTile instanceof Tile) {
                    targetTile.state = 'selected';
                }
            });
        }
    }
}

class OnslaughtCard extends Card {
    constructor(board) {
        super("Onslaught",
              "Move up to three pawns one tile forward",
              board);
        this.maxSelections = 3;
    }
    checkRequirements() {
        const pawns = this.getPiecesByType('pawn', 'own');
        // Check if any pawn has a free space in front
        return pawns.some(pawn => {
            const forwardY = pawn.currentTile.y + (pawn.color === 'white' ? -1 : 1);
            const forwardTile = this.board.getTileAt(pawn.currentTile.x, forwardY);
            return forwardTile && !forwardTile.occupyingPiece;
        });
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
                this.addSelectablePiece(pawn, forwardTile);
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
    checkRequirements() {
        const pieces = this.getPiecesByTypes(['bishop', 'rook'], 'any');
        return pieces.length > 0;
    }
    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pieces = this.getPiecesByTypes(['bishop', 'rook'], 'any');
        pieces.forEach(piece => {
            this.addSelectablePiece(piece, piece.currentTile);
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
    checkRequirements() {
        const pawns = this.getPiecesByType('pawn', 'any');
        return pawns.length > 0;
    }
    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pawns = this.getPiecesByType('pawn', 'any');
        pawns.forEach(pawn => {
            this.addSelectablePiece(pawn, pawn.currentTile);
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
    checkRequirements() {
        const pieces = this.getPiecesByTypes(['rook', 'bishop', 'knight'], 'any');
        return pieces.length > 0;
    }
    determineSelectablePieces() {
        this.selectablePieces.clear();
        const pieces = this.getPiecesByTypes(['rook', 'bishop', 'knight'], 'any');
        pieces.forEach(piece => {
            this.addSelectablePiece(piece, piece.currentTile);
        });
    }

    execute() {
        this.selectedPieces.forEach((targetTile, piece) => {
            this.transformPiece(piece, 'jumper');
        });
    }
}
// Example of a multi-stage card
class TelekinesisCard extends Card {
    constructor(board) {
        super("Telekinesis",
              "Move an enemy pawn one cardinal tile",
              board);
        this.stages = 2;
        this.maxSelections = [1, 1];
        this.initializeStages();
    }

    determineSelectablePieces() {
        this.selectablePieces.clear();

        if (this.currentStage === 0) {
            // First stage: select enemy pawn
            const pawns = this.getPiecesByType('pawn', 'enemy');
            pawns.forEach(pawn => {
                if (this.hasValidCardinalMoves(pawn)) {
                    this.addSelectable(pawn, pawn.currentTile);
                }
            });
        }
        else if (this.currentStage === 1) {
            // Second stage: select destination tile
            const selectedPawn = Array.from(this.selectedPieces.get(0).keys())[0];
            if (selectedPawn) {
                const cardinalMoves = this.getValidCardinalMoves(selectedPawn);
                cardinalMoves.forEach(tile => {
                    this.addSelectable(tile, tile); // The tile itself is both the target and destination
                });
            }
        }
    }

    // Helper methods for cleaner code
    hasValidCardinalMoves(piece) {
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        return directions.some(([dx,dy]) => {
            const targetX = piece.currentTile.x + dx;
            const targetY = piece.currentTile.y + dy;
            const targetTile = this.board.getTileAt(targetX, targetY);
            return targetTile && !targetTile.occupyingPiece;
        });
    }

    getValidCardinalMoves(piece) {
        const validMoves = [];
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];

        directions.forEach(([dx,dy]) => {
            const targetX = piece.currentTile.x + dx;
            const targetY = piece.currentTile.y + dy;
            const targetTile = this.board.getTileAt(targetX, targetY);
            if (targetTile && !targetTile.occupyingPiece) {
                validMoves.push(targetTile);
            }
        });
        return validMoves;
    }

    execute() {
        if (this.currentStage !== this.stages - 1) return; // Don't execute if not at final stage

        const pawn = Array.from(this.selectedPieces.get(0).keys())[0];
        const targetTile = Array.from(this.selectedPieces.get(1).values())[0];

        if (pawn && targetTile) {
            this.movePiece(pawn, targetTile);
        }
    }

    checkRequirements() {
        const pawns = this.getPiecesByType('pawn', 'enemy');
        return pawns.some(pawn => this.hasValidCardinalMoves(pawn));
    }
}