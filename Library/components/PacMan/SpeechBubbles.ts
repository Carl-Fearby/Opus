import { Ghost, SpeechBubble } from './types';

export class SpeechBubbles {
    private bubbles: SpeechBubble[] = [];

    addBubble(ghost1Id: string, ghost2Id: string, text: string): void {
        const exists = this.bubbles.find(
            (b) =>
                b.ghostId1 === ghost1Id ||
                b.ghostId2 === ghost1Id ||
                b.ghostId1 === ghost2Id ||
                b.ghostId2 === ghost2Id,
        );

        if (!exists) {
            this.bubbles.push({
                ghostId1: ghost1Id,
                ghostId2: ghost2Id,
                timer: 4.0,
                text,
            });
        }
    }

    update(delta: number): void {
        this.bubbles = this.bubbles.filter((bubble) => {
            bubble.timer -= delta;
            return bubble.timer > 0;
        });
    }

    getBubbles(): SpeechBubble[] {
        return this.bubbles;
    }

    clear(): void {
        this.bubbles = [];
    }

    getBubbleOpacity(bubble: SpeechBubble): number {
        const timeRemaining = bubble.timer;
        const totalDuration = 4.0;
        const fadeInTime = 0.3;
        const fadeOutTime = 1.0;
        const elapsed = totalDuration - timeRemaining;

        if (elapsed < fadeInTime) {
            return elapsed / fadeInTime;
        } else if (timeRemaining < fadeOutTime) {
            return timeRemaining / fadeOutTime;
        }
        return 1.0;
    }

    getBubblePosition(bubble: SpeechBubble, ghosts: Ghost[], tileSize: number): { x: number; y: number } | null {
        const ghost1 = ghosts.find((g) => g.id === bubble.ghostId1);
        const ghost2 = ghosts.find((g) => g.id === bubble.ghostId2);

        if (!ghost1 || !ghost2) return null;
        const ghost1BaseX = ghost1.position.x * tileSize;
        const ghost1BaseY = ghost1.position.y * tileSize;
        const ghost2BaseX = ghost2.position.x * tileSize;
        const ghost2BaseY = ghost2.position.y * tileSize;
        const centerX = (ghost1BaseX + ghost2BaseX) / 2;
        const centerY = (ghost1BaseY + ghost2BaseY) / 2;

        return {
            x: centerX,
            y: centerY - tileSize * 2.2,
        };
    }
}
