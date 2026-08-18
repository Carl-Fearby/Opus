'use client';
import { useEffect, useRef, useState } from 'react';
import Joystick from './Joystick';
import styles from './PacMan.module.css';
import { PacmanEngine } from './PacmanEngine';
import { DirectionKey } from './types';

export type PacManProps = {
    className?: string;
    title?: string;
};

export function PacMan({ className, title = 'Opus arcade' }: PacManProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const gameRef = useRef<PacmanEngine | null>(null);
    const joystickRef = useRef<HTMLDivElement | null>(null);
    const joystickKnobRef = useRef<HTMLDivElement | null>(null);
    const [, setScore] = useState(0);
    const [, setLives] = useState(3);
    const [, setLevel] = useState(1);
    const [status, setStatus] = useState('Ready!');
    const [paused, setPaused] = useState(false);
    const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
    const [joystickVisible, setJoystickVisible] = useState(false);
    const [joystickScreenPosition, setJoystickScreenPosition] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!isFullscreen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsFullscreen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        setIsFullscreen((current) => !current);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const game = new PacmanEngine(canvas, {
            onScore: setScore,
            onLives: setLives,
            onLevel: setLevel,
            onStatus: setStatus,
        });
        gameRef.current = game;
        game.resize(wrapper.clientWidth, wrapper.clientHeight);
        game.start();

        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target === wrapper) {
                    const { width, height } = entry.contentRect;
                    game.resize(width, height);
                }
            });
        });
        observer.observe(wrapper);

        return () => {
            observer.disconnect();
            game.destroy();
            gameRef.current = null;
            setPaused(false);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const mapping: Record<string, DirectionKey> = {
                arrowup: 'up',
                w: 'up',
                arrowdown: 'down',
                s: 'down',
                arrowleft: 'left',
                a: 'left',
                arrowright: 'right',
                d: 'right',
            };
            if (mapping[key]) {
                event.preventDefault();
                gameRef.current?.setDirection(mapping[key]);
                return;
            }
            if (key === ' ') {
                event.preventDefault();
                if (status === 'Game Over') {
                    gameRef.current?.restart();
                } else {
                    setPaused((prev) => {
                        const next = !prev;
                        gameRef.current?.setPaused(next);
                        return next;
                    });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleKeyDown as EventListener);
    }, [status]);

    useEffect(() => {
        gameRef.current?.setPaused(paused);
    }, [paused]);

    // Floating joystick control handling - appears on touch anywhere on canvas
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const joystickRadius = 80; // Outer joystick radius
        const knobRadius = 28; // Center knob radius (bigger)
        const maxDistance = joystickRadius - knobRadius; // Maximum distance knob can move from center

        let isDragging = false;
        let currentDirection: DirectionKey | null = null;
        let joystickCenterX = 0;
        let joystickCenterY = 0;
        let activePointerId: number | null = null;

        const calculateDirection = (x: number, y: number): DirectionKey | null => {
            const absX = Math.abs(x);
            const absY = Math.abs(y);

            // Check if Pacman is aligned (at an intersection/corner) - make joystick more forgiving
            const isAligned = gameRef.current?.isPacmanAligned() ?? false;

            // Dynamic thresholds based on alignment
            // When aligned (at corner), be much more forgiving
            const deadZone = isAligned ? 0.05 : 0.1; // Smaller dead zone when at corner
            const threshold = isAligned ? 0.15 : 0.25; // Much lower threshold when at corner
            const directionBias = isAligned ? 0.02 : 0.05; // Less bias when at corner for easier turning

            // Dead zone - too close to center
            if (absX < deadZone && absY < deadZone) {
                return null;
            }

            // Need to be beyond threshold to change direction
            // Lower threshold when at corner makes it easier to turn
            if (absX < threshold && absY < threshold) {
                return null; // Not far enough from center
            }

            // Reduced hysteresis for easier cornering - allow quicker direction changes
            // When at a corner, use minimal bias to allow quick direction changes
            if (absX > absY + directionBias) {
                return x > 0 ? 'right' : 'left';
            } else if (absY > absX + directionBias) {
                return y > 0 ? 'down' : 'up';
            }

            // If we're between directions, prefer the dominant axis (helps with cornering)
            // This allows smoother transitions when moving diagonally
            if (absX > absY) {
                return x > 0 ? 'right' : 'left';
            } else {
                return y > 0 ? 'down' : 'up';
            }
        };

        const updateJoystick = (clientX: number, clientY: number) => {
            const deltaX = clientX - joystickCenterX;
            const deltaY = clientY - joystickCenterY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Clamp to max distance
            const clampedDistance = Math.min(distance, maxDistance);
            const angle = Math.atan2(deltaY, deltaX);
            const clampedX = Math.cos(angle) * clampedDistance;
            const clampedY = Math.sin(angle) * clampedDistance;

            setJoystickPosition({ x: clampedX, y: clampedY });

            // Calculate direction
            const normalizedX = clampedX / maxDistance;
            const normalizedY = clampedY / maxDistance;
            const direction = calculateDirection(normalizedX, normalizedY);

            if (direction && direction !== currentDirection) {
                currentDirection = direction;
                gameRef.current?.setDirection(direction);
            } else if (!direction) {
                currentDirection = null;
            }
        };

        const handleStart = (clientX: number, clientY: number) => {
            // Position joystick at exact touch location anywhere on the page
            // Store the center position in screen coordinates for calculations
            joystickCenterX = clientX;
            joystickCenterY = clientY;

            // Position relative to viewport (fixed positioning) - can be anywhere on screen
            setJoystickScreenPosition({
                x: clientX - joystickRadius,
                y: clientY - joystickRadius,
            });
            setJoystickVisible(true);
            isDragging = true;

            // Initialize knob position at center
            setJoystickPosition({ x: 0, y: 0 });

            // Update joystick position immediately
            updateJoystick(clientX, clientY);
        };

        const handleMove = (clientX: number, clientY: number) => {
            if (!isDragging) return;
            updateJoystick(clientX, clientY);
        };

        const handleEnd = () => {
            isDragging = false;
            setJoystickVisible(false);
            setJoystickPosition({ x: 0, y: 0 });
            currentDirection = null;
        };

        // Helper to check if we should ignore this event (buttons, header, etc.)
        const shouldIgnoreEvent = (target: Element | null): boolean => {
            if (!target) return false;

            // Check if it's a button or link directly
            if (target.tagName === 'BUTTON' || target.tagName === 'A') {
                return true;
            }

            // Check if it's inside a button or link (walk up the tree)
            let element: Element | null = target;
            while (element && element !== document.body) {
                if (element.tagName === 'BUTTON' || element.tagName === 'A') {
                    return true;
                }
                // Check for button container classes
                if (
                    element.classList &&
                    (element.classList.contains('buttonContainer') ||
                        element.classList.contains('startGameButton') ||
                        element.classList.contains('newGameButton'))
                ) {
                    return true;
                }
                element = element.parentElement;
            }

            // Check if it's in the header area - always ignore header
            const header = target.closest('header');
            if (header) {
                return true;
            }

            // Check for any element with role="button"
            if (target.closest('[role="button"]')) {
                return true;
            }

            return false;
        };

        // Pointer events (works for both mouse and touch) - listen anywhere on page
        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Element;

            // Skip if it's a button, link, or in the header
            if (shouldIgnoreEvent(target)) {
                return; // Let the button/header handle it naturally
            }

            // Only prevent default and capture for non-interactive elements
            e.preventDefault();
            activePointerId = e.pointerId;
            const element = e.target as HTMLElement;
            if (element && element.setPointerCapture) {
                element.setPointerCapture(e.pointerId);
            }
            handleStart(e.clientX, e.clientY);
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (isDragging && activePointerId === e.pointerId) {
                e.preventDefault();
                handleMove(e.clientX, e.clientY);
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (activePointerId === e.pointerId) {
                const element = e.target as HTMLElement;
                if (element && element.releasePointerCapture) {
                    element.releasePointerCapture(e.pointerId);
                }
                activePointerId = null;
                handleEnd();
            }
        };

        const handlePointerCancel = (e: PointerEvent) => {
            if (activePointerId === e.pointerId) {
                activePointerId = null;
                handleEnd();
            }
        };

        // Touch events - listen anywhere on page
        const handleTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;

            const target = e.target as Element;

            // Skip if it's a button, link, or in the header
            if (shouldIgnoreEvent(target)) {
                return; // Let the button/header handle it naturally
            }

            // Only prevent default for non-interactive elements
            e.preventDefault();
            handleStart(touch.clientX, touch.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            if (touch) {
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            handleEnd();
        };

        // Keep pointer controls scoped to this component so it can be embedded safely.
        const eventOptions: AddEventListenerOptions = { passive: false };

        wrapper.addEventListener('pointerdown', handlePointerDown, eventOptions);
        wrapper.addEventListener('pointermove', handlePointerMove, eventOptions);
        wrapper.addEventListener('pointerup', handlePointerUp, eventOptions);
        wrapper.addEventListener('pointercancel', handlePointerCancel, eventOptions);

        wrapper.addEventListener('touchstart', handleTouchStart, eventOptions);
        wrapper.addEventListener('touchmove', handleTouchMove, eventOptions);
        wrapper.addEventListener('touchend', handleTouchEnd, eventOptions);
        wrapper.addEventListener('touchcancel', handleTouchEnd, eventOptions);

        return () => {
            wrapper.removeEventListener('pointerdown', handlePointerDown, eventOptions);
            wrapper.removeEventListener('pointermove', handlePointerMove, eventOptions);
            wrapper.removeEventListener('pointerup', handlePointerUp, eventOptions);
            wrapper.removeEventListener('pointercancel', handlePointerCancel, eventOptions);

            wrapper.removeEventListener('touchstart', handleTouchStart, eventOptions);
            wrapper.removeEventListener('touchmove', handleTouchMove, eventOptions);
            wrapper.removeEventListener('touchend', handleTouchEnd, eventOptions);
            wrapper.removeEventListener('touchcancel', handleTouchEnd, eventOptions);
        };
    }, []);

    return (
        <>
            <section
                className={`${styles.container}${className ? ` ${className}` : ''}`}
                aria-label={title}
                data-fullscreen={isFullscreen ? 'true' : undefined}
            >
                <div className={styles.buttonContainer}>
                    {status === 'Press Start' ? (
                        <button
                            className={styles.startGameButton}
                            onClick={() => gameRef.current?.startGame()}
                            type="button"
                        >
                            START GAME
                        </button>
                    ) : (
                        <button
                            className={styles.newGameButton}
                            onClick={() => gameRef.current?.restart()}
                            type="button"
                        >
                            NEW GAME
                        </button>
                    )}
                    <button className={styles.fullscreenButton} onClick={toggleFullscreen} type="button">
                        {isFullscreen ? 'Exit full screen' : 'Full screen'}
                    </button>
                </div>

                <div className={styles.canvasWrapper} ref={wrapperRef}>
                    <canvas ref={canvasRef} className={styles.canvas} />
                </div>

                <Joystick
                    visible={joystickVisible}
                    position={joystickScreenPosition}
                    knobPosition={joystickPosition}
                    joystickRef={joystickRef}
                    knobRef={joystickKnobRef}
                    onDirectionChange={() => {}} // Not used, direction is handled in the effect
                />
            </section>
        </>
    );
}

export default PacMan;
