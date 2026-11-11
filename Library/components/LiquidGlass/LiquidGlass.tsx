"use client";

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import {
  createLiquidGlassEngine,
  type LiquidGlassShape,
  type LiquidGlassTuning,
} from "./liquidGlassEngine";
import styles from "./LiquidGlass.module.css";

export type LiquidGlassProps = {
  /** Content painted above the glass. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * `orb` inflates the surface into a lens with a hard rim.
   * `surface` is a panel: same material, flat shoulders.
   */
  shape?: LiquidGlassShape;
  /** Palette. Defaults follow the active Opus theme. */
  baseColor?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  /** Read `--opus-accent` so the pigment follows the active Opus theme. */
  useThemeColors?: boolean;
  /** Height of the glass. Raise for deeper folds and stronger rims. */
  relief?: number;
  /** How far the surface bends the backdrop. */
  refraction?: number;
  /** Chromatic separation along the folds. */
  dispersion?: number;
  /** 0 is polished, 1 is frosted: widens and dims the highlights. */
  roughness?: number;
  /** Reflection strength across the whole surface. */
  reflection?: number;
  /** Film grain, for breaking banding. */
  grain?: number;
  /** Size of the colour pools. Higher is finer. */
  scale?: number;
  /** Flow speed. Zero holds the frame. */
  speed?: number;
  /** Amount of flowing distortion. */
  flow?: number;
  /** Reproducible variation. */
  seed?: number;
  paused?: boolean;
  /** Accessible description of the surface. */
  label?: string;
  ref?: Ref<LiquidGlassHandle>;
};

export type LiquidGlassHandle = {
  /** Restart the animation from its first frame. */
  reset: () => void;
  /** The canvas element, for custom composition. */
  element: HTMLCanvasElement | null;
};

type ThemePalette = { accent?: string };

// Glass needs a light base to refract against; a near-black panel reads as mud.
const FALLBACK_PALETTE = {
  base: "#eceef3",
  tintA: "#171a21",
  tintB: "#6b7280",
  tintC: "#b6bcc8",
};

function readThemePalette(host: HTMLElement): ThemePalette {
  const accent = getComputedStyle(host).getPropertyValue("--opus-accent").trim();
  return { accent: accent || undefined };
}

/**
 * Refractive glass surface.
 *
 * Real refraction, not `backdrop-filter`: the surface is a height field, the
 * normal comes from its analytic slope, and the backdrop is sampled along a
 * Snell's-law refracted ray. That is what gives crisp folded edges, chromatic
 * fringing and rim highlights that travel with the material.
 *
 * The backdrop is procedural, so this is glass as its own scene — it does not
 * bend the page underneath it.
 */
export function LiquidGlass({
  children,
  className,
  style,
  shape = "orb",
  baseColor,
  colorA,
  colorB,
  colorC,
  useThemeColors = true,
  relief = 1.4,
  refraction = 0.95,
  dispersion = 0.6,
  roughness = 0.15,
  reflection = 1.15,
  grain = 0.22,
  scale = 0.85,
  speed = 0.55,
  flow = 0.8,
  seed = 7,
  paused = false,
  label,
  ref,
}: LiquidGlassProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createLiquidGlassEngine>>(null);
  const [ready, setReady] = useState(false);
  const [palette, setPalette] = useState<ThemePalette>({});

  useEffect(() => {
    if (!useThemeColors || !hostRef.current) return;
    setPalette(readThemePalette(hostRef.current));
  }, [useThemeColors]);

  const tuning: LiquidGlassTuning = useMemo(
    () => ({
      base: baseColor ?? FALLBACK_PALETTE.base,
      tintA: colorA ?? palette.accent ?? FALLBACK_PALETTE.tintA,
      tintB: colorB ?? FALLBACK_PALETTE.tintB,
      tintC: colorC ?? FALLBACK_PALETTE.tintC,
      relief,
      refraction,
      dispersion,
      roughness,
      reflection,
      grain,
      scale,
      speed,
      flow,
      seed,
      shape,
      paused,
    }),
    [
      baseColor,
      colorA,
      colorB,
      colorC,
      palette.accent,
      relief,
      refraction,
      dispersion,
      roughness,
      reflection,
      grain,
      scale,
      speed,
      flow,
      seed,
      shape,
      paused,
    ],
  );

  // Scalars only, so a re-render with equal props must not restart the clock.
  const tuningKey = JSON.stringify(tuning);

  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return canvasRef.current;
      },
      reset: () => engineRef.current?.reset(),
    }),
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createLiquidGlassEngine(canvas, tuning, () => setReady(true));
    engineRef.current = engine;

    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
    // The engine is created once; tuning is pushed through update().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.update(tuning);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tuningKey]);

  const rootClass = [styles.root, shape === "orb" ? styles.orb : styles.surface, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={hostRef}
      className={rootClass}
      data-liquid-glass=""
      data-ready={ready ? "true" : "false"}
      role={label ? "img" : undefined}
      aria-label={label}
      style={
        {
          "--glass-base": tuning.base,
          "--glass-a": tuning.tintA,
          "--glass-b": tuning.tintB,
          "--glass-c": tuning.tintC,
          ...style,
        } as CSSProperties
      }
    >
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
