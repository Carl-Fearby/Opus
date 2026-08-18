import { AudioSystem } from './AudioSystem';
import {
    BLINK_COOLDOWN_MAX,
    BLINK_COOLDOWN_MIN,
    BLINK_DURATION,
    COLS,
    DEATH_ANIMATION_DURATION,
    DIR_ORDER,
    DIR_VECTORS,
    FRIGHTENED_DURATION,
    FRUIT_THRESHOLDS,
    GAMEOVER_BLINK_CYCLE,
    GAMEOVER_EYEROLL_CYCLE,
    GAMEOVER_GLANCE_CYCLE,
    GAMEOVER_WINK_CYCLE,
    GHOST_BASE_SPEED,
    GHOST_CONFIG,
    GHOST_RELEASE_PELLETS,
    getRandomApology,
    HOUSE_SHIVER_AMPLITUDE,
    HOUSE_SHIVER_FREQ_MS,
    OPPOSITE,
    PACMAN_BASE_SPEED,
    READY_DELAY,
    REGENERATION_DURATION,
    ROWS,
    WAIT_FRIGHT_COOLDOWN_MAX,
    WAIT_FRIGHT_COOLDOWN_MIN,
    WINK_COOLDOWN_MAX,
    WINK_COOLDOWN_MIN,
    WINK_DURATION,
} from './constants';
import { MAZES } from './mazes';
import type { DirectionKey, Ghost, Point, SpeechBubble, Vector } from './types';

const FRUIT_CONFIG = [
    { level: 1, type: '🍒', name: 'cherry', score: 100 },
    { level: 2, type: '🍓', name: 'strawberry', score: 300 },
    { level: 3, type: '🍊', name: 'orange', score: 500 },
    { level: 4, type: '🍎', name: 'apple', score: 700 },
    { level: 5, type: '🍈', name: 'melon', score: 1000 },
    { level: 6, type: '🔔', name: 'galaxian', score: 2000 },
    { level: 7, type: '🔑', name: 'key', score: 5000 },
];

export type GridCell = 'wall' | 'pellet' | 'power' | 'empty';

export interface PacmanCallbacks {
    onScore: (score: number) => void;
    onLives: (lives: number) => void;
    onLevel: (level: number) => void;
    onStatus: (status: string) => void;
}

const clampDelta = (delta: number) => Math.min(0.05, Math.max(0, delta));

export class PacmanEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private callbacks: PacmanCallbacks;
    private audio: AudioSystem;
    private tileSize = 16;
    private animationFrame: number | null = null;
    private lastTime = 0;
    private running = false;
    private paused = false;
    private grid: GridCell[][] = [];
    private pelletPositions: Point[] = [];
    private powerPelletPositions: Point[] = [];
    private wallGroups: Point[][] = [];
    private pelletsRemaining = 0;
    private totalPelletCount = 0;
    private currentMaze: { layout: string[]; wallColor: string; wallGlowColor: string };
    private pacman = {
        position: { x: 14.5, y: 19.5 },
        direction: 'left' as DirectionKey,
        nextDirection: 'left' as DirectionKey,
        speed: PACMAN_BASE_SPEED,
        mouthTimer: 0,
        dying: false,
        deathTimer: 0,
        isMoving: false,
    };
    private pacmanSpawn: Point = { x: 14.5, y: 19.5 };
    private ghosts: Ghost[] = [];
    private ghostMap: Map<string, Ghost> = new Map();
    private ghostSpawns: Point[] = [];
    private scatterMode = true;
    private modeTimer = 7;
    private ghostEatValue = 200;
    private phase: 'waiting' | 'ready' | 'playing' | 'respawn' | 'over' = 'waiting';
    private phaseTimer = READY_DELAY;
    private countdown = -1;
    private score = 0;
    private lives = 3;
    private level = 1;
    private killerGhost: Ghost | null = null;
    private gameOverAnimTimer = 0;
    private bonusPopups: Array<{ score: number; position: Point; timer: number }> = [];
    private speechBubbles: SpeechBubble[] = [];
    private fruitBonus: {
        active: boolean;
        position: Point;
        type: string;
        score: number;
        timer: number;
        spawnTimer: number;
    } = {
        active: false,
        position: { x: 14.5, y: 19.5 },
        type: 'cherry',
        score: 100,
        timer: 0,
        spawnTimer: 15,
    };
    private fruitSpawnedThresholds: boolean[] = [];
    private powerPelletOpacity = 1;
    private powerPelletTimer = 0;
    private ghostScale = 1;

    constructor(canvas: HTMLCanvasElement, callbacks: PacmanCallbacks) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to acquire 2D context');
        }
        this.ctx = ctx;
        this.callbacks = callbacks;
        this.audio = new AudioSystem();
        const soundFiles = {
            waka0: '/sounds/eat_dot_0.wav',
            waka1: '/sounds/eat_dot_1.wav',
            eatGhost: '/sounds/eat_ghost.wav',
            eatFruit: '/sounds/eat_fruit.wav',
            powerPellet: '/sounds/fright.wav',
            death: '/sounds/death_0.wav',
            death_1: '/sounds/death_1.wav',
            frightened: '/sounds/siren0.wav',
            start: '/sounds/start.wav',
        };

        this.audio
            .initialize(soundFiles)
            .then(() => {
                // Audio loaded successfully
            })
            .catch((err) => {
                console.error('Failed to load sounds:', err);
            });

        this.currentMaze = MAZES[Math.floor(Math.random() * MAZES.length)];
        this.restart();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.animationFrame = requestAnimationFrame(this.loop);
    }

    stop() {
        this.running = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stop();
        this.audio.stopAll();
    }

    restart() {
        this.audio.stopAll();
        // Start with first maze
        this.currentMaze = MAZES[0];

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.paused = false;
        this.scatterMode = true;
        this.modeTimer = 7;
        this.ghostEatValue = 200;
        this.phase = 'waiting';
        this.phaseTimer = READY_DELAY;
        this.countdown = -1;
        this.pacman.dying = false;
        this.pacman.deathTimer = 0;

        this.powerPelletOpacity = 1;
        this.powerPelletTimer = 0;

        this.callbacks.onScore(this.score);
        this.callbacks.onLives(this.lives);
        this.callbacks.onLevel(this.level);
        this.callbacks.onStatus('Press Start');

        this.initializeLevel();
        if (!this.running) {
            this.start();
        }
    }

    setPaused(paused: boolean) {
        this.paused = paused;
        if (this.phase === 'playing') {
            this.callbacks.onStatus(paused ? 'Paused' : 'Playing');
        }
    }

    startGame() {
        if (this.phase === 'waiting') {
            this.countdown = 3;
            this.phase = 'ready';
            this.phaseTimer = 1.0;
            this.audio
                .resume()
                .then(() => {
                    this.audio.play('start');
                })
                .catch(() => {
                    this.audio.play('start');
                });

            requestAnimationFrame(() => {
                this.callbacks.onStatus('Get Ready!');
            });
        }
    }
    resize(width: number, height: number) {
        if (!width || !height) return;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const size = Math.max(10, Math.floor(Math.min(width / COLS, height / ROWS)));
        this.tileSize = size;
        const pixelWidth = size * COLS;
        const pixelHeight = size * ROWS;
        this.canvas.style.width = `${pixelWidth}px`;
        this.canvas.style.height = `${pixelHeight}px`;
        this.canvas.width = Math.floor(pixelWidth * dpr);
        this.canvas.height = Math.floor(pixelHeight * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setDirection(dir: DirectionKey) {
        this.pacman.nextDirection = dir;
    }

    isPacmanAligned(): boolean {
        return this.isAligned(this.pacman.position);
    }

    private loop = (timestamp: number) => {
        if (!this.running) return;
        const delta = clampDelta((timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;

        if (!this.paused) {
            this.update(delta);
        }
        this.draw();

        this.animationFrame = requestAnimationFrame(this.loop);
    };

    private initializeLevel() {
        const { grid, pellets, pacmanStart, ghostStarts, pelletPositions, powerPelletPositions } = this.parseLayout();
        this.grid = grid;
        this.pelletPositions = pelletPositions;
        this.powerPelletPositions = powerPelletPositions;
        this.pelletsRemaining = pellets;
        this.totalPelletCount = pellets;
        this.pacmanSpawn = pacmanStart;
        this.ghostSpawns = ghostStarts;
        this.pacman.position = { ...pacmanStart };
        this.pacman.direction = 'left';
        this.pacman.nextDirection = 'left';
        this.pacman.speed = PACMAN_BASE_SPEED + (this.level - 1) * 0.2;
        this.pacman.mouthTimer = 0;
        this.pacman.dying = false;
        this.pacman.deathTimer = 0;

        // Safety check: If pacman somehow spawns in ghost house, move him out
        if (this.isInGhostHome(this.pacman.position)) {
            this.pacman.position = { x: 14.5, y: 19.5 };
        }
        this.ghosts = this.createGhosts();
        this.updateGhostMap();
        this.modeTimer = this.scatterMode ? 7 : 20;
        this.fruitBonus.active = false;
        this.fruitBonus.position = { ...pacmanStart };
        this.fruitBonus.spawnTimer = 15;
        this.fruitSpawnedThresholds = FRUIT_THRESHOLDS.map(() => false);
        this.wallGroups = this.computeWallGroups();
        if (this.phase !== 'ready' && this.phase !== 'waiting') {
            this.phase = 'ready';
            this.phaseTimer = READY_DELAY;
            this.callbacks.onStatus('Ready!');
        }
    }

    private parseLayout() {
        let pelletCount = 0;
        let pacmanStart: Point = { x: 14.5, y: 19.5 };
        const ghostStarts: Point[] = [];
        const pelletPositions: Point[] = [];
        const powerPelletPositions: Point[] = [];

        const grid: GridCell[][] = this.currentMaze.layout.map((row, rowIndex) => {
            return row.split('').map((cell, colIndex) => {
                switch (cell) {
                    case '#':
                        return 'wall';
                    case '.':
                        pelletCount += 1;
                        pelletPositions.push({ x: colIndex, y: rowIndex });
                        return 'pellet';
                    case 'o':
                        pelletCount += 1;
                        powerPelletPositions.push({ x: colIndex, y: rowIndex });
                        return 'power';
                    case 'P':
                        pacmanStart = { x: colIndex + 0.5, y: rowIndex + 0.5 };
                        return 'empty';
                    case 'G':
                        ghostStarts.push({ x: colIndex + 0.5, y: rowIndex + 0.5 });
                        return 'empty';
                    case '-':
                    case 'X':
                        return 'empty';
                    case ' ':
                        return 'empty';
                    default:
                        return 'empty';
                }
            });
        });

        return { grid, pellets: pelletCount, pacmanStart, ghostStarts, pelletPositions, powerPelletPositions };
    }

    private createGhosts(): Ghost[] {
        const uniqueYPositions = [...new Set(this.ghostSpawns.map((spawn) => spawn.y))].sort((a, b) => a - b);
        const middleY = uniqueYPositions.length > 0 ? uniqueYPositions[Math.floor(uniqueYPositions.length / 2)] : 13.5;

        const middleRowSpawns = this.ghostSpawns.filter((spawn) => {
            return Math.abs(spawn.y - middleY) < 0.1;
        });
        const selectedSpawns: Point[] = [];
        if (middleRowSpawns.length >= 4) {
            const startIndex = Math.floor((middleRowSpawns.length - 4) / 2);
            for (let i = 0; i < 4; i++) {
                const basePosition = middleRowSpawns[startIndex + i];
                selectedSpawns.push({
                    x: basePosition.x + 0.5,
                    y: basePosition.y,
                });
            }
        } else {
            selectedSpawns.push(...middleRowSpawns);
        }

        return GHOST_CONFIG.map((ghostConfig, index) => {
            const fallback: Point = { x: COLS / 2 + index * 0.5, y: ROWS / 2 };
            const spawn = selectedSpawns[index] ?? fallback;
            const waitPellets = GHOST_RELEASE_PELLETS[ghostConfig.id] ?? 0;
            return {
                id: ghostConfig.id,
                color: ghostConfig.color,
                position: { ...spawn },
                direction: 'up',
                state: this.scatterMode ? 'scatter' : 'chase',
                scatterTarget: ghostConfig.scatterTarget,
                home: { ...spawn },
                frightenedTimer: 0,
                speedMultiplier: 1,
                regenerating: false,
                regenerationTimer: 0,
                inHouse: waitPellets > 0,
                homeWaitPellets: waitPellets,
                blinkCooldown: BLINK_COOLDOWN_MIN + Math.random() * (BLINK_COOLDOWN_MAX - BLINK_COOLDOWN_MIN),
                blinkTimer: 0,
                lookCooldown: 0.6 + Math.random() * 2.0,
                lookTimer: 0,
                lookDir: 'center',
                randomPhase: Math.random() * Math.PI * 2,
                waitFrightCooldown:
                    WAIT_FRIGHT_COOLDOWN_MIN + Math.random() * (WAIT_FRIGHT_COOLDOWN_MAX - WAIT_FRIGHT_COOLDOWN_MIN),
                spinAngle: 0,
                spinDuration: 0,
                spinTimer: 0,
                spinCooldown: 8 + Math.random() * 6,
                spinDirection: Math.random() < 0.5 ? 1 : -1,
                dizzyTimer: 0,
                dizzyBounce: 0,
                eyeRollTimer: 0,
                eyeRollCooldown: 10 + Math.random() * 10,
                eyeRollDuration: 2.0,
                winkTimer: 0,
                winkCooldown: WINK_COOLDOWN_MIN + Math.random() * (WINK_COOLDOWN_MAX - WINK_COOLDOWN_MIN),
                winkEye: Math.random() < 0.5 ? 'left' : 'right',
                headbuttPartner: undefined,
                headbuttTimer: 0,
                headbuttCooldown: 15 + Math.random() * 15,
                headbuttPhase: undefined,
                headbuttLeanAmount: 0,
                headbuttAngle: 0,
                headbuttRotation: 0,
                headbuttRotationDir: 1,
            };
        });
    }

    private update(delta: number) {
        const targetGhostScale = this.phase === 'waiting' ? 1.75 : 1.0;
        const interpSpeed = 4.0;
        this.ghostScale += (targetGhostScale - this.ghostScale) * Math.min(1, delta * interpSpeed);
        this.updateBlinkTimers(delta);
        this.updateLookTimers(delta);
        this.updateSpinTimers(delta);
        this.updateEyeRollTimers(delta);
        this.updateWinkTimers(delta);
        this.updateHeadbuttTimers(delta);
        if (this.phase === 'waiting') {
            this.ghosts.forEach((ghost) => {
                if (ghost.regenerating || ghost.state === 'eyes') return;

                if (ghost.state === 'frightened') {
                    ghost.frightenedTimer -= delta;
                    if (ghost.frightenedTimer <= 0) {
                        ghost.frightenedTimer = 0;
                        ghost.state = this.scatterMode ? 'scatter' : 'chase';
                        ghost.speedMultiplier = 1;
                        ghost.waitFrightCooldown =
                            WAIT_FRIGHT_COOLDOWN_MIN +
                            Math.random() * (WAIT_FRIGHT_COOLDOWN_MAX - WAIT_FRIGHT_COOLDOWN_MIN);
                    }
                } else {
                    ghost.waitFrightCooldown = (ghost.waitFrightCooldown ?? 0) - delta;
                    if (ghost.waitFrightCooldown <= 0) {
                        ghost.state = 'frightened';
                        ghost.frightenedTimer = 1.0;
                        ghost.speedMultiplier = 0.6;
                        ghost.blinkTimer = 0;
                        ghost.blinkCooldown =
                            BLINK_COOLDOWN_MIN + Math.random() * (BLINK_COOLDOWN_MAX - BLINK_COOLDOWN_MIN);
                    }
                }
            });
            return;
        }

        if (this.phase === 'ready' || this.phase === 'respawn') {
            this.phaseTimer -= delta;

            if (this.phaseTimer <= 0) {
                if (this.countdown === -1) {
                    this.countdown = -2;
                    this.phaseTimer = 1.2;
                    this.callbacks.onStatus(`Starting Level ${this.level}`);
                } else if (this.countdown === -2) {
                    this.countdown = 3;
                    this.phaseTimer = 1.0;
                } else if (this.countdown > 0) {
                    this.countdown -= 1;
                    this.phaseTimer = 1.0;
                } else if (this.countdown === 0) {
                    this.countdown -= 1;
                    this.phase = 'playing';
                    this.callbacks.onStatus(this.paused ? 'Paused' : 'Playing');
                } else {
                    this.phase = 'playing';
                    this.callbacks.onStatus(this.paused ? 'Paused' : 'Playing');
                }
            }
            return;
        }
        if (this.pacman.dying) {
            this.pacman.deathTimer += delta;
            if (this.pacman.deathTimer >= DEATH_ANIMATION_DURATION) {
                this.pacman.dying = false;
                this.pacman.deathTimer = 0;

                if (this.lives <= 0) {
                    this.phase = 'over';
                    this.gameOverAnimTimer = 0;
                    this.callbacks.onStatus('Game Over');
                } else {
                    this.phase = 'respawn';
                    this.phaseTimer = 1.0;
                    this.countdown = 3;
                    this.callbacks.onStatus('Get Ready!');
                    this.resetActors();
                }
            }
            return;
        }

        if (this.phase === 'over') {
            this.gameOverAnimTimer += delta;
            return;
        }

        this.modeTimer -= delta;
        if (this.modeTimer <= 0) {
            this.scatterMode = !this.scatterMode;
            this.modeTimer = this.scatterMode ? 7 : 20;
            this.ghosts.forEach((ghost) => {
                if (ghost.state === 'scatter' || ghost.state === 'chase') {
                    ghost.state = this.scatterMode ? 'scatter' : 'chase';
                }
            });
        }

        this.updatePacman(delta);
        this.updateGhosts(delta);
        this.handleGhostEncounters();
        this.bonusPopups = this.bonusPopups.filter((popup) => {
            popup.timer -= delta;
            return popup.timer > 0;
        });
        this.updateFruitBonus(delta);
        this.updatePowerPelletVisibility(delta);
    }

    private updateFruitBonus(delta: number) {
        if (this.fruitBonus.active) {
            this.fruitBonus.timer -= delta;
            if (this.fruitBonus.timer <= 0) {
                this.fruitBonus.active = false;
            }
            const dist = this.distance(this.pacman.position, this.fruitBonus.position);
            if (dist < 0.5) {
                this.addScore(this.fruitBonus.score);
                this.bonusPopups.push({
                    score: this.fruitBonus.score,
                    position: { ...this.fruitBonus.position },
                    timer: 2.0,
                });
                this.audio.play('eatFruit');
                this.fruitBonus.active = false;
            }
        }
    }
    private updateBlinkTimers(delta: number) {
        this.ghosts.forEach((ghost) => {
            if (ghost.state === 'frightened') {
                ghost.blinkTimer = 0;
                return;
            }
            if ((ghost.blinkTimer ?? 0) > 0) {
                ghost.blinkTimer = (ghost.blinkTimer ?? 0) - delta;
                if ((ghost.blinkTimer ?? 0) <= 0) {
                    ghost.blinkTimer = 0;
                    ghost.blinkCooldown =
                        BLINK_COOLDOWN_MIN + Math.random() * (BLINK_COOLDOWN_MAX - BLINK_COOLDOWN_MIN);
                }
            } else {
                ghost.blinkCooldown = (ghost.blinkCooldown ?? 0) - delta;
                if ((ghost.blinkCooldown ?? 0) <= 0) {
                    ghost.blinkTimer = BLINK_DURATION;
                }
            }
        });
    }
    private updateLookTimers(delta: number) {
        this.ghosts.forEach((ghost) => {
            if (!ghost.inHouse && this.phase !== 'waiting') {
                ghost.lookTimer = 0;
                ghost.lookCooldown = ghost.lookCooldown ?? 0.6;
                ghost.lookDir = 'center';
                return;
            }

            if ((ghost.lookTimer ?? 0) > 0) {
                ghost.lookTimer = (ghost.lookTimer ?? 0) - delta;
                if ((ghost.lookTimer ?? 0) <= 0) {
                    ghost.lookTimer = 0;
                    ghost.lookCooldown = 0.8 + Math.random() * 3.0;
                    ghost.lookDir = 'center';
                }
            } else {
                ghost.lookCooldown = (ghost.lookCooldown ?? 0) - delta;
                if ((ghost.lookCooldown ?? 0) <= 0) {
                    ghost.lookTimer = 0.6 + Math.random() * 1.2;
                    ghost.lookDir = Math.random() < 0.5 ? 'left' : 'right';
                }
            }
        });
    }

    private updateSpinTimers(delta: number) {
        this.ghosts.forEach((ghost) => {
            const canSpin = this.phase === 'waiting' || ghost.inHouse;

            if (!canSpin) {
                ghost.spinTimer = 0;
                ghost.spinAngle = 0;
                ghost.dizzyTimer = 0;
                ghost.dizzyBounce = 0;
                return;
            }
            if ((ghost.dizzyTimer ?? 0) > 0) {
                ghost.dizzyTimer = (ghost.dizzyTimer ?? 0) - delta;

                if ((ghost.dizzyTimer ?? 0) <= 0) {
                    ghost.dizzyTimer = 0;
                    ghost.dizzyBounce = 0;
                    ghost.spinCooldown = 8 + Math.random() * 6;
                }
                return;
            }
            if ((ghost.spinTimer ?? 0) > 0) {
                ghost.spinTimer = (ghost.spinTimer ?? 0) - delta;
                const spinProgress = 1 - (ghost.spinTimer ?? 0) / (ghost.spinDuration ?? 1);
                const eased =
                    spinProgress < 0.5 ? 2 * spinProgress * spinProgress : 1 - (-2 * spinProgress + 2) ** 2 / 2;
                const direction = ghost.spinDirection ?? 1;
                ghost.spinAngle = eased * Math.PI * 2 * direction;

                if ((ghost.spinTimer ?? 0) <= 0) {
                    ghost.spinTimer = 0;
                    ghost.spinAngle = 0;
                    ghost.dizzyTimer = 2.5;
                }
                return;
            }
            ghost.spinCooldown = (ghost.spinCooldown ?? 0) - delta;
            if ((ghost.spinCooldown ?? 0) <= 0) {
                ghost.spinDuration = 0.3 + Math.random() * 0.2;
                ghost.spinTimer = ghost.spinDuration;
                ghost.spinAngle = 0;
                ghost.spinDirection = Math.random() < 0.5 ? 1 : -1;
            }
        });
    }

    private updateEyeRollTimers(delta: number) {
        this.ghosts.forEach((ghost) => {
            const canEyeRoll =
                (this.phase === 'waiting' || ghost.inHouse) &&
                (ghost.dizzyTimer ?? 0) === 0 &&
                (ghost.spinTimer ?? 0) === 0;

            if (!canEyeRoll) {
                ghost.eyeRollTimer = 0;
                return;
            }
            if ((ghost.eyeRollTimer ?? 0) > 0) {
                ghost.eyeRollTimer = (ghost.eyeRollTimer ?? 0) - delta;

                if ((ghost.eyeRollTimer ?? 0) <= 0) {
                    ghost.eyeRollTimer = 0;
                    ghost.eyeRollCooldown = 10 + Math.random() * 10;
                }
                return;
            }
            ghost.eyeRollCooldown = (ghost.eyeRollCooldown ?? 0) - delta;
            if ((ghost.eyeRollCooldown ?? 0) <= 0) {
                ghost.eyeRollTimer = ghost.eyeRollDuration ?? 2.0;
            }
        });
    }

    private updateWinkTimers(delta: number) {
        this.ghosts.forEach((ghost) => {
            const canWink =
                (this.phase === 'waiting' || ghost.inHouse) &&
                (ghost.dizzyTimer ?? 0) === 0 &&
                (ghost.spinTimer ?? 0) === 0 &&
                (ghost.eyeRollTimer ?? 0) === 0 &&
                (ghost.blinkTimer ?? 0) === 0;

            if (!canWink) {
                ghost.winkTimer = 0;
                return;
            }

            if ((ghost.winkTimer ?? 0) > 0) {
                ghost.winkTimer = (ghost.winkTimer ?? 0) - delta;

                if ((ghost.winkTimer ?? 0) <= 0) {
                    ghost.winkTimer = 0;
                    ghost.winkCooldown = 5 + Math.random() * 7;
                    ghost.winkEye = Math.random() < 0.5 ? 'left' : 'right';
                }
                return;
            }

            ghost.winkCooldown = (ghost.winkCooldown ?? 0) - delta;
            if ((ghost.winkCooldown ?? 0) <= 0) {
                ghost.winkTimer = WINK_DURATION;
            }
        });
    }

    private updateHeadbuttTimers(delta: number) {
        const canHeadbutt = this.phase === 'waiting';

        if (!canHeadbutt) {
            this.ghosts.forEach((ghost) => {
                ghost.headbuttTimer = 0;
                ghost.headbuttPhase = undefined;
                ghost.headbuttPartner = undefined;
                ghost.headbuttLeanAmount = 0;
            });
            return;
        }
        this.ghosts.forEach((ghost) => {
            if ((ghost.headbuttTimer ?? 0) > 0) {
                ghost.headbuttTimer = (ghost.headbuttTimer ?? 0) - delta;
                const totalDuration = 2.0;
                const timeRemaining = ghost.headbuttTimer ?? 0;
                const progress = 1 - timeRemaining / totalDuration;

                if (progress < 0.1) {
                    ghost.headbuttPhase = 'rotating';
                    const rotateProgress = progress / 0.1;
                    const eased = rotateProgress * rotateProgress;
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * eased * (Math.PI / 2);
                    ghost.headbuttLeanAmount = 0;
                } else if (progress < 0.8) {
                    ghost.headbuttPhase = 'leaning';
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * (Math.PI / 2);
                    ghost.headbuttLeanAmount = 0;
                } else {
                    ghost.headbuttPhase = 'turnback';
                    const turnProgress = (progress - 0.8) / 0.2;
                    const eased = 1 - (1 - turnProgress) ** 2;
                    const rotationDir = ghost.headbuttRotationDir ?? 1;
                    ghost.headbuttRotation = rotationDir * (Math.PI / 2) * (1 - eased);
                    ghost.headbuttLeanAmount = 0;
                }

                if ((ghost.headbuttTimer ?? 0) <= 0) {
                    ghost.headbuttTimer = 0;
                    ghost.headbuttPhase = undefined;
                    const partnerId = ghost.headbuttPartner;
                    ghost.headbuttPartner = undefined;
                    ghost.headbuttLeanAmount = 0;
                    ghost.headbuttRotation = 0;
                    ghost.headbuttCooldown = 15 + Math.random() * 15;
                    if (partnerId) {
                        const partner = this.getGhostById(partnerId);
                        if (
                            partner &&
                            !this.speechBubbles.find((b) => b.ghostId1 === ghost.id || b.ghostId2 === ghost.id)
                        ) {
                            this.speechBubbles.push({
                                ghostId1: ghost.id,
                                ghostId2: partnerId,
                                timer: 4.0,
                                text: getRandomApology(),
                            });
                        }
                    }
                }
            }
        });
        this.speechBubbles = this.speechBubbles.filter((bubble) => {
            bubble.timer -= delta;
            if (bubble.timer <= 0) return false;

            // Remove speech bubble if either ghost is moving
            const ghost1 = this.getGhostById(bubble.ghostId1);
            const ghost2 = this.getGhostById(bubble.ghostId2);

            // Check if ghosts are stationary (not in a headbutt and not moving normally)
            const isGhost1Stationary = ghost1 && (ghost1.headbuttTimer ?? 0) > 0;
            const isGhost2Stationary = ghost2 && (ghost2.headbuttTimer ?? 0) > 0;

            // Keep bubble only if both ghosts are stationary (in headbutt or cooldown)
            return isGhost1Stationary || isGhost2Stationary;
        });
        for (let idx = 0; idx < this.ghosts.length - 1; idx++) {
            const ghost = this.ghosts[idx];
            const partner = this.ghosts[idx + 1];
            if ((ghost.headbuttTimer ?? 0) > 0) continue;
            if ((ghost.headbuttCooldown ?? 0) > 0) continue;
            if ((ghost.dizzyTimer ?? 0) > 0 || (ghost.spinTimer ?? 0) > 0) continue;

            if ((partner.headbuttTimer ?? 0) > 0) continue;
            if ((partner.headbuttCooldown ?? 0) > 0) continue;
            if ((partner.dizzyTimer ?? 0) > 0 || (partner.spinTimer ?? 0) > 0) continue;
            const distance = this.distance(ghost.position, partner.position);
            if (distance < 3 && distance > 0.5) {
                ghost.headbuttTimer = 2.0;
                partner.headbuttTimer = 2.0;
                ghost.headbuttPartner = partner.id;
                partner.headbuttPartner = ghost.id;
                const dx = partner.position.x - ghost.position.x;
                const dy = partner.position.y - ghost.position.y;
                ghost.headbuttAngle = Math.atan2(dy, dx);
                partner.headbuttAngle = Math.atan2(-dy, -dx);
                const ghostRotationDir = dx < 0 ? -1 : 1;
                const partnerRotationDir = -ghostRotationDir;

                ghost.headbuttRotationDir = ghostRotationDir;
                partner.headbuttRotationDir = partnerRotationDir;
            }
        }
        this.ghosts.forEach((ghost) => {
            if ((ghost.headbuttTimer ?? 0) === 0 && (ghost.headbuttCooldown ?? 0) > 0) {
                ghost.headbuttCooldown = (ghost.headbuttCooldown ?? 0) - delta;
            }
        });
    }

    private updatePacman(delta: number) {
        // Safety check: If pacman somehow got inside ghost house, immediately move him out
        if (this.isInGhostHome(this.pacman.position)) {
            this.pacman.position.x = this.snapToCenter(this.pacman.position.x);
            this.pacman.position.y = 19.5; // Move to safe position below ghost house
            this.pacman.isMoving = false;
            return;
        }

        if (this.isAligned(this.pacman.position) && this.canMove(this.pacman.nextDirection, this.pacman.position)) {
            this.pacman.direction = this.pacman.nextDirection;
        }

        const vec = DIR_VECTORS[this.pacman.direction];
        const nextX = this.pacman.position.x + vec.x * this.pacman.speed * delta;
        const nextY = this.pacman.position.y + vec.y * this.pacman.speed * delta;
        const prevX = this.pacman.position.x;
        const prevY = this.pacman.position.y;
        const nextPos = { x: nextX, y: nextY };

        // ABSOLUTELY FORBID pacman from entering the ghost house - block any movement into it
        if (this.isInGhostHome(nextPos)) {
            this.pacman.position.x = this.snapToCenter(this.pacman.position.x);
            this.pacman.position.y = this.snapToCenter(this.pacman.position.y);
            this.pacman.isMoving = false;
        } else if (this.hitsWall(nextX, nextY, vec)) {
            this.pacman.position.x = this.snapToCenter(this.pacman.position.x);
            this.pacman.position.y = this.snapToCenter(this.pacman.position.y);
            this.pacman.isMoving = false;
        } else {
            this.pacman.position.x = this.wrap(nextX, COLS);
            this.pacman.position.y = this.wrap(nextY, ROWS);
            this.pacman.isMoving = true;
        }
        const moved =
            Math.abs(this.pacman.position.x - prevX) > 0.001 || Math.abs(this.pacman.position.y - prevY) > 0.001;
        if (moved) {
            this.pacman.mouthTimer += delta * 10;
            if (this.pacman.mouthTimer > Math.PI * 2) {
                this.pacman.mouthTimer -= Math.PI * 2;
            }
        }

        this.consumePellet();
    }

    private updatePowerPelletVisibility(delta: number) {
        this.powerPelletTimer += delta;
        this.powerPelletOpacity = (Math.sin(this.powerPelletTimer * 4) + 1) / 2;
    }

    private spawnFruit() {
        const fruitIndex = Math.min(this.level - 1, FRUIT_CONFIG.length - 1);
        const fruit = FRUIT_CONFIG[fruitIndex];

        this.fruitBonus.active = true;
        this.fruitBonus.position = { ...this.pacmanSpawn };
        this.fruitBonus.type = fruit.type;
        this.fruitBonus.score = fruit.score;
        this.fruitBonus.timer = 8;
    }
    private checkPelletTriggers() {
        const eaten = this.totalPelletCount - this.pelletsRemaining;
        for (let i = 0; i < FRUIT_THRESHOLDS.length; i++) {
            const threshold = FRUIT_THRESHOLDS[i];
            if (!this.fruitSpawnedThresholds[i] && eaten >= threshold) {
                this.spawnFruit();
                this.fruitSpawnedThresholds[i] = true;
                break;
            }
        }
        this.ghosts.forEach((ghost) => {
            if (ghost.inHouse && typeof ghost.homeWaitPellets === 'number') {
                if (eaten >= ghost.homeWaitPellets) {
                    ghost.inHouse = false;
                    ghost.state = this.scatterMode ? 'scatter' : 'chase';
                    ghost.direction = 'up';
                }
            }
        });
    }

    private updateGhosts(delta: number) {
        this.ghosts.forEach((ghost) => {
            if (ghost.state === 'frightened') {
                ghost.frightenedTimer -= delta;
                if (ghost.frightenedTimer <= 0) {
                    ghost.state = this.scatterMode ? 'scatter' : 'chase';
                    ghost.speedMultiplier = 1;
                }
            }
            if (ghost.regenerating) {
                ghost.regenerationTimer -= delta;
                if (ghost.regenerationTimer <= 0) {
                    ghost.regenerating = false;
                    ghost.state = this.scatterMode ? 'scatter' : 'chase';
                    ghost.speedMultiplier = 1;
                    ghost.direction = 'up';
                }
                return;
            }
            if (ghost.inHouse) {
                ghost.position = { ...ghost.home };
                ghost.direction = 'up';
                return;
            }
            const inHomeArea = this.isInGhostHome(ghost.position);
            const atDoorway = this.isAtGhostHomeDoorway(ghost.position);
            if (ghost.state === 'eyes') {
                const homeCenter = { x: 14.5, y: 13.5 };
                if (this.distance(ghost.position, homeCenter) < 0.3) {
                    ghost.position = { ...homeCenter };
                    ghost.regenerating = true;
                    ghost.regenerationTimer = REGENERATION_DURATION;
                    ghost.state = 'scatter';
                    return;
                }
            }

            if (this.isAligned(ghost.position)) {
                const options = this.getAvailableDirections(ghost.position, ghost.direction, true);
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
                        } else {
                            ghost.direction = options[0] || 'up';
                        }
                    } else if (options.includes('up')) {
                        ghost.direction = 'up';
                    } else if (options.includes('left')) {
                        ghost.direction = 'left';
                    } else if (options.includes('right')) {
                        ghost.direction = 'right';
                    } else {
                        ghost.direction = options[0] || 'up';
                    }
                } else if (atDoorway && ghost.state !== 'eyes') {
                    if (options.includes('up')) {
                        ghost.direction = 'up';
                    } else {
                        ghost.direction = this.chooseGhostDirection(ghost, options);
                    }
                } else if (ghost.state === 'eyes') {
                    ghost.direction = this.chooseGhostDirection(ghost, options);
                } else {
                    ghost.direction = this.chooseGhostDirection(ghost, options);
                }
            }

            const vec = DIR_VECTORS[ghost.direction];
            const speed = (GHOST_BASE_SPEED + (this.level - 1) * 0.2) * ghost.speedMultiplier;
            const nextX = ghost.position.x + vec.x * speed * delta;
            const nextY = ghost.position.y + vec.y * speed * delta;
            const nextPos = { x: nextX, y: nextY };
            const wouldEnterHome = this.isInGhostHome(nextPos);
            const currentlyInHome = this.isInGhostHome(ghost.position);

            if (wouldEnterHome && !currentlyInHome && ghost.state !== 'eyes' && !ghost.regenerating) {
                ghost.position.x = this.snapToCenter(ghost.position.x);
                ghost.position.y = this.snapToCenter(ghost.position.y);
                ghost.direction = OPPOSITE[ghost.direction];
            } else if (this.hitsWall(nextX, nextY, vec, true, ghost.position)) {
                ghost.position.x = this.snapToCenter(ghost.position.x);
                ghost.position.y = this.snapToCenter(ghost.position.y);
                ghost.direction = OPPOSITE[ghost.direction];
            } else {
                ghost.position.x = this.wrap(nextX, COLS);
                ghost.position.y = this.wrap(nextY, ROWS);
            }
        });
        const anyFrightened = this.ghosts.some((g) => g.state === 'frightened');
        if (!anyFrightened) {
            this.audio.stopLoop();
        }
    }

    private isInGhostHome(position: Point): boolean {
        const homeMinX = 12;
        const homeMaxX = 17;
        const homeMinY = 12;
        const homeMaxY = 14;

        return (
            position.x >= homeMinX && position.x <= homeMaxX && position.y >= homeMinY && position.y <= homeMaxY + 0.5
        );
    }

    private isAtGhostHomeDoorway(position: Point): boolean {
        const doorwayMinX = 12;
        const doorwayMaxX = 17;
        const doorwayY = 11;

        return (
            position.x >= doorwayMinX &&
            position.x <= doorwayMaxX &&
            position.y >= doorwayY - 0.5 &&
            position.y <= doorwayY + 0.5
        );
    }

    private handleGhostEncounters() {
        this.ghosts.forEach((ghost) => {
            const dist = this.distance(this.pacman.position, ghost.position);
            const collisionDistance = 0.7;
            if (dist > collisionDistance) return;

            if (ghost.state === 'frightened') {
                ghost.state = 'eyes';
                ghost.speedMultiplier = 1.6;
                ghost.frightenedTimer = 0;
                this.bonusPopups.push({
                    score: this.ghostEatValue,
                    position: { ...ghost.position },
                    timer: 1.5,
                });

                this.addScore(this.ghostEatValue);
                this.ghostEatValue = Math.min(this.ghostEatValue * 2, 1600);
                this.audio.play('eatGhost');
            } else if (ghost.state !== 'eyes' && !ghost.regenerating) {
                this.handlePacmanHit(ghost);
            }
        });
    }

    private handlePacmanHit(killerGhost: Ghost) {
        if (this.phase === 'respawn' || this.pacman.dying) return;

        this.lives -= 1;
        this.callbacks.onLives(this.lives);
        this.pacman.dying = true;
        this.pacman.deathTimer = 0;
        this.killerGhost = killerGhost;
        this.audio.playDeathSequence();
    }

    private resetActors() {
        this.pacman.position = { ...this.pacmanSpawn };
        this.pacman.direction = 'left';
        this.pacman.nextDirection = 'left';
        this.pacman.mouthTimer = 0;
        this.pacman.dying = false;
        this.pacman.deathTimer = 0;
        this.ghosts = this.createGhosts();
        this.updateGhostMap();
        this.ghostEatValue = 200;
    }

    private consumePellet() {
        const row = Math.floor(this.pacman.position.y);
        const col = Math.floor(this.pacman.position.x);
        const cell = this.grid[row]?.[col];
        if (!cell) return;
        let consumed = false;
        if (cell === 'pellet') {
            this.grid[row][col] = 'empty';
            this.pelletPositions = this.pelletPositions.filter((p) => !(p.x === col && p.y === row));
            this.pelletsRemaining -= 1;
            this.addScore(10);
            this.audio.play('pellet');
            consumed = true;
        } else if (cell === 'power') {
            this.grid[row][col] = 'empty';
            this.powerPelletPositions = this.powerPelletPositions.filter((p) => !(p.x === col && p.y === row));
            this.pelletsRemaining -= 1;
            this.triggerFrightened();
            this.addScore(50);
            this.audio.play('powerPellet');
            consumed = true;
        }
        if (consumed) {
            this.checkPelletTriggers();
        }

        if (this.pelletsRemaining <= 0) {
            this.advanceLevel();
        }
    }

    private triggerFrightened() {
        this.ghostEatValue = 200;
        this.ghosts.forEach((ghost) => {
            if (ghost.state === 'eyes' || ghost.inHouse) return;
            ghost.state = 'frightened';
            ghost.frightenedTimer = FRIGHTENED_DURATION;
            ghost.speedMultiplier = 0.6;
        });
        this.audio.playLoop('frightened');
    }

    private advanceLevel() {
        this.level += 1;
        this.callbacks.onLevel(this.level);
        this.pacman.speed = PACMAN_BASE_SPEED + (this.level - 1) * 0.2;
        // Rotate through mazes in order (loop back to start after last maze)
        const mazeIndex = (this.level - 1) % MAZES.length;
        this.currentMaze = MAZES[mazeIndex];

        this.initializeLevel();
        this.countdown = -1;
        this.phase = 'ready';
        this.phaseTimer = 1.5;
        this.callbacks.onStatus(`Level Complete!`);
        this.audio.play('start');
    }

    private chooseGhostDirection(ghost: Ghost, options: DirectionKey[]) {
        if (!options.length) {
            return OPPOSITE[ghost.direction];
        }
        if (ghost.state === 'frightened') {
            return options[Math.floor(Math.random() * options.length)];
        }

        const target = this.getGhostTarget(ghost);
        let bestDir = options[0];
        let bestDistance = Infinity;

        options.forEach((dir) => {
            const vec = DIR_VECTORS[dir];
            const nextPos = {
                x: this.snapToCenter(ghost.position.x + vec.x),
                y: this.snapToCenter(ghost.position.y + vec.y),
            };
            const dist = this.distance(nextPos, target);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestDir = dir;
            }
        });

        return bestDir;
    }

    private getGhostTarget(ghost: Ghost): Point {
        if (ghost.state === 'eyes') {
            return { x: 14.5, y: 13.5 };
        }
        if (ghost.state === 'scatter') {
            return ghost.scatterTarget;
        }
        switch (ghost.id) {
            case 'blinky':
                return { ...this.pacman.position };

            case 'pinky': {
                const pinkyOffset = DIR_VECTORS[this.pacman.direction];
                return {
                    x: this.pacman.position.x + pinkyOffset.x * 4,
                    y: this.pacman.position.y + pinkyOffset.y * 4,
                };
            }

            case 'inky': {
                const blinky = this.getGhostById('blinky');
                if (!blinky) return { ...this.pacman.position };
                const inkyOffset = DIR_VECTORS[this.pacman.direction];
                const pivot = {
                    x: this.pacman.position.x + inkyOffset.x * 2,
                    y: this.pacman.position.y + inkyOffset.y * 2,
                };
                const vectorX = pivot.x - blinky.position.x;
                const vectorY = pivot.y - blinky.position.y;

                return {
                    x: blinky.position.x + vectorX * 2,
                    y: blinky.position.y + vectorY * 2,
                };
            }

            case 'clyde': {
                const distToPacman = this.distance(ghost.position, this.pacman.position);

                if (distToPacman < 8) {
                    return ghost.scatterTarget;
                } else {
                    return { ...this.pacman.position };
                }
            }

            default:
                return { ...this.pacman.position };
        }
    }

    private getAvailableDirections(position: Point, currentDir: DirectionKey, allowGhostHome: boolean = false) {
        const options: DirectionKey[] = [];
        DIR_ORDER.forEach((dir) => {
            if (OPPOSITE[currentDir] === dir) return;
            if (this.canMove(dir, position, allowGhostHome)) {
                options.push(dir);
            }
        });
        return options.length ? options : [OPPOSITE[currentDir]];
    }

    private canMove(dir: DirectionKey, position: Point, allowGhostHome: boolean = false) {
        const vec = DIR_VECTORS[dir];
        const targetRow = Math.floor(position.y + vec.y);
        const targetCol = Math.floor(position.x + vec.x);
        if (this.isWall(targetRow, targetCol)) return false;

        // ABSOLUTELY FORBID pacman from entering the ghost house - block any direction that would enter it
        if (!allowGhostHome) {
            const targetPos = { x: position.x + vec.x, y: position.y + vec.y };
            // Block if trying to enter ghost house from outside (FORBIDDEN)
            if (this.isInGhostHome(targetPos) && !this.isInGhostHome(position)) {
                return false;
            }
        }

        return true;
    }

    private hitsWall(nextX: number, nextY: number, vec: Vector, allowGhostHome: boolean = false, currentPos?: Point) {
        const checkX = nextX + vec.x * 0.4;
        const checkY = nextY + vec.y * 0.4;
        if (this.isWall(Math.floor(checkY), Math.floor(checkX))) return true;

        // ABSOLUTELY FORBID pacman from entering the ghost house - block any movement into it
        if (!allowGhostHome) {
            const checkPos = { x: checkX, y: checkY };
            // Block if trying to enter ghost house from outside (FORBIDDEN)
            if (this.isInGhostHome(checkPos)) {
                if (!currentPos || !this.isInGhostHome(currentPos)) {
                    return true;
                }
            }
        }

        return false;
    }

    private isWall(row: number, col: number) {
        if (row === 12 && (col < 0 || col >= COLS)) {
            return false;
        }

        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
            return true;
        }
        return this.grid[row]?.[col] === 'wall';
    }

    private isAligned(point: Point) {
        return (
            Math.abs(point.x - Math.floor(point.x) - 0.5) < 0.1 && Math.abs(point.y - Math.floor(point.y) - 0.5) < 0.1
        );
    }

    private snapToCenter(value: number) {
        return Math.round(value - 0.5) + 0.5;
    }

    private wrap(value: number, limit: number) {
        if (value < 0) return limit + value;
        if (value >= limit) return value - limit;
        return value;
    }

    private distance(a: Point, b: Point) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    // Helper method to convert position to pixel coordinates (eliminates repeated calculations)
    private toPixels(point: Point): { x: number; y: number } {
        return {
            x: point.x * this.tileSize,
            y: point.y * this.tileSize,
        };
    }

    // Helper method to get ghost by ID (O(1) lookup instead of O(n) find)
    private getGhostById(id: string): Ghost | undefined {
        return this.ghostMap.get(id);
    }

    // Update ghost map when ghosts array changes
    private updateGhostMap() {
        this.ghostMap.clear();
        this.ghosts.forEach((ghost) => {
            this.ghostMap.set(ghost.id, ghost);
        });
    }

    private addScore(amount: number) {
        this.score += amount;
        this.callbacks.onScore(this.score);
    }

    private draw() {
        const width = this.tileSize * COLS;
        const height = this.tileSize * ROWS;
        // Clear entire canvas first
        this.ctx.clearRect(0, 0, width, height);

        // Draw background only on wall tiles (not in channels)
        const backgroundColor = this.darkenColor(this.currentMaze.wallColor, 0.8);
        this.ctx.fillStyle = backgroundColor;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.grid[row]?.[col] === 'wall') {
                    const x = col * this.tileSize;
                    const y = row * this.tileSize;
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }

        this.drawHUD();
        this.pelletPositions.forEach((pos) => {
            const { x, y } = this.toPixels(pos);
            this.ctx.fillStyle = '#fde047';
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize * 0.12, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.powerPelletPositions.forEach((pos) => {
            const { x, y } = this.toPixels(pos);
            this.ctx.save();
            this.ctx.globalAlpha = this.powerPelletOpacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        this.drawWalls();
        this.drawGhostHome();

        this.drawPacman();
        for (const ghost of this.ghosts) {
            this.drawGhost(ghost);
        }
        this.drawArgumentSymbols();
        for (const bubble of this.speechBubbles) {
            this.drawSpeechBubble(bubble);
        }
        if (this.fruitBonus.active) {
            this.drawFruit();
        }
        this.drawBonusPopups();
        if (this.phase === 'ready' || this.phase === 'respawn') {
            this.drawCountdown();
        }
        if (this.phase === 'over') {
            this.drawGameOverOverlay();
        }
    }

    private drawCountdown() {
        const width = this.tileSize * COLS;
        const height = this.tileSize * ROWS;
        const centerX = width / 2;
        const centerY = height / 2;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, width, height);
        const timer = Math.min(this.phaseTimer, 0.999);
        const animProgress = 1 - timer;
        let text = '';
        let baseColor = '#ffffff';
        let glowColor = '#fde047';

        if (this.countdown === -1) {
            text = 'LEVEL COMPLETE!';
            baseColor = '#facc15';
            glowColor = '#fde047';
        } else if (this.countdown === -2) {
            text = `STARTING LEVEL ${this.level}`;
            baseColor = '#38bdf8';
            glowColor = '#0ea5e9';
        } else if (this.countdown === 3) {
            text = '3';
            baseColor = '#ef4444';
            glowColor = '#dc2626';
        } else if (this.countdown === 2) {
            text = '2';
            baseColor = '#f59e0b';
            glowColor = '#d97706';
        } else if (this.countdown === 1) {
            text = '1';
            baseColor = '#10b981';
            glowColor = '#059669';
        } else if (this.countdown === 0 && this.phaseTimer > 0) {
            text = 'GO!';
            baseColor = '#3b82f6';
            glowColor = '#2563eb';
        }

        if (!text) return;
        let scale: number;
        let opacity: number;
        let glowIntensity: number;

        if (animProgress < 0.5) {
            const pulseProgress = animProgress * 2;
            scale = 0.3 + 0.7 * pulseProgress + Math.sin(pulseProgress * Math.PI) * 0.2;
            opacity = pulseProgress;
            glowIntensity = pulseProgress;
        } else {
            const fadeProgress = (animProgress - 0.5) * 2;
            scale = 1.0 - fadeProgress * 0.1;
            opacity = 1.0 - fadeProgress * fadeProgress;
            glowIntensity = 1.0 - fadeProgress;
        }

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        const fontSize =
            this.countdown === -1 || this.countdown === -2
                ? Math.max(48, this.tileSize * 2.2)
                : Math.max(120, this.tileSize * 7);
        this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.globalAlpha = opacity;
        for (let i = 3; i > 0; i--) {
            this.ctx.shadowColor = glowColor;
            this.ctx.shadowBlur = 50 * glowIntensity * i;
            this.ctx.fillStyle = glowColor;
            this.ctx.globalAlpha = (opacity * 0.4 * glowIntensity) / i;
            this.ctx.fillText(text, 0, 0);
        }
        this.ctx.globalAlpha = opacity;
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 30 * glowIntensity;
        this.ctx.fillStyle = baseColor;
        this.ctx.fillText(text, 0, 0);
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = opacity * 0.4 * glowIntensity;
        this.ctx.fillText(text, 0, 0);

        this.ctx.restore();
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }

    private drawFruit() {
        const { x, y } = this.toPixels(this.fruitBonus.position);
        const size = this.tileSize * 1.2;
        const bounce = Math.sin(performance.now() / 200) * 3;

        this.ctx.font = `${size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.fruitBonus.type, x, y + bounce);
    }

    private drawBonusPopups() {
        this.bonusPopups.forEach((popup) => {
            const { x, y } = this.toPixels(popup.position);
            const fontSize = Math.max(14, this.tileSize * 0.8);
            const opacity = Math.min(1, popup.timer / 0.5);

            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            this.ctx.font = `bold ${fontSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.fillText(popup.score.toString(), x, y - this.tileSize);

            this.ctx.restore();
        });
    }

    private drawHUD() {
        const width = this.tileSize * COLS;
        const baseFont = this.tileSize * 0.6;
        const maxFontByWidth = Math.max(10, Math.floor(width * 0.032));
        let fontSize = Math.max(10, Math.min(baseFont, maxFontByWidth));
        const minFont = 10;
        this.ctx.textBaseline = 'middle';

        const centerX = width / 2;
        const leftX = this.tileSize * 0.5;
        const livesRightX = this.tileSize * (COLS - 0.5);

        const scoreText = this.score.toString().padStart(6, '0');
        const lvlText = `LVL ${this.level}`;

        const tryFit = () => {
            this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
            const scoreLabelW = this.ctx.measureText('SCORE').width;
            const scoreValueW = this.ctx.measureText(scoreText).width;
            const lvlW = this.ctx.measureText(lvlText).width;
            const livesLabelW = this.ctx.measureText('LIVES').width;
            const scoreValueX = leftX + Math.max(this.tileSize * 2.5, scoreLabelW + 12);
            const lvlX = centerX;
            const livesLabelX = livesRightX - this.tileSize * 2.5;
            const leftBoxRight = scoreValueX + scoreValueW + 6;
            const lvlBoxLeft = lvlX - lvlW / 2 - 6;
            const lvlBoxRight = lvlX + lvlW / 2 + 6;
            const livesBoxLeft = livesLabelX - livesLabelW - 6;

            const leftVsLvl = leftBoxRight + 6 > lvlBoxLeft;
            const lvlVsLives = lvlBoxRight + 6 > livesBoxLeft;
            const leftVsLives = leftBoxRight + 12 > livesBoxLeft;

            return !(leftVsLvl || lvlVsLives || leftVsLives);
        };
        let safety = 0;
        while (!tryFit() && fontSize > minFont && safety < 20) {
            fontSize -= 1;
            safety += 1;
        }
        this.ctx.font = `bold ${fontSize}px "Courier New", monospace`;
        const hudY = Math.max(this.tileSize * 0.48, fontSize / 2 + 4);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        const scoreLabelX = this.tileSize * 0.5;
        this.ctx.fillText('SCORE', scoreLabelX, hudY);

        this.ctx.fillStyle = '#fde047';
        const scoreValueX = scoreLabelX + Math.max(this.tileSize * 2.5, this.ctx.measureText('SCORE').width + 12);
        this.ctx.fillText(scoreText, scoreValueX, hudY);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`LVL ${this.level}`, (this.tileSize * COLS) / 2, hudY);
        const livesX = this.tileSize * (COLS - 0.5);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'right';
        const livesLabelX = livesX - this.tileSize * 2.5;
        this.ctx.fillText('LIVES', livesLabelX, hudY);
        const iconSize = Math.max(6, Math.floor(fontSize * 0.8));
        const iconGap = iconSize * 1.1;
        const iconStartX = livesX - iconSize;
        const iconY = hudY;
        this.ctx.fillStyle = '#fde047';
        for (let i = 0; i < this.lives; i++) {
            const iconX = iconStartX - i * iconGap;
            this.ctx.beginPath();
            this.ctx.arc(iconX, iconY, iconSize / 2, 0.25 * Math.PI, 1.75 * Math.PI);
            this.ctx.lineTo(iconX, iconY);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    private drawGameOverOverlay() {
        const width = this.tileSize * COLS;
        const height = this.tileSize * ROWS;
        const centerX = width / 2;
        const centerY = height / 2;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, width, height);
        if (this.killerGhost) {
            const mazeSize = Math.min(width, height);
            const ghostSize = mazeSize * 0.25;
            const ghostX = centerX;
            const bounceHeight = ghostSize * 0.2;
            const bounceDuration = 1.2;
            const cycleTime = (this.gameOverAnimTimer % bounceDuration) / bounceDuration;
            const normalizedHeight = 1 - (2 * cycleTime - 1) ** 2;
            const bounce = normalizedHeight * bounceHeight;
            const ghostY = centerY - this.tileSize * 5 + bounceHeight - bounce;

            this.ctx.save();
            this.ctx.translate(ghostX, ghostY);
            this.ctx.fillStyle = this.killerGhost.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ghostSize / 2, 0, Math.PI, true);
            const waveCount = 4;
            const waveWidth = ghostSize / waveCount;
            const waveDepth = ghostSize * 0.15;
            for (let i = 0; i < waveCount; i++) {
                const x1 = -ghostSize / 2 + i * waveWidth;
                const cx = x1 + waveWidth / 2;
                const x2 = x1 + waveWidth;
                this.ctx.lineTo(x1, ghostSize / 2);
                this.ctx.quadraticCurveTo(cx, ghostSize / 2 + waveDepth, x2, ghostSize / 2);
            }
            this.ctx.closePath();
            this.ctx.fill();
            const eyeRadius = ghostSize * 0.15;
            const eyeOffsetX = ghostSize * 0.15;
            const eyeY = -ghostSize * 0.05;
            const pupilRadius = ghostSize * 0.07;
            const pupilShift = ghostSize * 0.06;
            const eyeRollCycle = GAMEOVER_EYEROLL_CYCLE;
            const eyeRollProgress = (this.gameOverAnimTimer % eyeRollCycle) / eyeRollCycle;
            const eyeRollDuration = 2.0;

            let pupilLookX: number;
            let pupilLookY = 0;

            const isEyeRolling = eyeRollProgress < eyeRollDuration / eyeRollCycle;

            if (isEyeRolling) {
                const rollProgress = eyeRollProgress / (eyeRollDuration / eyeRollCycle);
                const rolls = 3;
                const angle = rollProgress * rolls * Math.PI * 2;
                pupilLookX = Math.cos(angle) * pupilShift * 0.8;
                pupilLookY = Math.sin(angle) * pupilShift * 0.8;
            } else {
                const glanceCycle = GAMEOVER_GLANCE_CYCLE;
                const glanceProgress = (this.gameOverAnimTimer % glanceCycle) / glanceCycle;
                const glanceHoldDuration = 0.6;
                const transitionDuration = 0.3;
                if (glanceProgress < 0.2) {
                    pupilLookX = 0;
                } else if (glanceProgress < 0.2 + transitionDuration / glanceCycle) {
                    const t = (glanceProgress - 0.2) / (transitionDuration / glanceCycle);
                    pupilLookX = -pupilShift * t;
                } else if (glanceProgress < 0.2 + transitionDuration / glanceCycle + glanceHoldDuration / glanceCycle) {
                    pupilLookX = -pupilShift;
                } else if (
                    glanceProgress <
                    0.2 + (transitionDuration * 2) / glanceCycle + glanceHoldDuration / glanceCycle
                ) {
                    const t =
                        (glanceProgress - (0.2 + transitionDuration / glanceCycle + glanceHoldDuration / glanceCycle)) /
                        (transitionDuration / glanceCycle);
                    pupilLookX = -pupilShift * (1 - t);
                } else if (glanceProgress < 0.5) {
                    pupilLookX = 0;
                } else if (glanceProgress < 0.5 + transitionDuration / glanceCycle) {
                    const t = (glanceProgress - 0.5) / (transitionDuration / glanceCycle);
                    pupilLookX = pupilShift * t;
                } else if (glanceProgress < 0.5 + transitionDuration / glanceCycle + glanceHoldDuration / glanceCycle) {
                    pupilLookX = pupilShift;
                } else if (
                    glanceProgress <
                    0.5 + (transitionDuration * 2) / glanceCycle + glanceHoldDuration / glanceCycle
                ) {
                    const t =
                        (glanceProgress - (0.5 + transitionDuration / glanceCycle + glanceHoldDuration / glanceCycle)) /
                        (transitionDuration / glanceCycle);
                    pupilLookX = pupilShift * (1 - t);
                } else {
                    pupilLookX = 0;
                }
            }
            const blinkCycle = GAMEOVER_BLINK_CYCLE;
            const blinkCycleProgress = (this.gameOverAnimTimer % blinkCycle) / blinkCycle;
            const blinkDuration = BLINK_DURATION;
            const blinkTriggerPoint = 0.9;

            let blinkAmount = 0;
            if (blinkCycleProgress > blinkTriggerPoint) {
                const blinkProgress = (blinkCycleProgress - blinkTriggerPoint) / (1 - blinkTriggerPoint);
                const normalizedProgress = (blinkProgress * (blinkCycle * (1 - blinkTriggerPoint))) / blinkDuration;
                if (normalizedProgress <= 1) {
                    blinkAmount = 1 - Math.abs(normalizedProgress * 2 - 1);
                }
            }
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(-eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(-eyeOffsetX + pupilLookX, eyeY + pupilLookY, pupilRadius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(eyeOffsetX + pupilLookX, eyeY + pupilLookY, pupilRadius, 0, Math.PI * 2);
            this.ctx.fill();
            if (blinkAmount > 0) {
                const blinkEyeRadius = eyeRadius;
                const lidMax = blinkEyeRadius * 2.6;
                const lidHeight = lidMax * blinkAmount;

                this.ctx.save();
                this.ctx.globalAlpha = 0.95;
                this.ctx.fillStyle = this.killerGhost.color;

                const eyeLeftX = -eyeOffsetX - blinkEyeRadius;
                const eyeRightX = eyeOffsetX - blinkEyeRadius;
                const eyeYTop = eyeY - blinkEyeRadius;
                const eyeYTopAdjusted = eyeYTop - 1;
                const lidHeightAdjusted = lidHeight + 1;
                const extraWidthPx = 5;
                const inwardPx = 1;
                const shiftLeftPx = 3;

                const leftRectX = eyeLeftX + inwardPx - shiftLeftPx;
                const rightRectX = eyeRightX - inwardPx + (blinkEyeRadius * 2 + extraWidthPx);
                const totalWidth = Math.max(0, rightRectX - leftRectX);
                this.ctx.fillRect(leftRectX, eyeYTopAdjusted, totalWidth, lidHeightAdjusted);
                this.ctx.restore();
            }
            const winkCycle = GAMEOVER_WINK_CYCLE;
            const winkCycleProgress = (this.gameOverAnimTimer % winkCycle) / winkCycle;
            const winkDuration = WINK_DURATION;
            const winkTriggerPoint = 0.92;

            let winkAmount = 0;
            if (winkCycleProgress > winkTriggerPoint) {
                const winkProgress = (winkCycleProgress - winkTriggerPoint) / (1 - winkTriggerPoint);
                const normalizedProgress = (winkProgress * (winkCycle * (1 - winkTriggerPoint))) / winkDuration;
                if (normalizedProgress <= 1) {
                    winkAmount = 1 - Math.abs(normalizedProgress * 2 - 1);
                }
            }
            if (winkAmount > 0) {
                const winkEyeRadius = eyeRadius;
                const lidMax = winkEyeRadius * 2.6;
                const lidHeight = lidMax * winkAmount;

                this.ctx.save();
                this.ctx.globalAlpha = 0.95;
                this.ctx.fillStyle = this.killerGhost.color;

                const eyeYTop = eyeY - winkEyeRadius;
                const eyeYTopAdjusted = eyeYTop - 1;
                const lidHeightAdjusted = lidHeight + 1;
                const extraWidthPx = 5;
                const inwardPx = 1;
                const shiftLeftPx = 3;
                const winkCycleCount = Math.floor(this.gameOverAnimTimer / winkCycle);
                const winkEye = winkCycleCount % 2 === 0 ? 'left' : 'right';

                if (winkEye === 'left') {
                    const eyeLeftX = -eyeOffsetX - winkEyeRadius;
                    const leftRectX = eyeLeftX + inwardPx - shiftLeftPx;
                    const eyeWidth = winkEyeRadius * 2 + extraWidthPx;
                    this.ctx.fillRect(leftRectX, eyeYTopAdjusted, eyeWidth, lidHeightAdjusted);
                } else {
                    const eyeRightX = eyeOffsetX - winkEyeRadius;
                    const rightRectX = eyeRightX - inwardPx;
                    const eyeWidth = winkEyeRadius * 2 + extraWidthPx;
                    this.ctx.fillRect(rightRectX, eyeYTopAdjusted, eyeWidth, lidHeightAdjusted);
                }

                this.ctx.restore();
            }

            this.ctx.restore();
        }
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = `bold ${this.tileSize * 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', centerX, centerY + this.tileSize);

        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = `${this.tileSize * 1.2}px Arial`;
        this.ctx.fillText(`Final Score: ${this.score}`, centerX, centerY + this.tileSize * 3);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${this.tileSize * 0.8}px Arial`;
        this.ctx.fillText('Press SPACE or click "New Game" to play again', centerX, centerY + this.tileSize * 5);
    }

    private drawWalls() {
        this.ctx.strokeStyle = this.currentMaze.wallColor;
        this.ctx.lineWidth = Math.max(2, this.tileSize * 0.12);
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.wallGroups.forEach((wallGroup) => {
            this.drawWallGroupOutline(wallGroup);
        });
    }

    // Helper function to darken a color
    private darkenColor(color: string, amount: number): string {
        // Remove # if present
        const hex = color.replace('#', '');
        // Convert to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        // Darken by amount (0-1)
        const newR = Math.floor(r * (1 - amount));
        const newG = Math.floor(g * (1 - amount));
        const newB = Math.floor(b * (1 - amount));
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    private drawWallGroupOutline(wallGroup: Point[]) {
        const wallSet = new Set(wallGroup.map((p) => `${p.y},${p.x}`));
        const radius = this.tileSize * 0.3;
        const hSegments: Array<{ y: number; x1: number; x2: number }> = [];
        const vSegments: Array<{ x: number; y1: number; y2: number }> = [];

        wallGroup.forEach((wall) => {
            if (!wallSet.has(`${wall.y - 1},${wall.x}`)) {
                hSegments.push({ y: wall.y, x1: wall.x, x2: wall.x + 1 });
            }
            if (!wallSet.has(`${wall.y + 1},${wall.x}`)) {
                hSegments.push({ y: wall.y + 1, x1: wall.x, x2: wall.x + 1 });
            }
            if (!wallSet.has(`${wall.y},${wall.x - 1}`)) {
                vSegments.push({ x: wall.x, y1: wall.y, y2: wall.y + 1 });
            }
            if (!wallSet.has(`${wall.y},${wall.x + 1}`)) {
                vSegments.push({ x: wall.x + 1, y1: wall.y, y2: wall.y + 1 });
            }
        });
        const halfStroke = this.ctx.lineWidth / 2;
        const maxW = COLS * this.tileSize;
        const maxH = ROWS * this.tileSize;
        const clampX = (v: number) => Math.min(Math.max(v, halfStroke), maxW - halfStroke);
        const clampY = (v: number) => Math.min(Math.max(v, halfStroke), maxH - halfStroke);

        const hByY = new Map<number, Array<{ x1: number; x2: number }>>();
        hSegments.forEach((seg) => {
            if (!hByY.has(seg.y)) hByY.set(seg.y, []);
            const arr = hByY.get(seg.y);
            if (arr) arr.push({ x1: seg.x1, x2: seg.x2 });
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
                    const yPix = clampY(y * this.tileSize);
                    const x1Pix = clampX(x1);
                    const x2Pix = clampX(x2);
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1Pix, yPix);
                    this.ctx.lineTo(x2Pix, yPix);
                    this.ctx.stroke();
                }
            });
        });
        const vByX = new Map<number, Array<{ y1: number; y2: number }>>();
        vSegments.forEach((seg) => {
            if (!vByX.has(seg.x)) vByX.set(seg.x, []);
            const arr = vByX.get(seg.x);
            if (arr) arr.push({ y1: seg.y1, y2: seg.y2 });
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
                    const xPix = clampX(x * this.tileSize);
                    const y1Pix = clampY(y1);
                    const y2Pix = clampY(y2);
                    this.ctx.beginPath();
                    this.ctx.moveTo(xPix, y1Pix);
                    this.ctx.lineTo(xPix, y2Pix);
                    this.ctx.stroke();
                }
            });
        });
        wallGroup.forEach((wall) => {
            const x = wall.x * this.tileSize;
            const y = wall.y * this.tileSize;
            const isWallAt = (r: number, c: number) => {
                if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
                return this.grid[r]?.[c] === 'wall';
            };

            const top = isWallAt(wall.y - 1, wall.x);
            const bottom = isWallAt(wall.y + 1, wall.x);
            const left = isWallAt(wall.y, wall.x - 1);
            const right = isWallAt(wall.y, wall.x + 1);
            const topLeft = isWallAt(wall.y - 1, wall.x - 1);
            const topRight = isWallAt(wall.y - 1, wall.x + 1);
            const bottomLeft = isWallAt(wall.y + 1, wall.x - 1);
            const bottomRight = isWallAt(wall.y + 1, wall.x + 1);
            const innerOffset = -radius;
            const arc = (cx: number, cy: number, r: number, start: number, end: number) => {
                const maxAllowedRadius = Math.min(
                    cx - halfStroke,
                    cy - halfStroke,
                    maxW - cx - halfStroke,
                    maxH - cy - halfStroke,
                );
                const rr = Math.max(1, Math.min(r, maxAllowedRadius));
                if (rr <= 0) return;
                this.ctx.beginPath();
                this.ctx.arc(cx, cy, rr, start, end);
                this.ctx.stroke();
            };
            const adjustCyForTunnel = (_cx: number, cy: number, isTop: boolean) => {
                const TUNNEL_BORDER_ROWS = [11, 13];
                const TUNNEL_EDGE_COLS = [0, COLS - 1];
                if (!TUNNEL_BORDER_ROWS.includes(wall.y) || !TUNNEL_EDGE_COLS.includes(wall.x)) return cy;
                const LARGER_OFFSET = -1;
                return isTop ? cy + LARGER_OFFSET : cy - LARGER_OFFSET;
            };

            if (top && left && !topLeft) {
                const cx = x + innerOffset;
                const cy = y + innerOffset;
                arc(cx, adjustCyForTunnel(cx, cy, true), radius, 0, 0.5 * Math.PI);
            }
            if (top && right && !topRight) {
                const cx = x + this.tileSize - innerOffset;
                const cy = y + innerOffset;
                arc(cx, adjustCyForTunnel(cx, cy, true), radius, 0.5 * Math.PI, Math.PI);
            }
            if (bottom && left && !bottomLeft) {
                const cx = x + innerOffset;
                const cy = y + this.tileSize - innerOffset;
                arc(cx, adjustCyForTunnel(cx, cy, false), radius, 1.5 * Math.PI, 2 * Math.PI);
            }
            if (bottom && right && !bottomRight) {
                const cx = x + this.tileSize - innerOffset;
                const cy = y + this.tileSize - innerOffset;
                arc(cx, adjustCyForTunnel(cx, cy, false), radius, Math.PI, 1.5 * Math.PI);
            }
            if (!top && !left) {
                const cx = x + radius;
                const cy = y + radius;
                arc(cx, adjustCyForTunnel(cx, cy, true), radius, Math.PI, 1.5 * Math.PI);
            }
            if (!top && !right) {
                const cx = x + this.tileSize - radius;
                const cy = y + radius;
                arc(cx, adjustCyForTunnel(cx, cy, true), radius, 1.5 * Math.PI, 0);
            }
            if (!bottom && !left) {
                const cx = x + radius;
                const cy = y + this.tileSize - radius;
                arc(cx, adjustCyForTunnel(cx, cy, false), radius, 0.5 * Math.PI, Math.PI);
            }
            if (!bottom && !right) {
                const cx = x + this.tileSize - radius;
                const cy = y + this.tileSize - radius;
                arc(cx, adjustCyForTunnel(cx, cy, false), radius, 0, 0.5 * Math.PI);
            }
        });
    }

    private drawGhostHome() {
        if (this.ghostSpawns.length === 0) return;
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        this.ghostSpawns.forEach((spawn) => {
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
        this.ctx.strokeStyle = '#ffffff';
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

    private drawPacman() {
        const radius = this.tileSize * 0.45;
        const { x: px, y: py } = this.toPixels(this.pacman.position);
        const dirAngles: Record<DirectionKey, number> = {
            right: 0,
            down: Math.PI / 2,
            left: Math.PI,
            up: -Math.PI / 2,
        };
        const baseAngle = dirAngles[this.pacman.direction];
        if (this.pacman.dying) {
            const progress = this.pacman.deathTimer / DEATH_ANIMATION_DURATION;
            const mouthAngle = 0.3 + (Math.PI - 0.3) * progress;

            this.ctx.fillStyle = '#fde047';
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.arc(px, py, radius, baseAngle + mouthAngle, baseAngle - mouthAngle, false);
            this.ctx.closePath();
            this.ctx.fill();

            return;
        }
        let mouth: number;
        if (this.pacman.isMoving) {
            mouth = Math.abs(Math.sin(this.pacman.mouthTimer)) * 0.8;
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

    private drawGhost(ghost: Ghost) {
        const baseRadius = this.tileSize * 0.45;
        const radius = baseRadius * this.ghostScale;
        const { x: pxBase, y: pyBase } = this.toPixels(ghost.position);
        const isAtHome = ghost.home && this.distance(ghost.position, ghost.home) < 0.06;
        const isHeadbutting = (ghost.headbuttTimer ?? 0) > 0;
        const shouldBounce = !isHeadbutting && (!!ghost.inHouse || (isAtHome && this.phase !== 'playing'));
        const bounceOffsetTiles = shouldBounce
            ? Math.sin(performance.now() / 150 + (ghost.randomPhase ?? 0)) * 0.18
            : 0;
        let shakeOffsetTiles = 0;
        if (ghost.state === 'frightened' && (ghost.inHouse || this.phase === 'waiting')) {
            const phase = performance.now() / HOUSE_SHIVER_FREQ_MS + (ghost.randomPhase ?? 0);
            const comp = Math.sin(phase) + 0.45 * Math.sin(phase * 2.7 + (ghost.randomPhase ?? 0) * 0.5);
            shakeOffsetTiles = (comp / 1.45) * HOUSE_SHIVER_AMPLITUDE;
        }
        const ghostIdx = this.ghosts.indexOf(ghost);
        let separationPx = 0;
        if (ghostIdx !== -1 && this.ghostScale > 1) {
            const sepMultipliers = [-1.8, -0.6, 0.6, 1.8];
            const mult = sepMultipliers[ghostIdx % sepMultipliers.length] ?? 0;
            const sepBase = 0.8;
            separationPx = mult * sepBase * (this.ghostScale - 1) * this.tileSize;
        }
        const dizzyBouncePx = (ghost.dizzyBounce ?? 0) * this.tileSize;
        let dizzyWobbleX = 0;
        let dizzyWobbleY = 0;
        if ((ghost.dizzyTimer ?? 0) > 0) {
            const timeRemaining = ghost.dizzyTimer ?? 0;
            const totalDuration = 2.5;
            const shakeDuration = 0.5;
            if (timeRemaining > totalDuration - shakeDuration) {
                const wobbleTime = performance.now() / 100;
                dizzyWobbleX = Math.sin(wobbleTime * 3 + (ghost.randomPhase ?? 0)) * this.tileSize * 0.08;
                dizzyWobbleY = Math.cos(wobbleTime * 2.5 + (ghost.randomPhase ?? 0) * 1.5) * this.tileSize * 0.06;
            }
        }
        let headbuttLeanX = 0;
        let headbuttLeanY = 0;
        if ((ghost.headbuttLeanAmount ?? 0) > 0) {
            const leanAmount = (ghost.headbuttLeanAmount ?? 0) * this.tileSize;
            const angle = ghost.headbuttAngle ?? 0;
            headbuttLeanX = Math.cos(angle) * leanAmount;
            headbuttLeanY = Math.sin(angle) * leanAmount;
        }
        let angerVibrateX = 0;
        let angerVibrateY = 0;
        if ((ghost.headbuttTimer ?? 0) > 0 && ghost.headbuttPhase === 'leaning') {
            const vibrateTime = performance.now() / 30;
            const seed = ghost.randomPhase ?? 0;
            angerVibrateX = Math.sin(vibrateTime * 7 + seed) * this.tileSize * 0.03;
            angerVibrateY = Math.cos(vibrateTime * 8.5 + seed * 1.5) * this.tileSize * 0.03;
        }

        const px =
            pxBase + shakeOffsetTiles * this.tileSize + separationPx + dizzyWobbleX + headbuttLeanX + angerVibrateX;
        const py =
            pyBase + bounceOffsetTiles * this.tileSize + dizzyBouncePx + dizzyWobbleY + headbuttLeanY + angerVibrateY;
        ghost.renderedX = px;
        ghost.renderedY = py;
        let dizzyRotation = 0;
        if ((ghost.dizzyTimer ?? 0) > 0) {
            const timeRemaining = ghost.dizzyTimer ?? 0;
            const totalDuration = 2.5;
            const shakeDuration = 0.5;
            if (timeRemaining > totalDuration - shakeDuration) {
                const shakeTime = performance.now() / 60;
                const shakeProgress = 1 - (timeRemaining - (totalDuration - shakeDuration)) / shakeDuration;
                const easeOut = 1 - (1 - shakeProgress) ** 3;
                const amplitude = (1 - easeOut) * 0.25;
                dizzyRotation = Math.sin(shakeTime * 4 + (ghost.randomPhase ?? 0)) * amplitude;
            }
        }
        const spinAngle = ghost.spinAngle ?? 0;
        const isSpinning = spinAngle > 0;
        let color = ghost.color;
        if (ghost.regenerating) {
            const pulse = Math.abs(Math.sin(ghost.regenerationTimer * 3));
            const brightness = 200 + Math.floor(pulse * 55);
            color = `rgb(${brightness}, ${brightness}, ${brightness})`;
        } else if (ghost.state === 'frightened') {
            color = '#60a5fa';
        } else if (ghost.state === 'eyes') {
            color = '#bfdbfe';
        }
        if (dizzyRotation !== 0) {
            this.ctx.save();
            this.ctx.translate(px, py);
            this.ctx.rotate(dizzyRotation);
            this.ctx.translate(-px, -py);
        }
        const headbuttRotation = ghost.headbuttRotation ?? 0;
        const isInHeadbutt = headbuttRotation !== 0;
        let headbuttBodyTilt = 0;
        if (isInHeadbutt) {
            const direction = headbuttRotation > 0 ? 1 : -1;
            headbuttBodyTilt = direction * ((6 * Math.PI) / 180);
        }

        const hasHeadbuttTilt = headbuttBodyTilt !== 0;

        if (hasHeadbuttTilt) {
            this.ctx.save();
            this.ctx.translate(px, py);
            this.ctx.rotate(headbuttBodyTilt);
            this.ctx.translate(-px, -py);
        }
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(px - radius, py + radius);
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
        this.ctx.lineTo(px + radius, py);
        this.ctx.arc(px, py, radius, 0, Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();
        if ((ghost.headbuttTimer ?? 0) > 0 && ghost.headbuttPhase === 'leaning') {
            const pulseTime = performance.now() / 200;
            const pulseAmount = (Math.sin(pulseTime) + 1) / 2;
            const glowIntensity = 0.15 + pulseAmount * 0.2;
            this.ctx.shadowBlur = 25 + pulseAmount * 15;
            this.ctx.shadowColor = `rgba(255, 0, 0, ${glowIntensity * 0.6})`;
            for (let i = 0; i < 3; i++) {
                const layerOffset = i * 8;
                const layerOpacity = glowIntensity * (0.3 - i * 0.08);

                this.ctx.strokeStyle = `rgba(255, 0, 0, ${layerOpacity})`;
                this.ctx.lineWidth = 8 + i * 4;
                this.ctx.beginPath();
                this.ctx.moveTo(px - radius, py + radius);
                for (let j = 0; j < waveCount; j++) {
                    const x1 = px - radius + j * waveWidth;
                    const cx = x1 + waveWidth / 2;
                    const x2 = x1 + waveWidth;
                    const y1 = py + radius;
                    const y2 = py + radius + waveDepth;
                    this.ctx.lineTo(x1, y1);
                    this.ctx.quadraticCurveTo(cx, y2, x2, y1);
                }

                this.ctx.lineTo(px + radius, py);
                this.ctx.arc(px, py, radius + layerOffset / 2, 0, Math.PI, true);
                this.ctx.closePath();
                this.ctx.stroke();
            }
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
        }
        const eyeOffsetX = this.tileSize * 0.15 * this.ghostScale;
        const eyeOffsetY = this.tileSize * 0.05 * this.ghostScale;
        const eyeRadius = this.tileSize * 0.15 * this.ghostScale;
        const pupilRadius = this.tileSize * 0.07 * this.ghostScale;
        const pupilShift = this.tileSize * 0.06 * this.ghostScale;
        let lookX = 0;
        let lookY = 0;
        const isDizzy = (ghost.dizzyTimer ?? 0) > 0;
        const isEyeRolling = (ghost.eyeRollTimer ?? 0) > 0;
        const isInHeadbuttAnim = (ghost.headbuttTimer ?? 0) > 0;
        if (isInHeadbuttAnim) {
            lookX = 0;
            lookY = 0;
        } else if (isDizzy) {
            const timeRemaining = ghost.dizzyTimer ?? 0;
            const totalDuration = 2.5;
            const progress = 1 - timeRemaining / totalDuration;

            if (progress < 0.24) {
                const spiralSpeed = 8;
                const spiralAngle = (performance.now() / 80) * spiralSpeed + (ghost.randomPhase ?? 0);
                const spiralRadius = pupilShift * 0.7;

                lookX = Math.cos(spiralAngle) * spiralRadius;
                lookY = Math.sin(spiralAngle) * spiralRadius;
            } else if (progress < 0.6) {
                const rollProgress = (progress - 0.24) / 0.36;
                const rollAngle = rollProgress * Math.PI * 6;
                const rollRadius = pupilShift * 0.8;
                lookX = Math.sin(rollAngle) * rollRadius;
                lookY = -Math.cos(rollAngle) * rollRadius;
                if (rollProgress > 0.6) {
                    const finalEase = (rollProgress - 0.6) / 0.4;
                    const easeOut = 1 - (1 - finalEase) ** 3;
                    lookX = lookX * (1 - easeOut);
                    lookY = lookY * (1 - easeOut) - pupilShift * 0.3 * easeOut;
                }
            } else {
                const googlyProgress = (progress - 0.6) / 0.4;
                const time = performance.now() / 300;
                const seed = ghost.randomPhase ?? 0;
                const jitterX = Math.sin(time * 1.3 + seed) * 0.5 + Math.sin(time * 2.1 + seed * 1.5) * 0.3;
                const jitterY = Math.cos(time * 1.7 + seed * 1.3) * 0.5 + Math.cos(time * 2.4 + seed * 1.8) * 0.3;
                const intensity = 1 - googlyProgress * 0.6;

                lookX = jitterX * pupilShift * intensity;
                lookY = jitterY * pupilShift * intensity;
            }
        } else if (isEyeRolling) {
            const timeRemaining = ghost.eyeRollTimer ?? 0;
            const duration = ghost.eyeRollDuration ?? 2.0;
            const rollProgress = 1 - timeRemaining / duration;
            const eased = rollProgress < 0.5 ? 2 * rollProgress * rollProgress : 1 - (-2 * rollProgress + 2) ** 2 / 2;

            const rollAngle = eased * Math.PI * 2;
            const rollRadius = pupilShift * 1.3;

            lookX = Math.sin(rollAngle) * rollRadius;
            lookY = -Math.cos(rollAngle) * rollRadius;
        } else if (ghost.inHouse || this.phase === 'waiting') {
            if (ghost.lookDir === 'left') lookX = -pupilShift;
            else if (ghost.lookDir === 'right') lookX = pupilShift;
        } else {
            switch (ghost.direction) {
                case 'left':
                    lookX = -pupilShift;
                    break;
                case 'right':
                    lookX = pupilShift;
                    break;
                case 'up':
                    lookY = -pupilShift * 0.6;
                    break;
                case 'down':
                    lookY = pupilShift * 0.6;
                    break;
            }
        }
        if (isSpinning) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(px, py, radius, 0, Math.PI, true);
            this.ctx.rect(px - radius, py, radius * 2, radius);
            this.ctx.clip();
            const normalizedAngle = (spinAngle % (Math.PI * 2)) / (Math.PI * 2);

            let horizontalOffset: number;
            let showEyes = true;
            const slideDistance = radius * 1.5;

            if (normalizedAngle < 0.4) {
                const progress = normalizedAngle / 0.4;
                horizontalOffset = -progress * slideDistance;
            } else if (normalizedAngle < 0.6) {
                showEyes = false;
                horizontalOffset = 0;
            } else {
                const progress = (normalizedAngle - 0.6) / 0.4;
                horizontalOffset = slideDistance - progress * slideDistance;
            }

            if (showEyes) {
                const leftEyeX = px - eyeOffsetX + horizontalOffset;
                const rightEyeX = px + eyeOffsetX + horizontalOffset;
                const eyeY = py + eyeOffsetY;

                if (ghost.state === 'eyes' || ghost.regenerating) {
                    this.ctx.fillStyle = '#1e40af';
                    this.ctx.beginPath();
                    this.ctx.arc(leftEyeX, eyeY, pupilRadius * 0.9, 0, Math.PI * 2);
                    this.ctx.arc(rightEyeX, eyeY, pupilRadius * 0.9, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillStyle = '#fff';
                    this.ctx.beginPath();
                    this.ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
                    this.ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = ghost.state === 'frightened' ? '#fff' : '#1e40af';
                    this.ctx.beginPath();
                    this.ctx.arc(leftEyeX + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
                    this.ctx.arc(rightEyeX + lookX, eyeY + lookY, pupilRadius, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            this.ctx.restore();
        } else {
            const headbuttRotation = ghost.headbuttRotation ?? 0;
            const isHeadbuttFaceShifted = headbuttRotation !== 0;
            let eyeShiftX = 0;
            let showOnlyOneEye = false;
            let showRightEye = true;

            if (isHeadbuttFaceShifted) {
                const rotationAmount = Math.abs(headbuttRotation) / (Math.PI / 2);
                const direction = headbuttRotation > 0 ? 1 : -1;
                eyeShiftX = direction * rotationAmount * eyeOffsetX * 0.8;
                if (rotationAmount > 0.5) {
                    showOnlyOneEye = true;
                    showRightEye = direction > 0;
                }
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(px, py, radius * 0.95, 0, Math.PI * 2);
                this.ctx.clip();
            }
            const headbuttPhase = ghost.headbuttPhase;
            let angryAmount = 0;

            if ((ghost.headbuttTimer ?? 0) > 0) {
                if (headbuttPhase === 'rotating') {
                    const totalDuration = 2.0;
                    const timeRemaining = ghost.headbuttTimer ?? 0;
                    const progress = 1 - timeRemaining / totalDuration;
                    if (progress < 0.2) {
                        angryAmount = progress / 0.2;
                    }
                } else if (headbuttPhase === 'leaning') {
                    angryAmount = 1;
                } else if (headbuttPhase === 'turnback') {
                    const totalDuration = 2.0;
                    const timeRemaining = ghost.headbuttTimer ?? 0;
                    const progress = 1 - timeRemaining / totalDuration;
                    if (progress > 0.8) {
                        angryAmount = 1 - (progress - 0.8) / 0.2;
                    } else {
                        angryAmount = 1;
                    }
                }
            }
            const eyeWidthMultiplier = 1 + angryAmount * 0.08;
            const eyeHeightMultiplier = 1 - angryAmount * 0.15;

            if (ghost.state === 'eyes' || ghost.regenerating) {
                this.ctx.fillStyle = '#1e40af';
                this.ctx.beginPath();
                if (!showOnlyOneEye || !showRightEye) {
                    this.ctx.ellipse(
                        px - eyeOffsetX + lookX + eyeShiftX,
                        py + eyeOffsetY + lookY,
                        pupilRadius * 0.9 * eyeWidthMultiplier,
                        pupilRadius * 0.9 * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                if (!showOnlyOneEye || showRightEye) {
                    this.ctx.ellipse(
                        px + eyeOffsetX + lookX + eyeShiftX,
                        py + eyeOffsetY + lookY,
                        pupilRadius * 0.9 * eyeWidthMultiplier,
                        pupilRadius * 0.9 * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                if (!showOnlyOneEye || !showRightEye) {
                    this.ctx.ellipse(
                        px - eyeOffsetX + eyeShiftX,
                        py + eyeOffsetY,
                        eyeRadius * eyeWidthMultiplier,
                        eyeRadius * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                if (!showOnlyOneEye || showRightEye) {
                    this.ctx.ellipse(
                        px + eyeOffsetX + eyeShiftX,
                        py + eyeOffsetY,
                        eyeRadius * eyeWidthMultiplier,
                        eyeRadius * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                this.ctx.fill();
                this.ctx.fillStyle = ghost.state === 'frightened' ? '#fff' : '#1e40af';
                this.ctx.beginPath();
                if (!showOnlyOneEye || !showRightEye) {
                    this.ctx.ellipse(
                        px - eyeOffsetX + lookX + eyeShiftX,
                        py + eyeOffsetY + lookY,
                        pupilRadius * eyeWidthMultiplier,
                        pupilRadius * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                if (!showOnlyOneEye || showRightEye) {
                    this.ctx.ellipse(
                        px + eyeOffsetX + lookX + eyeShiftX,
                        py + eyeOffsetY + lookY,
                        pupilRadius * eyeWidthMultiplier,
                        pupilRadius * eyeHeightMultiplier,
                        0,
                        0,
                        Math.PI * 2,
                    );
                }
                this.ctx.fill();
            }
            if (isHeadbuttFaceShifted) {
                this.ctx.restore();
            }
        }
        const blinkRemaining = ghost.blinkTimer ?? 0;
        if (blinkRemaining > 0 && !isSpinning) {
            const t = blinkRemaining / BLINK_DURATION;
            const blinkStrength = 1 - Math.abs(t * 2 - 1);

            const blinkEyeRadius = this.tileSize * 0.12 * this.ghostScale;
            const blinkEyeOffsetX = this.tileSize * 0.18 * this.ghostScale;
            const blinkEyeOffsetY = this.tileSize * 0.04 * this.ghostScale;
            const lidMax = blinkEyeRadius * 2.6;
            const lidHeight = lidMax * blinkStrength;

            this.ctx.save();
            this.ctx.globalAlpha = 0.95;
            this.ctx.fillStyle = color;

            const eyeLeftX = px - blinkEyeOffsetX - blinkEyeRadius;
            const eyeRightX = px + blinkEyeOffsetX - blinkEyeRadius;
            const eyeYTop = py + blinkEyeOffsetY - blinkEyeRadius;
            const eyeYTopAdjusted = eyeYTop - 1;
            const lidHeightAdjusted = lidHeight + 1;
            const extraWidthPx = 5;
            const inwardPx = 1;
            const shiftLeftPx = 3;

            const leftRectX = eyeLeftX + inwardPx - shiftLeftPx;
            const rightRectX = eyeRightX - inwardPx + (blinkEyeRadius * 2 + extraWidthPx);
            const totalWidth = Math.max(0, rightRectX - leftRectX);
            this.ctx.fillRect(leftRectX, eyeYTopAdjusted, totalWidth, lidHeightAdjusted);
            this.ctx.restore();
        }
        const winkRemaining = ghost.winkTimer ?? 0;
        if (winkRemaining > 0 && !isSpinning) {
            const t = winkRemaining / WINK_DURATION;
            const winkStrength = 1 - Math.abs(t * 2 - 1);

            const winkEyeRadius = this.tileSize * 0.12 * this.ghostScale;
            const winkEyeOffsetX = this.tileSize * 0.18 * this.ghostScale;
            const winkEyeOffsetY = this.tileSize * 0.04 * this.ghostScale;
            const lidMax = winkEyeRadius * 2.6;
            const lidHeight = lidMax * winkStrength;

            this.ctx.save();
            this.ctx.globalAlpha = 0.95;
            this.ctx.fillStyle = color;

            const winkEye = ghost.winkEye ?? 'left';
            const eyeYTop = py + winkEyeOffsetY - winkEyeRadius;
            const eyeYTopAdjusted = eyeYTop - 1;
            const lidHeightAdjusted = lidHeight + 1;
            const extraWidthPx = 5;
            const inwardPx = 1;
            const shiftLeftPx = 3;

            if (winkEye === 'left') {
                const eyeLeftX = px - winkEyeOffsetX - winkEyeRadius;
                const leftRectX = eyeLeftX + inwardPx - shiftLeftPx;
                const eyeWidth = winkEyeRadius * 2 + extraWidthPx;
                this.ctx.fillRect(leftRectX, eyeYTopAdjusted, eyeWidth, lidHeightAdjusted);
            } else {
                const eyeRightX = px + winkEyeOffsetX - winkEyeRadius;
                const rightRectX = eyeRightX - inwardPx;
                const eyeWidth = winkEyeRadius * 2 + extraWidthPx;
                this.ctx.fillRect(rightRectX, eyeYTopAdjusted, eyeWidth, lidHeightAdjusted);
            }

            this.ctx.restore();
        }

        if (hasHeadbuttTilt) {
            this.ctx.restore();
        }
        if (dizzyRotation !== 0) {
            this.ctx.restore();
        }
    }

    private drawArgumentSymbols() {
        for (let idx = 0; idx < this.ghosts.length - 1; idx++) {
            const ghost = this.ghosts[idx];
            const partner = this.ghosts[idx + 1];

            if ((ghost.headbuttTimer ?? 0) > 0 && ghost.headbuttPhase === 'leaning') {
                const ghost1Pixels = this.toPixels(ghost.position);
                const ghost1X = ghost.renderedX ?? ghost1Pixels.x;
                const ghost1Y = ghost.renderedY ?? ghost1Pixels.y;
                const ghost2Pixels = this.toPixels(partner.position);
                const ghost2X = partner.renderedX ?? ghost2Pixels.x;
                const ghost2Y = partner.renderedY ?? ghost2Pixels.y;
                let centerX = (ghost1X + ghost2X) / 2;
                const minY = Math.min(ghost1Y, ghost2Y);
                if (idx === 0) {
                    centerX -= this.tileSize * 0.8;
                } else if (idx === 1) {
                    centerX -= this.tileSize * 0.6;
                }

                const symbolSize = this.tileSize;
                const time = performance.now();
                const cycleDuration = 2000;
                const symbolCount = 5;
                const totalHeight = this.tileSize * 3;
                const spreadWidth = this.tileSize * 1.5;

                for (let i = 0; i < symbolCount; i++) {
                    const offset = (i / symbolCount) * cycleDuration;
                    const cycleTime = (time + offset) % cycleDuration;
                    const progress = cycleTime / cycleDuration;
                    const symbol = i % 2 === 0 ? '?' : '!';
                    const horizontalOffset = (i / (symbolCount - 1) - 0.5) * spreadWidth;
                    const x = centerX + horizontalOffset;
                    const startY = minY - this.tileSize * 0.5;
                    const y = startY - progress * totalHeight;
                    const angleBase = Math.sin(time * 0.003 + i * 2.5 + idx * 10);
                    const angle = angleBase * 25 * (Math.PI / 180);
                    let opacity = 1;
                    if (progress < 0.2) {
                        opacity = progress / 0.2;
                    } else if (progress > 0.8) {
                        opacity = 1 - (progress - 0.8) / 0.2;
                    }

                    this.ctx.save();
                    this.ctx.translate(x, y);
                    this.ctx.rotate(angle);
                    this.ctx.globalAlpha = opacity * 0.85;
                    this.ctx.fillStyle = '#fff';
                    this.ctx.strokeStyle = '#000';
                    this.ctx.lineWidth = 2;
                    this.ctx.font = `bold ${symbolSize}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.strokeText(symbol, 0, 0);
                    this.ctx.fillText(symbol, 0, 0);
                    this.ctx.restore();
                }
            }
        }
    }

    private drawSpeechBubble(bubble: SpeechBubble) {
        if (bubble.timer <= 0 || !bubble.text) return;
        const ghost1 = this.getGhostById(bubble.ghostId1);
        const ghost2 = this.getGhostById(bubble.ghostId2);

        if (!ghost1 || !ghost2) return;

        const timeRemaining = bubble.timer;
        const totalDuration = 4.0;
        const fadeInTime = 0.3;
        const fadeOutTime = 1.0;
        let opacity = 1.0;
        const elapsed = totalDuration - timeRemaining;

        if (elapsed < fadeInTime) {
            opacity = elapsed / fadeInTime;
        } else if (timeRemaining < fadeOutTime) {
            opacity = timeRemaining / fadeOutTime;
        }
        const { x: ghost1BaseX, y: ghost1BaseY } = this.toPixels(ghost1.position);
        const { x: ghost2BaseX, y: ghost2BaseY } = this.toPixels(ghost2.position);
        const ghost1Idx = this.ghosts.indexOf(ghost1);
        const ghost2Idx = this.ghosts.indexOf(ghost2);

        let ghost1SeparationPx = 0;
        let ghost2SeparationPx = 0;

        if (this.ghostScale > 1) {
            const sepMultipliers = [-1.8, -0.6, 0.6, 1.8];
            const sepBase = 0.8;

            if (ghost1Idx !== -1) {
                const mult = sepMultipliers[ghost1Idx % sepMultipliers.length] ?? 0;
                ghost1SeparationPx = mult * sepBase * (this.ghostScale - 1) * this.tileSize;
            }

            if (ghost2Idx !== -1) {
                const mult = sepMultipliers[ghost2Idx % sepMultipliers.length] ?? 0;
                ghost2SeparationPx = mult * sepBase * (this.ghostScale - 1) * this.tileSize;
            }
        }

        const ghost1Px = ghost1BaseX + ghost1SeparationPx;
        const ghost1Py = ghost1BaseY;
        const ghost2Px = ghost2BaseX + ghost2SeparationPx;
        const ghost2Py = ghost2BaseY;
        const centerPx = (ghost1Px + ghost2Px) / 2;
        const centerPy = (ghost1Py + ghost2Py) / 2;
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
        this.ctx.strokeStyle = this.currentMaze.wallColor;
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
        this.ctx.strokeStyle = this.currentMaze.wallColor;
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

    private computeWallGroups(): Point[][] {
        const wallGroups: Point[][] = [];
        const visited = new Set<string>();
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (this.grid[row]?.[col] !== 'wall') continue;
                const key = `${row},${col}`;
                if (visited.has(key)) continue;
                const wallGroup: Point[] = [];
                const queue: Point[] = [{ x: col, y: row }];
                const groupSet = new Set<string>([key]);

                while (queue.length > 0) {
                    const curr = queue.shift();
                    if (!curr) continue;
                    wallGroup.push(curr);

                    const neighbors = [
                        { x: curr.x - 1, y: curr.y },
                        { x: curr.x + 1, y: curr.y },
                        { x: curr.x, y: curr.y - 1 },
                        { x: curr.x, y: curr.y + 1 },
                    ];

                    for (const n of neighbors) {
                        const nKey = `${n.y},${n.x}`;
                        if (!groupSet.has(nKey) && this.grid[n.y]?.[n.x] === 'wall') {
                            groupSet.add(nKey);
                            queue.push(n);
                        }
                    }
                }

                for (const k of groupSet) {
                    visited.add(k);
                }
                wallGroups.push(wallGroup);
            }
        }
        return wallGroups;
    }
}
