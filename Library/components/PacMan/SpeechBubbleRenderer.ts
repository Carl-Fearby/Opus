import { Renderer } from './Renderer';
import { SpeechBubbles } from './SpeechBubbles';
import { Ghost, SpeechBubble } from './types';

export class SpeechBubbleRenderer extends Renderer {
    private speechBubbles: SpeechBubbles;

    constructor(ctx: CanvasRenderingContext2D, tileSize: number, speechBubbles: SpeechBubbles) {
        super(ctx, tileSize);
        this.speechBubbles = speechBubbles;
    }

    draw(bubble: SpeechBubble, ghosts: Ghost[], wallColor?: string): void {
        const ghost1 = ghosts.find((g) => g.id === bubble.ghostId1);
        const ghost2 = ghosts.find((g) => g.id === bubble.ghostId2);

        if (!ghost1 || !ghost2) return;

        const opacity = this.speechBubbles.getBubbleOpacity(bubble);
        const ghost1BaseX = ghost1.position.x * this.tileSize;
        const ghost1BaseY = ghost1.position.y * this.tileSize;
        const ghost2BaseX = ghost2.position.x * this.tileSize;
        const ghost2BaseY = ghost2.position.y * this.tileSize;

        const centerPx = (ghost1BaseX + ghost2BaseX) / 2;
        const centerPy = (ghost1BaseY + ghost2BaseY) / 2;

        const bubbleX = centerPx;
        const bubbleY = centerPy - this.tileSize * 2.2;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        const fontSize = this.tileSize * 0.7;
        this.ctx.font = `600 ${fontSize}px "Titillium Web", -apple-system, BlinkMacSystemFont, sans-serif`;
        const textMetrics = this.ctx.measureText(bubble.text);
        const textWidth = textMetrics.width;
        const paddingX = this.tileSize * 0.7;
        const paddingY = this.tileSize * 0.5;
        const bubbleWidth = textWidth + paddingX * 2;
        const bubbleHeight = fontSize + paddingY * 2;
        const cornerRadius = bubbleHeight / 2.2;
        this.ctx.fillStyle = '#1e293b';
        this.ctx.strokeStyle = wallColor || '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'round';

        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        this.ctx.beginPath();
        this.ctx.roundRect(
            bubbleX - bubbleWidth / 2,
            bubbleY - bubbleHeight / 2,
            bubbleWidth,
            bubbleHeight,
            cornerRadius,
        );
        this.ctx.fill();
        this.ctx.stroke();
        const tailY = bubbleY + bubbleHeight / 2;
        const triangleSize = this.tileSize * 0.25;

        this.ctx.fillStyle = '#1e293b';
        this.ctx.strokeStyle = wallColor || '#3b82f6';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(bubbleX - triangleSize / 2, tailY);
        this.ctx.lineTo(bubbleX, tailY + triangleSize);
        this.ctx.lineTo(bubbleX + triangleSize / 2, tailY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillStyle = '#f1f5f9';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(bubble.text, bubbleX, bubbleY);

        this.ctx.restore();
    }
}
