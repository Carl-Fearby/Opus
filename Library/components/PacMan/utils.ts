import { DIR_VECTORS, OPPOSITE } from './constants';
import { DirectionKey, Point } from './types';

export function distance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isAligned(pos: Point): boolean {
    const fracX = Math.abs(pos.x - Math.round(pos.x));
    const fracY = Math.abs(pos.y - Math.round(pos.y));
    return fracX < 0.05 && fracY < 0.05;
}

export function snapToCenter(coord: number): number {
    return Math.round(coord);
}

export function getOppositeDirection(dir: DirectionKey): DirectionKey {
    return OPPOSITE[dir];
}

export function getDirectionVector(dir: DirectionKey) {
    return DIR_VECTORS[dir];
}

export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function wrapPosition(x: number, y: number, cols: number, rows: number): Point {
    let newX = x;
    let newY = y;

    if (x < -0.5) newX = cols - 0.5;
    if (x > cols - 0.5) newX = -0.5;
    if (y < -0.5) newY = rows - 0.5;
    if (y > rows - 0.5) newY = -0.5;

    return { x: newX, y: newY };
}

export function parseGrid(layout: string[]): string[][] {
    return layout.map((row) => row.split(''));
}

export function findPositionsInGrid(grid: string[][], char: string): Point[] {
    const positions: Point[] = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === char) {
                positions.push({ x: col, y: row });
            }
        }
    }
    return positions;
}
