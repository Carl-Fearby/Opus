import { COLS, ROWS } from './constants';

export class Renderer {
    protected ctx: CanvasRenderingContext2D;
    protected tileSize: number;
    protected width: number;
    protected height: number;

    constructor(ctx: CanvasRenderingContext2D, tileSize: number) {
        this.ctx = ctx;
        this.tileSize = tileSize;
        this.width = COLS * tileSize;
        this.height = ROWS * tileSize;
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    protected adjustCyForTunnel(cx: number, cy: number, isHorizontal: boolean): number {
        const row = Math.floor(cy / this.tileSize);
        if (row === 12 && isHorizontal) {
            return cy - this.tileSize * 0.1;
        }
        return cy;
    }

    protected clampX(x: number): number {
        return Math.max(0, Math.min(this.width, x));
    }

    protected clampY(y: number): number {
        return Math.max(0, Math.min(this.height, y));
    }
}
