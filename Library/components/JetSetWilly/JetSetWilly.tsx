"use client";

import { useEffect, useRef, useState } from "react";
import { JetSetWillyEngine } from "./JetSetWillyEngine";
import styles from "./JetSetWilly.module.css";

export type JetSetWillyProps = {
  className?: string;
  title?: string;
  autoFocus?: boolean;
};

export function JetSetWilly({ className, title = "Jet Set Willy", autoFocus = false }: JetSetWillyProps) {
  const componentRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<JetSetWillyEngine | null>(null);
  const [room, setRoom] = useState("The Bathroom");
  const [items, setItems] = useState("0/83");
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new JetSetWillyEngine(canvas, {
      onItemsChange: (collected, total) => setItems(`${collected}/${total}`),
      onRoomChange: (_number, name) => setRoom(name),
    });
    engineRef.current = engine;
    engine.start();
    if (autoFocus) canvas.focus();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [autoFocus]);

  const enterFullscreen = () => {
    void componentRef.current?.requestFullscreen?.();
  };

  return (
    <section ref={componentRef} className={`${styles.component}${className ? ` ${className}` : ""}`} aria-label={title}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Native TypeScript edition</span>
          <h2>{title}</h2>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            aria-pressed={muted}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              engineRef.current?.setMuted(next);
            }}
          >
            {muted ? "Sound on" : "Mute"}
          </button>
          <button type="button" onClick={() => engineRef.current?.reset()}>Restart</button>
          <button type="button" onClick={enterFullscreen}>Full screen</button>
        </div>
      </header>

      <div className={styles.screenShell}>
        <canvas
          aria-label={`${title}. Current room: ${room}. Items collected: ${items}.`}
          className={styles.canvas}
          ref={canvasRef}
          role="application"
          tabIndex={0}
        />
        <span className={styles.focusHint}>Click the game to play</span>
      </div>

      <div className={styles.instructions}>
        <strong>{room}</strong>
        <span>Left: O / ←</span>
        <span>Right: P / →</span>
        <span>Jump: Space / ↑</span>
        <span>Items: {items}</span>
      </div>
      <p className={styles.notice}>Native canvas implementation using level and graphic data extracted from the supplied licensed TZX.</p>
    </section>
  );
}

export default JetSetWilly;
