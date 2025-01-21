// gameState.js
class GameState{
    constructor(board) {
        this.board = board;
        this.currentPlayer = 'white';
        this.turnCount = 0;
        this.cardDrawInterval = 3; // Draw a card every 3 turns
        this.currentCard = null;
        this.phase = 'normal'; // 'normal', 'card-selection', 'card-execution'
    }

    startTurn() {
        this.turnCount++;
        if (this.turnCount % this.cardDrawInterval === 0) {
            console.log('drawing card')
            this.drawCard();
        }
    }

    drawCard() {
        const cardTypes = [
            OnslaughtCard,
            PolymorphCard,
            BizarreMutationCard,
            DraughtCard
        ];
        const CardClass = cardTypes[Math.floor(Math.random() * cardTypes.length)];

        this.currentCard = new CardClass(this.board);
        this.currentCard.determineSelectablePieces();
        this.phase = 'card-selection';
    }

    handleCardSelection(tile) {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        const piece = tile.occupyingPiece;
        if (!piece) return;

        this.currentCard.toggleSelection(piece);
    }

    executeCard() {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        this.currentCard.execute();
        this.board.resetTileStates(); // Reset states after execution
        this.currentCard = null;
        this.phase = 'normal';
    }

    declineCard() {
        if (!this.currentCard || this.phase !== 'card-selection') return;

        this.board.resetTileStates(); // Reset states after declining
        this.currentCard = null;
        this.phase = 'normal';
    }

    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.startTurn();
    }

    draw() {
        if (this.currentCard && this.phase === 'card-selection') {
            // Draw card UI only, not pieces
            this.currentCard.draw(width - 220, height - 120, 200, 100);

            // Draw buttons
            fill(200);
            rect(width - 220, height - 160, 90, 30);
            rect(width - 110, height - 160, 90, 30);

            fill(0);
            textAlign(CENTER, CENTER);
            text('OK', width - 175, height - 145);
            text('Decline', width - 65, height - 145);
        }
    }

    // Update button hit detection to match new positions
    isOverOkButton(x, y) {
        return this.phase === 'card-selection' &&
               x > width - 220 && x < width - 130 &&
               y > height - 160 && y < height - 130;
    }

    isOverDeclineButton(x, y) {
        return this.phase === 'card-selection' &&
               x > width - 110 && x < width - 20 &&
               y > height - 160 && y < height - 130;
    }
}
