import { CollisionDetection } from './CollisionDetection';
import { DIR_VECTORS } from './constants';
import { DirectionKey, PacMan, Point } from './types';
import { isAligned, snapToCenter } from './utils';

export class PacManBehavior {
    private collision: CollisionDetection;
    private ghostHomeArea: Point[];

    constructor(collision: CollisionDetection, ghostHomeArea: Point[]) {
        this.collision = collision;
        this.ghostHomeArea = ghostHomeArea;
    }

    update(pacman: PacMan, delta: number): void {
        if (isAligned(pacman.position) && this.collision.canMove(pacman.nextDirection, pacman.position)) {
            pacman.direction = pacman.nextDirection;
        }

        const vec = DIR_VECTORS[pacman.direction];
        const nextX = pacman.position.x + vec.x * pacman.speed * delta;
        const nextY = pacman.position.y + vec.y * pacman.speed * delta;
        const prevX = pacman.position.x;
        const prevY = pacman.position.y;
        const nextPos = { x: nextX, y: nextY };
        if (this.collision.isInGhostHome(nextPos, this.ghostHomeArea)) {
            pacman.position.x = snapToCenter(pacman.position.x);
            pacman.position.y = snapToCenter(pacman.position.y);
            pacman.isMoving = false;
        } else if (this.collision.hitsWall(nextX, nextY, vec)) {
            pacman.position.x = snapToCenter(pacman.position.x);
            pacman.position.y = snapToCenter(pacman.position.y);
            pacman.isMoving = false;
        } else {
            const wrapped = this.collision.wrapPosition(nextX, nextY);
            pacman.position.x = wrapped.x;
            pacman.position.y = wrapped.y;
            pacman.isMoving = true;
        }
        const moved = Math.abs(pacman.position.x - prevX) > 0.001 || Math.abs(pacman.position.y - prevY) > 0.001;
        if (moved) {
            pacman.mouthTimer += delta * 10;
            if (pacman.mouthTimer > Math.PI * 2) {
                pacman.mouthTimer -= Math.PI * 2;
            }
        }
    }

    updateDeath(pacman: PacMan, delta: number): void {
        if (pacman.dying) {
            pacman.deathTimer -= delta;
            if (pacman.deathTimer <= 0) {
                pacman.dying = false;
                pacman.deathTimer = 0;
            }
        }
    }

    setDirection(pacman: PacMan, direction: DirectionKey): void {
        pacman.nextDirection = direction;
    }

    reset(pacman: PacMan, spawnPosition: Point): void {
        pacman.position = { ...spawnPosition };
        pacman.direction = 'left';
        pacman.nextDirection = 'left';
        pacman.isMoving = false;
        pacman.dying = false;
        pacman.deathTimer = 0;
        pacman.mouthTimer = 0;
    }

    die(pacman: PacMan, deathDuration: number): void {
        pacman.dying = true;
        pacman.deathTimer = deathDuration;
        pacman.isMoving = false;
    }
}
