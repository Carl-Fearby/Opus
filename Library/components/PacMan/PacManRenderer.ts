import { DIR_VECTORS } from './constants';
import { Renderer } from './Renderer';
import { PacMan } from './types';

export class PacManRenderer extends Renderer {
    draw(pacman: PacMan): void {
        const px = pacman.position.x * this.tileSize;
        const py = pacman.position.y * this.tileSize;
        const radius = this.tileSize * 0.48;
        let baseAngle = 0;
        const dirVec = DIR_VECTORS[pacman.direction];
        if (dirVec.x === 1) baseAngle = 0;
        else if (dirVec.x === -1) baseAngle = Math.PI;
        else if (dirVec.y === -1) baseAngle = -Math.PI / 2;
        else if (dirVec.y === 1) baseAngle = Math.PI / 2;
        if (pacman.dying) {
            const progress = pacman.deathTimer / 2.0;
            const mouthAngle = 0.3 + (Math.PI - 0.3) * (1 - progress);

            this.ctx.fillStyle = '#fde047';
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.arc(px, py, radius, baseAngle + mouthAngle, baseAngle - mouthAngle, false);
            this.ctx.closePath();
            this.ctx.fill();
            return;
        }
        let mouth: number;
        if (pacman.isMoving) {
            mouth = Math.abs(Math.sin(pacman.mouthTimer)) * 0.8;
        } else {
            mouth = 0.4;
        }

        this.ctx.fillStyle = '#fde047';
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.arc(px, py, radius, baseAngle + mouth, baseAngle - mouth, false);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
