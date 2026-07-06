import * as THREE from "three";
import {
  DEFAULT_INTERIOR_FIRE_TUNING,
  normalizeFlameTexVRange,
  VIDEO_CLIP_RADIUS_FACTOR,
} from "./barrelFireLayout";
import {
  OIL_BARREL_FIRE_ALPHA_SRC,
  OIL_BARREL_FIRE_COLOR_SRC,
  VIDEO_TOP_FADE_END,
  VIDEO_TOP_FADE_START,
} from "./interiorFireTuning";

function makeLoopingVideo(url: string) {
  const video = document.createElement("video");
  video.src = url;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "auto";
  return video;
}

function configureVideoTexture(
  texture: THREE.VideoTexture,
  video: HTMLVideoElement,
  colorSpace: THREE.ColorSpace,
) {
  texture.colorSpace = colorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  void video.play().catch(() => {});
  return texture;
}

export function createInteriorFireMaterial(
  colorTex: THREE.VideoTexture,
  alphaTex: THREE.VideoTexture,
  innerRadius: number,
  clipTopY: number,
) {
  const { sampleV0, sampleV1 } = normalizeFlameTexVRange(DEFAULT_INTERIOR_FIRE_TUNING);

  return new THREE.ShaderMaterial({
    uniforms: {
      uColorTex: { value: colorTex },
      uAlphaTex: { value: alphaTex },
      clipRadius: { value: innerRadius * VIDEO_CLIP_RADIUS_FACTOR },
      clipTopY: { value: clipTopY },
      sampleV0: { value: sampleV0 },
      sampleV1: { value: sampleV1 },
      topFadeStart: { value: VIDEO_TOP_FADE_START },
      topFadeEnd: { value: VIDEO_TOP_FADE_END },
      barrelMatrixInverse: { value: new THREE.Matrix4() },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uColorTex;
      uniform sampler2D uAlphaTex;
      uniform float clipRadius;
      uniform float clipTopY;
      uniform float sampleV0;
      uniform float sampleV1;
      uniform float topFadeStart;
      uniform float topFadeEnd;
      uniform mat4 barrelMatrixInverse;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vec4 local = barrelMatrixInverse * vec4(vWorldPos, 1.0);
        float r = length(local.xz);
        if (local.y < clipTopY && r > clipRadius) discard;

        vec2 uv = vec2(vUv.x, mix(sampleV0, sampleV1, clamp(vUv.y, 0.0, 1.0)));
        vec3 rgb = texture2D(uColorTex, uv).rgb;
        float matte = texture2D(uAlphaTex, uv).r;
        float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
        float key = smoothstep(0.05, 0.2, lum);
        float blueSpill = smoothstep(0.12, 0.42, rgb.b - max(rgb.r, rgb.g));
        float alpha = matte * key * (1.0 - blueSpill * 0.92);
        float topFade = 1.0 - smoothstep(topFadeStart, topFadeEnd, vUv.y);
        alpha *= topFade;
        if (alpha < 0.02) discard;
        rgb *= alpha;
        gl_FragColor = vec4(rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    premultipliedAlpha: true,
    side: THREE.DoubleSide,
    toneMapped: false,
    lights: false,
  });
}

export async function loadInteriorFireVideos() {
  const colorVideo = makeLoopingVideo(OIL_BARREL_FIRE_COLOR_SRC);
  const alphaVideo = makeLoopingVideo(OIL_BARREL_FIRE_ALPHA_SRC);

  await Promise.all([
    new Promise<void>((resolve, reject) => {
      colorVideo.addEventListener("loadeddata", () => resolve(), { once: true });
      colorVideo.addEventListener("error", () => reject(new Error("Fire color video failed to load.")), {
        once: true,
      });
      colorVideo.load();
    }),
    new Promise<void>((resolve, reject) => {
      alphaVideo.addEventListener("loadeddata", () => resolve(), { once: true });
      alphaVideo.addEventListener("error", () => reject(new Error("Fire alpha video failed to load.")), {
        once: true,
      });
      alphaVideo.load();
    }),
  ]);

  const colorTex = configureVideoTexture(
    new THREE.VideoTexture(colorVideo),
    colorVideo,
    THREE.SRGBColorSpace,
  );
  const alphaTex = configureVideoTexture(
    new THREE.VideoTexture(alphaVideo),
    alphaVideo,
    THREE.NoColorSpace,
  );

  return { alphaTex, alphaVideo, colorTex, colorVideo };
}

export function syncInteriorFireVideos(
  colorVideo: HTMLVideoElement,
  alphaVideo: HTMLVideoElement,
  colorTex: THREE.VideoTexture,
  alphaTex: THREE.VideoTexture,
) {
  if (Math.abs(colorVideo.currentTime - alphaVideo.currentTime) > 0.05) {
    alphaVideo.currentTime = colorVideo.currentTime;
  }

  if (colorVideo.readyState >= 2) {
    colorTex.needsUpdate = true;
  }

  if (alphaVideo.readyState >= 2) {
    alphaTex.needsUpdate = true;
  }
}

export function billboardFireYawOnly(
  mesh: THREE.Mesh,
  barrel: THREE.Object3D,
  camera: THREE.Camera,
) {
  const localCamera = camera.position.clone();
  barrel.worldToLocal(localCamera);
  mesh.rotation.set(0, Math.atan2(localCamera.x, localCamera.z), 0);
}

export function updateInteriorFireUniforms(
  mesh: THREE.Mesh,
  barrel: THREE.Object3D,
) {
  const material = mesh.material as THREE.ShaderMaterial;
  const inverse = material.uniforms.barrelMatrixInverse?.value as THREE.Matrix4 | undefined;

  if (!inverse) {
    return;
  }

  barrel.updateMatrixWorld(true);
  inverse.copy(barrel.matrixWorld).invert();
}
