import { Renderer } from './Renderer';
import { Point } from './types';

export class MazeRenderer extends Renderer {
    drawPellets(pellets: Point[]): void {
        this.ctx.fillStyle = '#fde047';
        pellets.forEach((pos) => {
            const x = pos.x * this.tileSize;
            const y = pos.y * this.tileSize;
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize * 0.12, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawPowerPellets(powerPellets: Point[], opacity: number): void {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = '#ffffff';
        powerPellets.forEach((pos) => {
            const x = pos.x * this.tileSize;
            const y = pos.y * this.tileSize;
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    drawWalls(wallGroups: Point[][], wallColor: string, wallGlowColor: string): void {
        const radius = this.tileSize * 0.5;

        this.ctx.strokeStyle = wallColor;
        this.ctx.lineWidth = this.tileSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.save();
        this.ctx.shadowBlur = this.tileSize * 0.6;
        this.ctx.shadowColor = wallGlowColor;

        wallGroups.forEach((group) => {
            if (group.length === 0) return;
            const hByY = new Map<number, Array<{ x1: number; x2: number }>>();
            group.forEach((wall) => {
                const y = wall.y;
                if (!hByY.has(y)) hByY.set(y, []);
                hByY.get(y)!.push({ x1: wall.x, x2: wall.x + 1 });
            });

            hByY.forEach((segs, y) => {
                segs.sort((a, b) => a.x1 - b.x1);
                const merged: Array<{ x1: number; x2: number }> = [];
                segs.forEach((seg) => {
                    if (merged.length === 0 || merged[merged.length - 1].x2 < seg.x1) {
                        merged.push({ ...seg });
                    } else {
                        merged[merged.length - 1].x2 = Math.max(merged[merged.length - 1].x2, seg.x2);
                    }
                });

                merged.forEach((seg) => {
                    const x1 = seg.x1 * this.tileSize + radius;
                    const x2 = seg.x2 * this.tileSize - radius;

                    if (x2 > x1) {
                        const yPix = this.clampY(y * this.tileSize + this.tileSize / 2);
                        const x1Pix = this.clampX(x1);
                        const x2Pix = this.clampX(x2);
                        const adjustedY = this.adjustCyForTunnel(x1Pix, yPix, true);

                        this.ctx.beginPath();
                        this.ctx.moveTo(x1Pix, adjustedY);
                        this.ctx.lineTo(x2Pix, adjustedY);
                        this.ctx.stroke();
                    }
                });
            });
            const vByX = new Map<number, Array<{ y1: number; y2: number }>>();
            group.forEach((wall) => {
                const x = wall.x;
                if (!vByX.has(x)) vByX.set(x, []);
                vByX.get(x)!.push({ y1: wall.y, y2: wall.y + 1 });
            });

            vByX.forEach((segs, x) => {
                segs.sort((a, b) => a.y1 - b.y1);
                const merged: Array<{ y1: number; y2: number }> = [];
                segs.forEach((seg) => {
                    if (merged.length === 0 || merged[merged.length - 1].y2 < seg.y1) {
                        merged.push({ ...seg });
                    } else {
                        merged[merged.length - 1].y2 = Math.max(merged[merged.length - 1].y2, seg.y2);
                    }
                });

                merged.forEach((seg) => {
                    const y1 = seg.y1 * this.tileSize + radius;
                    const y2 = seg.y2 * this.tileSize - radius;

                    if (y2 > y1) {
                        const xPix = this.clampX(x * this.tileSize + this.tileSize / 2);
                        const y1Pix = this.clampY(y1);
                        const y2Pix = this.clampY(y2);

                        this.ctx.beginPath();
                        this.ctx.moveTo(xPix, y1Pix);
                        this.ctx.lineTo(xPix, y2Pix);
                        this.ctx.stroke();
                    }
                });
            });
        });

        this.ctx.restore();
    }

    drawGhostHome(ghostHomeArea: Point[], wallColor: string): void {
        if (ghostHomeArea.length === 0) return;

        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        ghostHomeArea.forEach((spawn) => {
            minX = Math.min(minX, spawn.x);
            minY = Math.min(minY, spawn.y);
            maxX = Math.max(maxX, spawn.x);
            maxY = Math.max(maxY, spawn.y);
        });

        const padding = 0.5;
        const x = (minX - padding) * this.tileSize;
        const y = (minY - padding) * this.tileSize;
        const w = (maxX - minX + padding * 2) * this.tileSize;
        const h = (maxY - minY + padding * 2) * this.tileSize;

        this.ctx.strokeStyle = wallColor;
        this.ctx.lineWidth = Math.max(2, this.tileSize * 0.15);
        this.ctx.lineJoin = 'round';

        const gapWidth = this.tileSize * 2;
        const gapStart = x + w / 2 - gapWidth / 2;
        const gapEnd = x + w / 2 + gapWidth / 2;
        const cornerRadius = this.tileSize * 0.3;

        this.ctx.beginPath();
        const nudge = 0.5;
        this.ctx.moveTo(x + cornerRadius, y + h - nudge);
        this.ctx.arcTo(x, y + h - nudge, x, y + h - cornerRadius - nudge, cornerRadius);
        this.ctx.lineTo(x, y + cornerRadius + nudge);
        this.ctx.arcTo(x, y + nudge, x + cornerRadius, y + nudge, cornerRadius);
        this.ctx.lineTo(gapStart, y + nudge);
        this.ctx.moveTo(gapEnd, y + nudge);
        this.ctx.lineTo(x + w - cornerRadius, y + nudge);
        this.ctx.arcTo(x + w, y + nudge, x + w, y + cornerRadius + nudge, cornerRadius);
        this.ctx.lineTo(x + w, y + h - cornerRadius - nudge);
        this.ctx.arcTo(x + w, y + h - nudge, x + w - cornerRadius, y + h - nudge, cornerRadius);
        this.ctx.lineTo(x + cornerRadius, y + h - nudge);
        this.ctx.stroke();
    }
}
