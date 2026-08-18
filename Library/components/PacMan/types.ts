export type DirectionKey = 'left' | 'right' | 'up' | 'down';

export type Point = {
    x: number;
    y: number;
};

export type Vector = {
    x: number;
    y: number;
};

export type GhostState = 'scatter' | 'chase' | 'frightened' | 'eyes';

export type Ghost = {
    id: string;
    color: string;
    position: Point;
    direction: DirectionKey;
    state: GhostState;
    scatterTarget: Point;
    home: Point;
    frightenedTimer: number;
    speedMultiplier: number;
    regenerating: boolean;
    regenerationTimer: number;
    inHouse?: boolean;
    homeWaitPellets?: number;
    blinkCooldown?: number;
    blinkTimer?: number;
    lookCooldown?: number;
    lookTimer?: number;
    lookDir?: 'left' | 'right' | 'center';
    randomPhase?: number;
    waitFrightCooldown?: number;
    spinAngle?: number;
    spinDuration?: number;
    spinTimer?: number;
    spinCooldown?: number;
    spinDirection?: 1 | -1;
    dizzyTimer?: number;
    dizzyBounce?: number;
    eyeRollTimer?: number;
    eyeRollCooldown?: number;
    eyeRollDuration?: number;
    winkTimer?: number;
    winkCooldown?: number;
    winkEye?: 'left' | 'right';
    headbuttPartner?: string;
    headbuttTimer?: number;
    headbuttCooldown?: number;
    headbuttPhase?: 'looking' | 'rotating' | 'leaning' | 'leanback' | 'turnback';
    headbuttLeanAmount?: number;
    headbuttAngle?: number;
    headbuttRotation?: number;
    headbuttRotationDir?: number;
    renderedX?: number;
    renderedY?: number;
};

export type PacMan = {
    position: Point;
    direction: DirectionKey;
    nextDirection: DirectionKey;
    speed: number;
    mouthTimer: number;
    isMoving: boolean;
    dying: boolean;
    deathTimer: number;
};

export type SpeechBubble = {
    ghostId1: string;
    ghostId2: string;
    timer: number;
    text: string;
};

export type GamePhase = 'waiting' | 'ready' | 'playing' | 'respawn' | 'over';
