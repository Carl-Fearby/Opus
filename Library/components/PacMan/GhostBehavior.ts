import { CollisionDetection } from './CollisionDetection';
import { DIR_ORDER, DIR_VECTORS, OPPOSITE, REGENERATION_DURATION } from './constants';
import { DirectionKey, Ghost, Point } from './types';
import { distance, isAligned } from './utils';

export class GhostBehavior {
    private collision: CollisionDetection;
    private ghostHomeArea: Point[];
    private rows: number;
    private cols: number;

    constructor(collision: CollisionDetection, ghostHomeArea: Point[], rows: number, cols: number) {
        this.collision = collision;
        this.ghostHomeArea = ghostHomeArea;
        this.rows = rows;
        this.cols = cols;
    }

    updateGhost(ghost: Ghost, delta: number, pacmanPosition: Point, scatterMode: boolean, pelletsEaten: number): void {
        if (ghost.state === 'frightened') {
            ghost.frightenedTimer -= delta;
            if (ghost.frightenedTimer <= 0) {
                ghost.state = scatterMode ? 'scatter' : 'chase';
                ghost.speedMultiplier = 1;
            }
        }
        if (ghost.regenerating) {
            ghost.regenerationTimer -= delta;
            if (ghost.regenerationTimer <= 0) {
                ghost.regenerating = false;
                ghost.state = scatterMode ? 'scatter' : 'chase';
                ghost.speedMultiplier = 1;
                ghost.direction = 'up';
            }
            return;
        }
        if (ghost.inHouse) {
            if (typeof ghost.homeWaitPellets === 'number' && pelletsEaten >= ghost.homeWaitPellets) {
                ghost.inHouse = false;
                ghost.state = scatterMode ? 'scatter' : 'chase';
                ghost.direction = 'up';
            } else {
                ghost.position = { ...ghost.home };
                ghost.direction = 'up';
                return;
            }
        }
        const inHomeArea = this.collision.isInGhostHome(ghost.position, this.ghostHomeArea);
        if (ghost.state === 'eyes') {
            const homeCenter = { x: 14.5, y: 13.5 };
            if (distance(ghost.position, homeCenter) < 0.3) {
                ghost.position = { ...homeCenter };
                ghost.regenerating = true;
                ghost.regenerationTimer = REGENERATION_DURATION;
                ghost.state = 'scatter';
                return;
            }
        }
        if (isAligned(ghost.position)) {
            const options = this.getAvailableDirections(ghost.position, ghost.direction);

            if (inHomeArea && ghost.state !== 'eyes' && !ghost.regenerating) {
                const homeCenterX = 14.5;
                const distanceFromCenter = Math.abs(ghost.position.x - homeCenterX);

                if (distanceFromCenter > 0.6) {
                    if (ghost.position.x < homeCenterX && options.includes('right')) {
                        ghost.direction = 'right';
                    } else if (ghost.position.x > homeCenterX && options.includes('left')) {
                        ghost.direction = 'left';
                    } else if (options.includes('up')) {
                        ghost.direction = 'up';
                    }
                } else if (options.includes('up')) {
                    ghost.direction = 'up';
                }
            } else {
                const target = this.getTarget(ghost, pacmanPosition, scatterMode);
                ghost.direction = this.chooseBestDirection(ghost.position, ghost.direction, options, target);
            }
        }
        const vec = DIR_VECTORS[ghost.direction];
        const speed = this.getSpeed(ghost);
        ghost.position.x += vec.x * speed * delta;
        ghost.position.y += vec.y * speed * delta;
        const wrapped = this.collision.wrapPosition(ghost.position.x, ghost.position.y);
        ghost.position.x = wrapped.x;
        ghost.position.y = wrapped.y;
    }

    private getAvailableDirections(position: Point, currentDirection: DirectionKey): DirectionKey[] {
        const options: DirectionKey[] = [];
        const opposite = OPPOSITE[currentDirection];

        for (const dir of DIR_ORDER) {
            if (dir === opposite) continue;
            if (this.collision.canMove(dir, position)) {
                options.push(dir);
            }
        }

        return options.length > 0 ? options : [currentDirection];
    }

    private getTarget(ghost: Ghost, pacmanPosition: Point, scatterMode: boolean): Point {
        if (ghost.state === 'frightened') {
            return {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows),
            };
        }

        if (ghost.state === 'eyes') {
            return { x: 14.5, y: 13.5 };
        }

        if (ghost.state === 'scatter' || scatterMode) {
            return ghost.scatterTarget;
        }
        return { ...pacmanPosition };
    }

    private chooseBestDirection(
        position: Point,
        currentDirection: DirectionKey,
        options: DirectionKey[],
        target: Point,
    ): DirectionKey {
        if (options.length === 1) return options[0];

        let bestDir: DirectionKey = options[0];
        let bestDist = Infinity;

        for (const dir of options) {
            const vec = DIR_VECTORS[dir];
            const testPos = {
                x: position.x + vec.x,
                y: position.y + vec.y,
            };
            const dist = distance(testPos, target);
            if (dist < bestDist) {
                bestDist = dist;
                bestDir = dir;
            }
        }

        return bestDir;
    }

    private getSpeed(ghost: Ghost): number {
        const baseSpeed = 6;
        if (ghost.state === 'eyes') return baseSpeed * 2;
        if (ghost.state === 'frightened') return baseSpeed * 0.5;
        return baseSpeed * ghost.speedMultiplier;
    }

    setFrightened(ghost: Ghost, duration: number): void {
        if (ghost.state === 'eyes' || ghost.regenerating) return;

        ghost.state = 'frightened';
        ghost.frightenedTimer = duration;
        ghost.speedMultiplier = 0.5;
        ghost.direction = OPPOSITE[ghost.direction];
    }

    becomeEyes(ghost: Ghost): void {
        ghost.state = 'eyes';
        ghost.frightenedTimer = 0;
        ghost.speedMultiplier = 2;
    }
}
