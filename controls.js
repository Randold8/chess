// controls.js
class GameController {
    constructor(board) {
        this.board = board;
        this.selectedPiece = null;
        this.isDragging = false;
        this.dragStartTile = null;
        this.dragOffset = { x: 0, y: 0 };
        this.dragPosition = { x: 0, y: 0 }; // Initialize dragPosition
        this.currentTurn = 'white';
    }

    mousePressed(mouseX, mouseY) {
        const tileX = Math.floor(mouseX / tileSize);
        const tileY = Math.floor(mouseY / tileSize);
        const tile = this.board.getTileAt(tileX, tileY);

        if (tile && tile.occupyingPiece && tile.occupyingPiece.color === this.currentTurn) {
            this.selectedPiece = tile.occupyingPiece;
            this.isDragging = true;
            this.dragStartTile = tile;

            // Calculate offset within the tile for smooth dragging
            this.dragOffset.x = mouseX - (tileX * tileSize);
            this.dragOffset.y = mouseY - (tileY * tileSize);

            // Initialize drag position to current mouse position
            this.dragPosition = {
                x: mouseX - this.dragOffset.x,
                y: mouseY - this.dragOffset.y
            };

            // Clear the piece from its current tile while dragging
            tile.clear();
        }
    }

    mouseDragged(mouseX, mouseY) {
        if (!this.isDragging) return;

        // Update piece position for rendering
        this.dragPosition = {
            x: mouseX - this.dragOffset.x,
            y: mouseY - this.dragOffset.y
        };
    }

    // controls.js
    mouseReleased(mouseX, mouseY) {
        if (!this.isDragging) return;

        const targetX = Math.floor(mouseX / tileSize);
        const targetY = Math.floor(mouseY / tileSize);
        const targetTile = this.board.getTileAt(targetX, targetY);

        let moveSuccessful = false;

        if (targetTile && this.selectedPiece) {
            const captureResult = this.selectedPiece.isValidCapture(targetTile, this.board);
            if (captureResult.isValid) {
                // Mark captured pieces as dead
                captureResult.capturedPieces.forEach(piece => {
                    const pieceTile = piece.currentTile;
                    if (pieceTile) pieceTile.clear();
                    piece.state = 'dead';
                    piece.currentTile = null;
                });

                this.selectedPiece.spawn(targetTile);
                moveSuccessful = true;
            }
            // If no valid capture, check for valid move
            else if (this.selectedPiece.isValidMove(targetTile, this.board)) {
                this.selectedPiece.spawn(targetTile);
                moveSuccessful = true;
            }
        }

        if (!moveSuccessful) {
            // Return piece to original position
            this.selectedPiece.spawn(this.dragStartTile);
        } else {
            // Switch turns
            this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
            this.selectedPiece.hasMoved = true;
        }

        // Reset drag state
        this.isDragging = false;
        this.selectedPiece = null;
        this.dragStartTile = null;
        this.dragPosition = { x: 0, y: 0 };
    }


    draw() {
        // Draw currently dragged piece if any
        if (this.isDragging && this.selectedPiece) {
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(tileSize * 0.8);
            text(
                PIECE_EMOJIS[this.selectedPiece.color][this.selectedPiece.name],
                this.dragPosition.x + tileSize/2,
                this.dragPosition.y + tileSize/2
            );
        }
    }
}