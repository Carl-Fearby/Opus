import { COLS, DIR_VECTORS, ROWS } from './constants';
import { DirectionKey, Point, Vector } from './types';

export class CollisionDetection {
    private grid: string[][];

    constructor(grid: string[][]) {
        this.grid = grid;
    }

    canMove(dir: DirectionKey, position: Point): boolean {
        const vec = DIR_VECTORS[dir];
        const targetRow = Math.floor(position.y + vec.y);
        const targetCol = Math.floor(position.x + vec.x);
        return !this.isWall(targetRow, targetCol);
    }

    hitsWall(nextX: number, nextY: number, vec: Vector): boolean {
        const checkX = nextX + vec.x * 0.4;
        const checkY = nextY + vec.y * 0.4;
        return this.isWall(Math.floor(checkY), Math.floor(checkX));
    }

    isWall(row: number, col: number): boolean {
        if (row === 12 && (col < 0 || col >= COLS)) {
            return false;
        }

        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return true;
        }
        return this.grid[row]?.[col] === 'wall';
    }

    isInGhostHome(pos: Point, ghostHomeArea: Point[]): boolean {
        for (const homeCell of ghostHomeArea) {
            if (Math.abs(pos.x - homeCell.x) < 0.5 && Math.abs(pos.y - homeCell.y) < 0.5) {
                return true;
            }
        }
        return false;
    }

    wrapPosition(x: number, y: number): Point {
        let newX = x;
        const newY = y;
        if (y > 11.5 && y < 12.5) {
            if (x < -0.5) newX = COLS - 0.5;
            if (x > COLS - 0.5) newX = -0.5;
        }

        return { x: newX, y: newY };
    }
}
