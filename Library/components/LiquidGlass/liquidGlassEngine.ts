import { liquidGlassFragmentShader, liquidGlassVertexShader } from "./liquidGlassShaders";

export type LiquidGlassShape = "orb" | "surface";

/** Everything the shader needs. Scalar only, so equal props can be compared cheaply. */
export type LiquidGlassTuning = {
  base: string;
  tintA: string;
  tintB: string;
  tintC: string;
  relief: number;
  refraction: number;
  dispersion: number;
  roughness: number;
  reflection: number;
  grain: number;
  scale: number;
  speed: number;
  flow: number;
  seed: number;
  shape: LiquidGlassShape;
  paused: boolean;
};

export type LiquidGlassEngine = {
  update: (tuning: LiquidGlassTuning) => void;
  reset: () => void;
  dispose: () => void;
};

const MAX_RENDER_PIXELS = 2_600_000;
const MAX_PIXEL_RATIO = 1.75;

const UNIFORM_NAMES = [
  "uSpan",
  "uBase",
  "uTintA",
  "uTintB",
  "uTintC",
  "uTime",
  "uSeed",
  "uRelief",
  "uRefraction",
  "uDispersion",
  "uRoughness",
  "uReflection",
  "uGrain",
  "uScale",
  "uFlow",
  "uShape",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Attach a glass renderer to a canvas.
 *
 * Guards that keep this usable inside a design system:
 * - render pixels are capped (device pixel ratio, total pixel budget)
 * - the loop stops when off-screen, hidden, paused, or reduced motion
 * - one full-screen triangle, one draw call, no geometry or textures
 */
export function createLiquidGlassEngine(
  canvas: HTMLCanvasElement,
  initial: LiquidGlassTuning,
  onFirstFrame?: () => void,
): LiquidGlassEngine | null {
  const parent = canvas.parentElement;
  const doc = canvas.ownerDocument;
  const view = doc.defaultView;
  if (!parent || !view) return null;
  // Annotated so the closures below keep the narrowed, non-null types.
  const host: HTMLElement = parent;
  const win: Window = view;

  const context = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
  });
  if (!context) return null;
  const gl: WebGLRenderingContext = context;

  const vertex = compileShader(gl, gl.VERTEX_SHADER, liquidGlassVertexShader);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, liquidGlassFragmentShader);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    if (program) gl.deleteProgram(program);
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const positionAttribute = gl.getAttribLocation(program, "aPosition");
  const uniformLocations = {} as Record<UniformName, WebGLUniformLocation | null>;
  for (const name of UNIFORM_NAMES) {
    uniformLocations[name] = gl.getUniformLocation(program, name);
  }
  gl.useProgram(program);

  // Let the browser resolve any CSS colour (including color-mix output) to RGB.
  const swatch = doc.createElement("canvas");
  swatch.width = 1;
  swatch.height = 1;
  const swatchContext = swatch.getContext("2d", { willReadFrequently: true });
  const colorCache = new Map<string, number[]>();

  function parseColor(value: string): number[] {
    const cached = colorCache.get(value);
    if (cached) return cached;
    if (!swatchContext) return [1, 1, 1];
    swatchContext.clearRect(0, 0, 1, 1);
    swatchContext.fillStyle = "#ffffff";
    swatchContext.fillStyle = value;
    swatchContext.fillRect(0, 0, 1, 1);
    const data = swatchContext.getImageData(0, 0, 1, 1).data;
    const rgb = [data[0] / 255, data[1] / 255, data[2] / 255];
    colorCache.set(value, rgb);
    return rgb;
  }

  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)");
  let tuning = initial;
  let time = 0;
  let lastTime = 0;
  let frame = 0;
  let ready = false;
  let inView = true;
  let disposed = false;
  let viewportWidth = 0;
  let viewportHeight = 0;

  function draw() {
    if (disposed || !program) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(uniformLocations.uSpan, canvas.width, canvas.height);
    gl.uniform3fv(uniformLocations.uBase, parseColor(tuning.base));
    gl.uniform3fv(uniformLocations.uTintA, parseColor(tuning.tintA));
    gl.uniform3fv(uniformLocations.uTintB, parseColor(tuning.tintB));
    gl.uniform3fv(uniformLocations.uTintC, parseColor(tuning.tintC));
    gl.uniform1f(uniformLocations.uTime, time);
    gl.uniform1f(uniformLocations.uSeed, tuning.seed);
    gl.uniform1f(uniformLocations.uRelief, tuning.relief);
    gl.uniform1f(uniformLocations.uRefraction, tuning.refraction);
    gl.uniform1f(uniformLocations.uDispersion, tuning.dispersion);
    gl.uniform1f(uniformLocations.uRoughness, tuning.roughness);
    gl.uniform1f(uniformLocations.uReflection, tuning.reflection);
    gl.uniform1f(uniformLocations.uGrain, tuning.grain);
    gl.uniform1f(uniformLocations.uScale, tuning.scale);
    gl.uniform1f(uniformLocations.uFlow, tuning.flow);
    gl.uniform1f(uniformLocations.uShape, tuning.shape === "orb" ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!ready) {
      ready = true;
      onFirstFrame?.();
    }
  }

  function measure() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const ratio = Math.min(
      win.devicePixelRatio || 1,
      MAX_PIXEL_RATIO,
      Math.sqrt(MAX_RENDER_PIXELS / Math.max(width * height, 1)),
    );
    const renderWidth = Math.max(1, Math.round(width * ratio));
    const renderHeight = Math.max(1, Math.round(height * ratio));

    if (renderWidth !== viewportWidth || renderHeight !== viewportHeight) {
      viewportWidth = renderWidth;
      viewportHeight = renderHeight;
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      gl.viewport(0, 0, renderWidth, renderHeight);
      draw();
    }
  }

  function isMoving() {
    return !tuning.paused && tuning.speed > 0 && !reducedMotion.matches;
  }

  function schedule() {
    if (disposed || frame || !inView || doc.visibilityState === "hidden" || !isMoving()) return;
    frame = win.requestAnimationFrame(nextFrame);
  }

  function nextFrame(now: number) {
    frame = 0;
    if (disposed || !inView || doc.visibilityState === "hidden") {
      lastTime = 0;
      return;
    }

    if (lastTime) {
      time += ((now - lastTime) / 1000) * tuning.speed;
    }
    lastTime = now;

    draw();
    schedule();
  }

  function start() {
    if (disposed) return;
    measure();
    draw();
    lastTime = 0;
    schedule();
  }

  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measure()) : null;
  resizeObserver?.observe(host);
  win.addEventListener("resize", measure);

  const intersectionObserver =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver((entries) => {
          for (const entry of entries) {
            inView = entry.isIntersecting;
          }
          if (inView) {
            lastTime = 0;
            schedule();
          }
        })
      : null;
  intersectionObserver?.observe(host);

  function onVisibilityChange() {
    if (doc.visibilityState === "visible") {
      lastTime = 0;
      schedule();
    }
  }
  doc.addEventListener("visibilitychange", onVisibilityChange);

  function onMotionChange() {
    if (reducedMotion.matches) {
      draw();
      return;
    }
    lastTime = 0;
    schedule();
  }
  reducedMotion.addEventListener("change", onMotionChange);

  start();

  return {
    update(next) {
      tuning = next;
      lastTime = 0;
      draw();
      schedule();
    },
    reset() {
      time = 0;
      lastTime = 0;
      draw();
      schedule();
    },
    dispose() {
      disposed = true;
      win.cancelAnimationFrame(frame);
      frame = 0;
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      win.removeEventListener("resize", measure);
      doc.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionChange);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      colorCache.clear();
    },
  };
}
