import { Renderer } from './Renderer';
import { Ghost } from './types';

export class GhostRenderer extends Renderer {
    private ghostScale: number;

    constructor(ctx: CanvasRenderingContext2D, tileSize: number, ghostScale: number) {
        super(ctx, tileSize);
        this.ghostScale = ghostScale;
    }

    setGhostScale(scale: number): void {
        this.ghostScale = scale;
    }

    draw(ghost: Ghost): void {
        const baseRadius = this.tileSize * 0.45;
        const radius = baseRadius * this.ghostScale;
        let px = ghost.position.x * this.tileSize;
        let py = ghost.position.y * this.tileSize;
        ghost.renderedX = px;
        ghost.renderedY = py;
        let color = ghost.color;
        if (ghost.regenerating) {
            const pulse = Math.abs(Math.sin((ghost.regenerationTimer ?? 0) * 3));
            const brightness = 200 + Math.floor(pulse * 55);
            color = `rgb(${brightness}, ${brightness}, ${brightness})`;
        } else if (ghost.state === 'frightened') {
            color = '#60a5fa';
        } else if (ghost.state === 'eyes') {
            color = '#bfdbfe';
        }
        if ((ghost.headbuttTimer ?? 0) > 0 && ghost.headbuttPhase === 'leaning') {
            const vibrateTime = performance.now() / 30;
            const seed = ghost.randomPhase ?? 0;
            px += Math.sin(vibrateTime * 7 + seed) * this.tileSize * 0.03;
            py += Math.cos(vibrateTime * 8.5 + seed * 1.5) * this.tileSize * 0.03;
        }
        if ((ghost.headbuttTimer ?? 0) > 0 && ghost.headbuttPhase === 'leaning') {
            const pulseTime = performance.now() / 200;
            const pulseAmount = (Math.sin(pulseTime) + 1) / 2;
            const glowIntensity = 0.15 + pulseAmount * 0.2;

            this.ctx.shadowBlur = 25 + pulseAmount * 15;
            this.ctx.shadowColor = `rgba(255, 0, 0, ${glowIntensity * 0.6})`;

            for (let i = 0; i < 3; i++) {
                const layerOpacity = glowIntensity * (0.3 - i * 0.08);
                this.ctx.strokeStyle = `rgba(255, 0, 0, ${layerOpacity})`;
                this.ctx.lineWidth = 8 + i * 4;

                this.ctx.beginPath();
                this.ctx.arc(px, py, radius, 0, Math.PI, true);
                this.ctx.stroke();
            }

            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
        }
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(px, py, radius, 0, Math.PI, true);
        const waveCount = 4;
        const waveWidth = (radius * 2) / waveCount;
        const waveDepth = radius * 0.22;

        for (let i = 0; i < waveCount; i++) {
            const x1 = px - radius + i * waveWidth;
            const cx = x1 + waveWidth / 2;
            const x2 = x1 + waveWidth;
            const y1 = py + radius;
            const y2 = py + radius + waveDepth;

            this.ctx.lineTo(x1, y1);
            this.ctx.quadraticCurveTo(cx, y2, x2, y1);
        }

        this.ctx.closePath();
        this.ctx.fill();
        const eyeOffsetX = this.tileSize * 0.15 * this.ghostScale;
        const eyeOffsetY = this.tileSize * 0.05 * this.ghostScale;
        const eyeRadius = this.tileSize * 0.15 * this.ghostScale;

        if (ghost.state !== 'eyes' && !ghost.regenerating) {
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(px - eyeOffsetX, py + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            this.ctx.arc(px + eyeOffsetX, py + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            const pupilRadius = this.tileSize * 0.07 * this.ghostScale;
            this.ctx.fillStyle = ghost.state === 'frightened' ? '#fff' : '#1e40af';
            this.ctx.beginPath();
            this.ctx.arc(px - eyeOffsetX, py + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            this.ctx.arc(px + eyeOffsetX, py + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            const pupilRadius = this.tileSize * 0.07 * this.ghostScale;
            this.ctx.fillStyle = '#1e40af';
            this.ctx.beginPath();
            this.ctx.arc(px - eyeOffsetX, py + eyeOffsetY, pupilRadius * 0.9, 0, Math.PI * 2);
            this.ctx.arc(px + eyeOffsetX, py + eyeOffsetY, pupilRadius * 0.9, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
