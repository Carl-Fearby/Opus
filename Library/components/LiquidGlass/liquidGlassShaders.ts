/**
 * Shaders for LiquidGlass.
 *
 * The material is not a blur. A height field is derived from gradient noise,
 * turned into a surface normal, and used to refract a procedural backdrop
 * (Snell's law, IOR 1.46). Reflections come from a procedural studio evaluated
 * along the reflected view vector and are mixed in with a Fresnel term, so the
 * rim lights up the way a solid lens does instead of wearing a painted outline.
 */

export const liquidGlassVertexShader = `
attribute vec2 aPosition;
varying vec2 vSheet;

void main() {
  // Full-screen triangle: no geometry, one draw call.
  vSheet = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const liquidGlassFragmentShader = `
precision highp float;

varying vec2 vSheet;

uniform vec2 uSpan;
uniform vec3 uBase;
uniform vec3 uTintA;
uniform vec3 uTintB;
uniform vec3 uTintC;
uniform float uTime;
uniform float uSeed;
uniform float uRelief;
uniform float uRefraction;
uniform float uDispersion;
uniform float uRoughness;
uniform float uReflection;
uniform float uGrain;
uniform float uScale;
uniform float uFlow;
uniform float uShape;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
}

// Gradient noise that carries its own analytic slope, so the surface normal
// costs one evaluation instead of four finite differences.
vec3 gradientNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = p - cell;
  vec2 curve = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 slope = 30.0 * f * f * (f * (f - 2.0) + 1.0);

  vec2 ga = hash2(cell);
  vec2 gb = hash2(cell + vec2(1.0, 0.0));
  vec2 gc = hash2(cell + vec2(0.0, 1.0));
  vec2 gd = hash2(cell + vec2(1.0, 1.0));

  float va = dot(ga, f);
  float vb = dot(gb, f - vec2(1.0, 0.0));
  float vc = dot(gc, f - vec2(0.0, 1.0));
  float vd = dot(gd, f - vec2(1.0, 1.0));

  float blend = va - vb - vc + vd;
  float value = va + curve.x * (vb - va) + curve.y * (vc - va) + curve.x * curve.y * blend;
  vec2 gradient = slope * vec2((vb - va) + curve.y * blend, (vc - va) + curve.x * blend);

  return vec3(value, gradient);
}

vec3 fbm3(vec2 p) {
  vec3 a = gradientNoise(p);
  vec3 b = gradientNoise(p * 2.03 + vec2(11.3, -7.1));
  vec3 c = gradientNoise(p * 4.11 + vec2(-5.7, 19.4));
  return vec3(
    a.x * 0.58 + b.x * 0.28 + c.x * 0.14,
    a.yz * 0.58 + b.yz * 0.28 * 2.03 + c.yz * 0.14 * 4.11
  );
}

vec3 fbm2(vec2 p) {
  vec3 a = gradientNoise(p);
  vec3 b = gradientNoise(p * 2.07 + vec2(-4.2, 6.8));
  return vec3(
    a.x * 0.68 + b.x * 0.32,
    a.yz * 0.68 + b.yz * 0.32 * 2.07
  );
}

// Two rotated fields: broad volumes plus finer folds. No domain warp, so the
// analytic slope stays exact.
vec3 surfaceField(vec2 p, float t) {
  float drift = 0.42 * sin(t * 0.13);
  vec3 broad = fbm3(p * 0.5 + vec2(drift, -0.7 * drift) + uSeed * 0.137);
  vec3 folds = fbm2(mat2(0.72, -0.69, 0.69, 0.72) * p * 1.05 + vec2(-0.6 * drift, 0.8 * drift));
  return vec3(
    broad.x + folds.x * 0.26 * uFlow,
    broad.yz + mat2(0.72, 0.69, -0.69, 0.72) * folds.yz * (0.26 * uFlow * 1.05)
  );
}

// What the glass transmits. Procedural, so the effect never reads the DOM.
vec3 backdrop(vec2 point, float t) {
  float drift = 0.3 * sin(t * 0.09);
  vec3 a = fbm2(point * 1.55 + vec2(3.4 + drift, -2.1));
  vec3 b = fbm2(point * 0.78 + vec2(-5.3, 2.6 - drift));

  float mixA = smoothstep(-0.32, 0.62, a.x);
  float mixB = smoothstep(-0.1, 0.7, b.x);

  vec3 color = mix(uBase, uTintA, mixA * 0.92);
  color = mix(color, uTintB, mixB * 0.55);
  color = mix(color, uTintC, smoothstep(0.35, 0.95, a.x * 0.65 + b.x * 0.35) * 0.4);
  return color;
}

void main() {
  vec2 aspect = uSpan / min(uSpan.x, uSpan.y);
  vec2 sheet = (vSheet - 0.5) * aspect;
  vec2 point = sheet * 2.4 * uScale;

  vec3 field = surfaceField(point, uTime);
  float height = uRelief * smoothstep(-0.62, 0.72, field.x);
  vec2 gradient = field.yz * (2.4 * uScale) * 0.55;

  // Spherical shoulder: the rim bends the backdrop like a solid lens.
  float radius = length(sheet * 2.0);
  float dome = sqrt(max(0.0, 1.0 - min(1.0, radius * radius)));
  float domeAmount = mix(0.05, 0.8, uShape) * uRelief;
  height += dome * domeAmount * 0.45;
  gradient += (-sheet * 4.0) / max(0.42, dome) * domeAmount * 0.45;

  vec3 normal = normalize(vec3(-gradient * 0.3, 1.0));

  float thickness = 0.14 + height * 0.5;
  vec3 refracted = refract(vec3(0.0, 0.0, -1.0), normal, 1.0 / 1.46);
  vec2 displacement = refracted.xy / max(0.2, abs(refracted.z)) * thickness * uRefraction * 0.42;

  vec3 transmission = backdrop(sheet + displacement, uTime);

  if (uDispersion > 0.001) {
    float spread = 0.34 * uDispersion;
    vec3 red = backdrop(sheet + displacement * (1.0 + spread), uTime);
    vec3 blue = backdrop(sheet + displacement * (1.0 - spread), uTime);
    transmission = vec3(red.r, transmission.g, blue.b);
  }

  // Beer-Lambert absorption gives the raised parts body.
  transmission *= exp(-thickness * 0.85 * (vec3(1.0) - uTintA * 0.35));

  vec3 viewed = reflect(vec3(0.0, 0.0, -1.0), normal);
  float keyWidth = 0.26 + 0.5 * uRoughness;
  float key = exp(-pow((viewed.x + 0.42 * viewed.y + 0.18) / keyWidth, 2.0)) * 0.75;
  float softbox = pow(max(0.0, dot(viewed, normalize(vec3(-0.42, 0.58, 0.9)))), mix(64.0, 5.0, uRoughness));
  float fillWidth = 0.22 + 0.65 * uRoughness;
  float fill = exp(-pow((viewed.y - 0.28 * viewed.z - 0.18) / fillWidth, 2.0));

  vec3 environment = mix(uTintA * 0.16, uBase * 0.55, 0.5 + 0.5 * viewed.y);
  environment += vec3(1.0, 0.99, 0.97) * key * mix(2.2, 0.7, uRoughness);
  environment += vec3(1.0) * softbox * mix(6.5, 1.1, uRoughness);
  environment += mix(uBase, vec3(1.0), 0.65) * fill * mix(1.3, 0.45, uRoughness);

  float facing = clamp(normal.z, 0.0, 1.0);
  float fresnel = clamp((0.03 + 0.97 * pow(1.0 - facing, 5.0)) * uReflection, 0.0, 1.0);
  vec3 color = transmission * (1.0 - fresnel) + environment * fresnel;
  color *= 0.9 + 0.1 * max(0.0, dot(normal, normalize(vec3(-0.55, 0.65, 0.9))));

  // Grazing rim: a solid lens gathers light at its edge instead of ending flat.
  float rim = smoothstep(0.86, 1.0, radius) * uShape;
  color *= 1.0 - 0.4 * rim;
  color += vec3(0.05) * rim;

  float brightness = sqrt(dot(color, color) / 3.0);
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uSeed) * 43758.5453) - 0.5;
  color += vec3(grain * uGrain * 0.22 * (0.35 + brightness));

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
