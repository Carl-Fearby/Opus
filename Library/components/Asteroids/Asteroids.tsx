"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Asteroids.module.css";

type AsteroidsProps = { className?: string; title?: string };
type Point = { x: number; y: number };
type Ship = Point & { angle: number; invulnerableUntil: number; vx: number; vy: number };
type Rock = Point & { angle: number; radius: number; spin: number; tier: number; vx: number; vy: number; vertices: number[] };
type Shot = Point & { born: number; vx: number; vy: number };
type Particle = Point & { born: number; colour: string; life: number; vx: number; vy: number };

const TAU = Math.PI * 2;
const SHIP_RADIUS = 13;

function wrap(value: number, limit: number) {
  if (value < 0) return value + limit;
  if (value > limit) return value - limit;
  return value;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function makeRock(width: number, height: number, tier = 3, origin?: Point): Rock {
  const radius = tier * 13;
  let x = origin?.x ?? Math.random() * width;
  let y = origin?.y ?? Math.random() * height;
  if (!origin && distance({ x, y }, { x: width / 2, y: height / 2 }) < 130) {
    x = x < width / 2 ? 25 : width - 25;
    y = y < height / 2 ? 25 : height - 25;
  }
  const heading = Math.random() * TAU;
  const speed = 18 + Math.random() * 28 + (3 - tier) * 12;
  return { x, y, tier, radius, angle: Math.random() * TAU, spin: (Math.random() - 0.5) * 1.3, vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed, vertices: Array.from({ length: 10 }, () => 0.7 + Math.random() * 0.35) };
}

class ArcadeAudio {
  private context: AudioContext | null = null;
  private getContext() {
    if (typeof window === "undefined") return null;
    this.context ??= new AudioContext();
    void this.context.resume();
    return this.context;
  }
  tone(frequency: number, duration: number, type: OscillatorType = "square", end = frequency, gain = 0.08) {
    const context = this.getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, end), context.currentTime + duration);
    volume.gain.setValueAtTime(gain, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(volume).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
  shoot() { this.tone(480, 0.08, "square", 150, 0.06); }
  thrust() { this.tone(70, 0.045, "sawtooth", 45, 0.025); }
  explode(tier: number) { this.tone(110 + tier * 25, 0.22, "sawtooth", 38, 0.1); }
  start() { [220, 330, 440].forEach((frequency, index) => setTimeout(() => this.tone(frequency, 0.1), index * 90)); }
  close() { void this.context?.close(); this.context = null; }
}

export function Asteroids({ className, title = "Asteroids arcade game" }: AsteroidsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const audioRef = useRef<ArcadeAudio | null>(null);
  const keysRef = useRef(new Set<string>());
  const gameRef = useRef({
    height: 600, width: 900, last: 0, level: 1, lives: 3, paused: false, running: false, score: 0,
    ship: { x: 450, y: 300, angle: -Math.PI / 2, invulnerableUntil: 0, vx: 0, vy: 0 } as Ship,
    rocks: [] as Rock[], shots: [] as Shot[], particles: [] as Particle[], lastShot: 0, lastThrustSound: 0,
  });
  const [display, setDisplay] = useState({ level: 1, lives: 3, score: 0 });
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "over">("ready");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resetShip = useCallback((now: number) => {
    const game = gameRef.current;
    game.ship = { x: game.width / 2, y: game.height / 2, angle: -Math.PI / 2, vx: 0, vy: 0, invulnerableUntil: now + 2200 };
  }, []);
  const spawnLevel = useCallback(() => {
    const game = gameRef.current;
    game.rocks = Array.from({ length: Math.min(4 + game.level, 12) }, () => makeRock(game.width, game.height));
  }, []);
  const startGame = useCallback(() => {
    const game = gameRef.current;
    Object.assign(game, { score: 0, lives: 3, level: 1, shots: [], particles: [], running: true, paused: false });
    resetShip(performance.now());
    spawnLevel();
    setDisplay({ score: 0, lives: 3, level: 1 });
    setStatus("playing");
    (audioRef.current ??= new ArcadeAudio()).start();
  }, [resetShip, spawnLevel]);
  const setControl = useCallback((control: string, pressed: boolean) => {
    if (pressed) keysRef.current.add(control); else keysRef.current.delete(control);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const game = gameRef.current;
    audioRef.current = new ArcadeAudio();
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      game.width = Math.max(320, rect.width); game.height = Math.max(360, rect.height);
      canvas.width = Math.round(game.width * ratio); canvas.height = Math.round(game.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!game.running) resetShip(performance.now());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas); resize();
    const burst = (point: Point, count: number, colour: string) => {
      const now = performance.now();
      for (let index = 0; index < count; index += 1) {
        const angle = Math.random() * TAU; const speed = 25 + Math.random() * 100;
        game.particles.push({ ...point, born: now, colour, life: 350 + Math.random() * 450, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
      }
    };
    const drawShip = (ship: Ship, now: number) => {
      if (now < ship.invulnerableUntil && Math.floor(now / 100) % 2 === 0) return;
      context.save(); context.translate(ship.x, ship.y); context.rotate(ship.angle);
      context.strokeStyle = "#e2e8f0"; context.lineWidth = 2; context.beginPath();
      context.moveTo(17, 0); context.lineTo(-12, -10); context.lineTo(-7, 0); context.lineTo(-12, 10); context.closePath(); context.stroke();
      if (keysRef.current.has("thrust")) {
        context.strokeStyle = "#f59e0b"; context.beginPath(); context.moveTo(-8, -5); context.lineTo(-19 - Math.random() * 7, 0); context.lineTo(-8, 5); context.stroke();
      }
      context.restore();
    };
    const drawRock = (rock: Rock) => {
      context.save(); context.translate(rock.x, rock.y); context.rotate(rock.angle); context.beginPath();
      rock.vertices.forEach((scale, index) => {
        const angle = index / rock.vertices.length * TAU;
        const x = Math.cos(angle) * rock.radius * scale; const y = Math.sin(angle) * rock.radius * scale;
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.closePath(); context.strokeStyle = "#cbd5e1"; context.lineWidth = 1.6; context.stroke(); context.restore();
    };
    const update = (now: number) => {
      const delta = Math.min((now - (game.last || now)) / 1000, 0.04); game.last = now;
      if (!game.running || game.paused) return;
      const ship = game.ship; const keys = keysRef.current;
      if (keys.has("left")) ship.angle -= 4.2 * delta;
      if (keys.has("right")) ship.angle += 4.2 * delta;
      if (keys.has("thrust")) {
        ship.vx += Math.cos(ship.angle) * 170 * delta; ship.vy += Math.sin(ship.angle) * 170 * delta;
        if (now - game.lastThrustSound > 120) { audioRef.current?.thrust(); game.lastThrustSound = now; }
      }
      const speed = Math.hypot(ship.vx, ship.vy);
      if (speed > 260) { ship.vx = ship.vx / speed * 260; ship.vy = ship.vy / speed * 260; }
      ship.vx *= 0.997; ship.vy *= 0.997;
      ship.x = wrap(ship.x + ship.vx * delta, game.width); ship.y = wrap(ship.y + ship.vy * delta, game.height);
      if (keys.has("fire") && now - game.lastShot > 180) {
        game.lastShot = now; audioRef.current?.shoot();
        game.shots.push({ x: ship.x + Math.cos(ship.angle) * 18, y: ship.y + Math.sin(ship.angle) * 18, vx: ship.vx + Math.cos(ship.angle) * 430, vy: ship.vy + Math.sin(ship.angle) * 430, born: now });
      }
      game.shots = game.shots.filter((shot) => now - shot.born < 900);
      game.shots.forEach((shot) => { shot.x = wrap(shot.x + shot.vx * delta, game.width); shot.y = wrap(shot.y + shot.vy * delta, game.height); });
      game.rocks.forEach((rock) => { rock.x = wrap(rock.x + rock.vx * delta, game.width); rock.y = wrap(rock.y + rock.vy * delta, game.height); rock.angle += rock.spin * delta; });
      game.particles = game.particles.filter((particle) => now - particle.born < particle.life);
      game.particles.forEach((particle) => { particle.x += particle.vx * delta; particle.y += particle.vy * delta; });
      for (let shotIndex = game.shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
        const hitIndex = game.rocks.findIndex((rock) => distance(game.shots[shotIndex], rock) < rock.radius);
        if (hitIndex < 0) continue;
        const rock = game.rocks[hitIndex]; game.shots.splice(shotIndex, 1); game.rocks.splice(hitIndex, 1);
        audioRef.current?.explode(rock.tier); burst(rock, 8 + rock.tier * 3, "#f8fafc");
        game.score += [0, 100, 50, 20][rock.tier];
        if (rock.tier > 1) game.rocks.push(makeRock(game.width, game.height, rock.tier - 1, rock), makeRock(game.width, game.height, rock.tier - 1, rock));
        setDisplay({ score: game.score, lives: game.lives, level: game.level });
      }
      if (now > ship.invulnerableUntil && game.rocks.some((rock) => distance(ship, rock) < rock.radius + SHIP_RADIUS)) {
        burst(ship, 24, "#f59e0b"); audioRef.current?.explode(3); game.lives -= 1;
        setDisplay({ score: game.score, lives: game.lives, level: game.level });
        if (game.lives <= 0) { game.running = false; setStatus("over"); } else resetShip(now);
      }
      if (game.running && game.rocks.length === 0) {
        game.level += 1; setDisplay({ score: game.score, lives: game.lives, level: game.level }); resetShip(now); spawnLevel();
      }
    };
    const draw = (now: number) => {
      context.clearRect(0, 0, game.width, game.height); context.fillStyle = "#020617"; context.fillRect(0, 0, game.width, game.height);
      context.fillStyle = "rgba(148,163,184,.35)";
      for (let index = 0; index < 45; index += 1) context.fillRect((index * 193) % game.width, (index * 97) % game.height, 1, 1);
      game.rocks.forEach(drawRock);
      context.fillStyle = "#f8fafc"; game.shots.forEach((shot) => { context.beginPath(); context.arc(shot.x, shot.y, 2, 0, TAU); context.fill(); });
      game.particles.forEach((particle) => { context.globalAlpha = Math.max(0, 1 - (now - particle.born) / particle.life); context.fillStyle = particle.colour; context.fillRect(particle.x, particle.y, 2, 2); }); context.globalAlpha = 1;
      if (game.running) drawShip(game.ship, now);
    };
    const frame = (now: number) => { update(now); draw(now); frameRef.current = requestAnimationFrame(frame); };
    frameRef.current = requestAnimationFrame(frame);
    return () => { observer.disconnect(); if (frameRef.current) cancelAnimationFrame(frameRef.current); audioRef.current?.close(); };
  }, [resetShip, spawnLevel]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((current) => !current);
  }, []);

  useEffect(() => {
    const mapping: Record<string, string> = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", ArrowUp: "thrust", w: "thrust", " ": "fire" };
    const down = (event: KeyboardEvent) => {
      const control = mapping[event.key];
      if (control) { event.preventDefault(); setControl(control, true); }
      if (event.key.toLowerCase() === "p" && gameRef.current.running) {
        gameRef.current.paused = !gameRef.current.paused; setStatus(gameRef.current.paused ? "paused" : "playing");
      }
    };
    const up = (event: KeyboardEvent) => { const control = mapping[event.key]; if (control) setControl(control, false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [setControl]);

  const controlProps = (control: string) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); setControl(control, true); },
    onPointerUp: () => setControl(control, false), onPointerCancel: () => setControl(control, false),
  });
  return (
    <section
      className={`${styles.game}${className ? ` ${className}` : ""}`}
      aria-label={title}
      data-fullscreen={isFullscreen ? "true" : undefined}
    >
      <header className={styles.hud} aria-live="polite">
        <div className={styles.hudStats}>
          <span>Score <strong>{display.score.toString().padStart(5, "0")}</strong></span>
          <span>Lives <strong>{display.lives}</strong></span>
          <span>Level <strong>{display.level}</strong></span>
        </div>
        <button className={styles.hudButton} type="button" onClick={toggleFullscreen}>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </header>
      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Asteroids game area" />
        {status !== "playing" ? <div className={styles.overlay}><h2>{status === "over" ? "Game over" : status === "paused" ? "Paused" : "Asteroids"}</h2><p>Rotate, thrust, and clear the field.</p><button type="button" onClick={startGame}>{status === "ready" ? "Start game" : status === "paused" ? "Restart" : "Play again"}</button></div> : null}
      </div>
      <div className={styles.controls} aria-label="Touch controls">
        <button type="button" aria-label="Rotate left" {...controlProps("left")}>↺</button><button type="button" aria-label="Thrust" {...controlProps("thrust")}>▲</button><button type="button" aria-label="Rotate right" {...controlProps("right")}>↻</button><button type="button" className={styles.fire} aria-label="Fire" {...controlProps("fire")}>Fire</button>
      </div>
      <p className={styles.help}>Arrow keys or WASD to fly · Space to fire · P to pause</p>
    </section>
  );
}

export type { AsteroidsProps };
export default Asteroids;
