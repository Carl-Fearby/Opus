'use client';
import styles from './Joystick.module.css';
import { DirectionKey } from './types';

interface JoystickProps {
    onDirectionChange: (direction: DirectionKey | null) => void;
    visible: boolean;
    position: { x: number; y: number };
    knobPosition: { x: number; y: number };
    joystickRef: React.RefObject<HTMLDivElement | null>;
    knobRef: React.RefObject<HTMLDivElement | null>;
}

export default function Joystick({ visible, position, knobPosition, joystickRef, knobRef }: JoystickProps) {
    if (!visible) return null;

    return (
        <div
            className={styles.joystickContainer}
            ref={joystickRef}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            aria-label="Joystick control"
        >
            <div className={styles.joystickBase}>
                <div className={styles.joystickRing}></div>
                <div className={styles.joystickArc}></div>
                <div className={styles.joystickArc}></div>
            </div>
            <div
                className={styles.joystickKnob}
                ref={knobRef}
                style={{
                    transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
                }}
            >
                <div className={styles.knobInner}></div>
                <div className={styles.knobHighlight}></div>
            </div>
        </div>
    );
}
