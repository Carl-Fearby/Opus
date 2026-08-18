import { DirectionKey, Vector } from './types';

export const DIR_VECTORS: Record<DirectionKey, Vector> = {
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
};

export const OPPOSITE: Record<DirectionKey, DirectionKey> = {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up',
};

export const DIR_ORDER: DirectionKey[] = ['left', 'up', 'right', 'down'];

export const ROWS = 26;
export const COLS = 29;

export const POWER_PELLET_DURATION = 6;
export const FRIGHTENED_DURATION = 6;
export const READY_DELAY = 1.2;
export const DEATH_ANIMATION_DURATION = 2;
export const REGENERATION_DURATION = 3.0;
export const PACMAN_BASE_SPEED = 7;
export const GHOST_BASE_SPEED = 6;
export const FRUIT_THRESHOLDS = [70, 170];

export const GHOST_RELEASE_PELLETS: Record<string, number> = {
    blinky: 0,
    pinky: 7,
    inky: 17,
    clyde: 32,
};

export const GHOST_CONFIG = [
    { id: 'blinky', color: '#d60a24', scatterTarget: { x: COLS - 2, y: 1 } },
    { id: 'pinky', color: '#f472b6', scatterTarget: { x: 1, y: 1 } },
    { id: 'inky', color: '#38bdf8', scatterTarget: { x: COLS - 2, y: ROWS - 2 } },
    { id: 'clyde', color: '#facc15', scatterTarget: { x: 1, y: ROWS - 2 } },
];
export const APOLOGY_PHRASES = [
    'Sorry',
    'My Bad',
    'Oops',
    'Love You',
    'Forgive Me',
    'BFF?',
    'Friends?',
    'Still Cool?',
    'Peace?',
    'Truce?',
    'Hugs?',
    'We Good?',
    'Bestie?',
    'Sorry Pal',
    'My Fault',
    'All Good?',
    'No Worries',
    'Love Ya',
    'Be Cool',
    'Chill?',
    'Besties',
    'Squad?',
    'Mate?',
    'Buddies?',
    'Pals?',
];
export const getRandomApology = (): string => {
    return APOLOGY_PHRASES[Math.floor(Math.random() * APOLOGY_PHRASES.length)];
};
export const BLINK_DURATION = 0.35;
export const BLINK_COOLDOWN_MIN = 3.0;
export const BLINK_COOLDOWN_MAX = 6.0;
export const WINK_DURATION = 0.3;
export const WINK_COOLDOWN_MIN = 5.0;
export const WINK_COOLDOWN_MAX = 12.0;
export const GAMEOVER_BLINK_CYCLE = 5.0;
export const GAMEOVER_WINK_CYCLE = 6.0;
export const GAMEOVER_EYEROLL_CYCLE = 15.0;
export const GAMEOVER_GLANCE_CYCLE = 5.0;
export const HOUSE_SHIVER_FREQ_MS = 20;
export const HOUSE_SHIVER_AMPLITUDE = 0.08;
export const WAIT_FRIGHT_COOLDOWN_MIN = 16;
export const WAIT_FRIGHT_COOLDOWN_MAX = 40;
