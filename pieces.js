class Piece {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.currentTile = null;
        this.hasMoved = false; // Useful for pawns and castling
    }
    createCaptureResult(isValid, capturedPieces = []) {
        return {
            isValid: isValid,
            capturedPieces: capturedPieces
        };
    }

    spawn(tile) {
        if (!(tile instanceof Tile)) {
            throw new Error('Invalid tile object');
        }
        if (tile.occupyingPiece) {
            throw new Error('Tile is already occupied');
        }
        this.currentTile = tile;
        tile.occupy(this);
    }

    // Factory method to create specific piece types
    static createPiece(name, color) {
        switch(name.toLowerCase()) {
            case 'pawn': return new Pawn(color);
            case 'rook': return new Rook(color);
            case 'knight': return new Knight(color);
            case 'bishop': return new Bishop(color);
            case 'queen': return new Queen(color);
            case 'king': return new King(color);
            default: throw new Error('Invalid piece type');
        }
    }

    isPathClear(targetTile, board) {
        // Helper method to check if path is clear between current tile and target
        const dx = Math.sign(targetTile.x - this.currentTile.x);
        const dy = Math.sign(targetTile.y - this.currentTile.y);
        let x = this.currentTile.x + dx;
        let y = this.currentTile.y + dy;

        while (x !== targetTile.x || y !== targetTile.y) {
            if (board.getTileAt(x, y).occupyingPiece) {
                return false;
            }
            x += dx;
            y += dy;
        }
        return true;
    }
}

class Pawn extends Piece {
    constructor(color) {
        super('pawn', color);
    }

    isValidMove(targetTile, board) {
        const direction = this.color === 'white' ? -1 : 1;
        const startRank = this.color === 'white' ? 6 : 1;

        // Basic one square forward movement
        if (targetTile.x === this.currentTile.x &&
            targetTile.y === this.currentTile.y + direction &&
            !targetTile.occupyingPiece) {
            return true;
        }

        // Initial two square movement
        if (!this.hasMoved &&
            targetTile.x === this.currentTile.x &&
            targetTile.y === this.currentTile.y + (2 * direction) &&
            !targetTile.occupyingPiece &&
            !board.getTileAt(this.currentTile.x, this.currentTile.y + direction).occupyingPiece) {
            return true;
        }

        return false;
    }

    isValidCapture(targetTile, board) {
        const direction = this.color === 'white' ? -1 : 1;
        const isDiagonal = Math.abs(targetTile.x - this.currentTile.x) === 1 &&
                          targetTile.y === this.currentTile.y + direction;

        if (isDiagonal &&
            targetTile.occupyingPiece &&
            targetTile.occupyingPiece.color !== this.color) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}

class Rook extends Piece {
    constructor(color) {
        super('rook', color);
    }

    isValidMove(targetTile, board) {
        if (targetTile.occupyingPiece) return false;

        const sameRow = targetTile.y === this.currentTile.y;
        const sameCol = targetTile.x === this.currentTile.x;

        return (sameRow || sameCol) && this.isPathClear(targetTile, board);
    }

    isValidCapture(targetTile, board) {
        if (!targetTile.occupyingPiece || targetTile.occupyingPiece.color === this.color) {
            return this.createCaptureResult(false);
        }

        const sameRow = targetTile.y === this.currentTile.y;
        const sameCol = targetTile.x === this.currentTile.x;

        if ((sameRow || sameCol) && this.isPathClear(targetTile, board)) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}

class Knight extends Piece {
    constructor(color) {
        super('knight', color);
    }

    isValidMove(targetTile, board) {
        if (targetTile.occupyingPiece) return false;

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
    }

    isValidCapture(targetTile, board) {
        if (!targetTile.occupyingPiece || targetTile.occupyingPiece.color === this.color) {
            return this.createCaptureResult(false);
        }

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}

class Bishop extends Piece {
    constructor(color) {
        super('bishop', color);
    }

    isValidMove(targetTile, board) {
        if (targetTile.occupyingPiece) return false;

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        return dx === dy && this.isPathClear(targetTile, board);
    }

    isValidCapture(targetTile, board) {
        if (!targetTile.occupyingPiece || targetTile.occupyingPiece.color === this.color) {
            return this.createCaptureResult(false);
        }

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        if (dx === dy && this.isPathClear(targetTile, board)) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}

class Queen extends Piece {
    constructor(color) {
        super('queen', color);
    }

    isValidMove(targetTile, board) {
        if (targetTile.occupyingPiece) return false;

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);
        const sameRow = targetTile.y === this.currentTile.y;
        const sameCol = targetTile.x === this.currentTile.x;

        return ((sameRow || sameCol) || dx === dy) && this.isPathClear(targetTile, board);
    }

    isValidCapture(targetTile, board) {
        if (!targetTile.occupyingPiece || targetTile.occupyingPiece.color === this.color) {
            return this.createCaptureResult(false);
        }

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);
        const sameRow = targetTile.y === this.currentTile.y;
        const sameCol = targetTile.x === this.currentTile.x;

        if (((sameRow || sameCol) || dx === dy) && this.isPathClear(targetTile, board)) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}
// pieces.js (continued)
class King extends Piece {
    constructor(color) {
        super('king', color);
    }

    isValidMove(targetTile, board) {
        if (targetTile.occupyingPiece) return false;

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        return dx <= 1 && dy <= 1;
    }

    isValidCapture(targetTile, board) {
        if (!targetTile.occupyingPiece || targetTile.occupyingPiece.color === this.color) {
            return this.createCaptureResult(false);
        }

        const dx = Math.abs(targetTile.x - this.currentTile.x);
        const dy = Math.abs(targetTile.y - this.currentTile.y);

        if (dx <= 1 && dy <= 1) {
            return this.createCaptureResult(true, [targetTile.occupyingPiece]);
        }

        return this.createCaptureResult(false);
    }
}
