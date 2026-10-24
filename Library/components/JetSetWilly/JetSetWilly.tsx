"use client";

import { useEffect, useRef, useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import { JetSetWillyEngine } from "./JetSetWillyEngine";
import styles from "./JetSetWilly.module.css";

export type JetSetWillyProps = {
  className?: string;
  title?: string;
  autoFocus?: boolean;
};

export function JetSetWilly({ className, title = "Jet Set Willy", autoFocus = false }: JetSetWillyProps) {
  const { t } = useOpusI18n();
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
          <span className={styles.kicker}>{t("jetset.kicker", "Native TypeScript edition")}</span>
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
          <button type="button" onClick={() => engineRef.current?.reset()}>{t("jetset.restart", "Restart")}</button>
          <button type="button" onClick={enterFullscreen}>{t("jetset.fullscreen", "Full screen")}</button>
        </div>
      </header>

      <div className={styles.screenShell}>
        <canvas
          aria-label={t("jetset.aria", "{title}. Current room: {room}. Items collected: {items}.", { title, room, items })}
          className={styles.canvas}
          ref={canvasRef}
          role="application"
          tabIndex={0}
        />
        <span className={styles.focusHint}>{t("jetset.focusHint", "Click the game to play")}</span>
      </div>

      <div className={styles.instructions}>
        <strong>{room}</strong>
        <span>Left: O / ←</span>
        <span>Right: P / →</span>
        <span>Jump: Space / ↑</span>
        <span>Items: {items}</span>
      </div>
      <p className={styles.notice}>{t("jetset.notice", "Native canvas implementation using level and graphic data extracted from the supplied licensed TZX.")}</p>
    </section>
  );
}

export default JetSetWilly;
