// gameState.js
class GameState {
    constructor(board) {
        this.board = board;
        this.currentPlayer = 'white';
        this.turnCount = 0;
        this.cardDrawInterval = 3;
        this.currentCard = null;
        this.phase = 'normal';
        this.cardManager = new CardManager(board);
    }

    startTurn() {
        this.turnCount++;
        if (this.turnCount % this.cardDrawInterval === 0) {
            console.log('drawing card')
            this.drawCard();
        }
    }

    drawCard() {
        const availableCards = this.cardManager.getAvailableCards();

        if (availableCards.length === 0) {
            console.log("No cards available to draw!");
            return;
        }

        const CardClass = availableCards[Math.floor(Math.random() * availableCards.length)];
        this.currentCard = new CardClass(this.board);
        this.currentCard.determineSelectables();
        this.phase = 'card-selection';
        this.updateTileStates(); // Add this line
    }  

    handleCardSelection(tile) {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        // If the tile has a piece, pass the piece. Otherwise, pass the tile itself
        const selectTarget = tile.occupyingPiece || tile;
        this.currentCard.toggleSelection(selectTarget);
    }
    
    handlePieceSelection(tile) {
        if (this.phase !== 'normal') return;

        this.board.tiles.forEach(eachTile => {

            if (tile.occupyingPiece.isValidMove(eachTile,this.board) || tile.occupyingPiece.isValidCapture(eachTile,this.board).isValid){

                if (tile.occupyingPiece.name == "king" && tile.occupyingPiece.isInThreat(eachTile,this.board)){
                    eachTile.state = 'threated';
                }
                else
                {        
                    eachTile.state = 'selected';
                }
            }
        });
        
        if (tile.occupyingPiece.name == "king" && tile.occupyingPiece.isInThreat(tile,this.board)){
            tile.state = 'threated';
        }

    } 


    executeCard() {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        // Only execute if we're at the final stage
        if (this.currentCard.currentStage === this.currentCard.stages - 1) {
            this.currentCard.execute();
            this.board.resetTileStates();
            this.currentCard = null;
            this.phase = 'normal';
        }
    }

    declineCard() {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        this.board.resetTileStates();
        this.currentCard = null;
        this.phase = 'normal';
    }

    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.startTurn();
    }

    // Update button hit detection to match new positions
    isOverOkButton(x, y) {
        if (!this.currentCard || this.phase !== 'card-selection' || !this.currentCard.getState().buttons) return false;

        const okButton = this.currentCard.getState().buttons[0];
        return x > okButton.x && x < okButton.x + okButton.width &&
               y > okButton.y && y < okButton.y + okButton.height;
    }

    isOverDeclineButton(x, y) {
        if (!this.currentCard || this.phase !== 'card-selection' || !this.currentCard.getState().buttons) return false;
        const declineButton = this.currentCard.getState().buttons[1];
        return x > declineButton.x && x < declineButton.x + declineButton.width &&
               y > declineButton.y && y < declineButton.y + declineButton.height;
    }
    updateTileStates(reset = true) {
        // Reset all tiles first
        if (reset) this.board.resetTileStates();
        // If there's an active card in selection phase, update tile states
        if (this.currentCard && this.phase === 'card-selection') {
            this.currentCard.determineSelectables();

            // Update tile states based on selectables
            this.currentCard.selectableTiles.forEach(tile => {
                tile.state = 'selectable';
            });

            // Update selected tiles
            for (let stage = 0; stage <= this.currentCard.currentStage; stage++) {
                const stageSelections = this.currentCard.selectedObjects.get(stage);
                if (stageSelections) {
                    stageSelections.forEach((targetTile, selection) => {
                        targetTile.state = 'selected';
                    });
                }
            }
        }
    }
}


