import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  computeInteriorFlameLayout,
  DEFAULT_INTERIOR_FIRE_TUNING,
  getOpenBarrelInteriorMetrics,
} from "./barrelFireLayout";
import {
  billboardFireYawOnly,
  createInteriorFireMaterial,
  loadInteriorFireVideos,
  syncInteriorFireVideos,
  updateInteriorFireUniforms,
} from "./interiorFireMaterial";

type SetupFireBarrelSceneOptions = {
  autoRotate?: boolean;
  cameraControls: boolean;
  host: HTMLElement;
  modelSrc: string;
};

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  object: THREE.Object3D,
  fitOffset = 0.92,
) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const distance = (sphere.radius / Math.sin(fovRad / 2)) * fitOffset;
  const polar = THREE.MathUtils.degToRad(75);
  const azimuth = 0;

  controls.target.copy(center);
  camera.position.set(
    center.x + distance * Math.sin(polar) * Math.sin(azimuth),
    center.y + distance * Math.cos(polar),
    center.z + distance * Math.sin(polar) * Math.cos(azimuth),
  );
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
  controls.update();
}

export async function setupFireBarrelScene({
  autoRotate = true,
  cameraControls,
  host,
  modelSrc,
}: SetupFireBarrelSceneOptions) {
  const width = host.clientWidth;
  const height = host.clientHeight;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(38, width / Math.max(height, 1), 0.01, 100);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enabled = cameraControls;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 1.75;
  controls.minPolarAngle = THREE.MathUtils.degToRad(28);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(82);
  controls.update();

  const hemi = new THREE.HemisphereLight(0xdde8ff, 0x2a2418, 1.15);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(2.4, 3.6, 2.1);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffb070, 0.45);
  fill.position.set(-1.8, 1.2, -1.4);
  scene.add(fill);

  const [{ scene: barrelScene }, videos] = await Promise.all([
    new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      new GLTFLoader().load(
        modelSrc,
        (gltf) => resolve({ scene: gltf.scene as THREE.Group }),
        undefined,
        () => reject(new Error("Could not load fire barrel model.")),
      );
    }),
    loadInteriorFireVideos(),
  ]);

  scene.add(barrelScene);
  fitCameraToObject(camera, controls, barrelScene);

  const barrelRoot =
    (barrelScene.getObjectByName("oil_barrel") as THREE.Object3D | null) ?? barrelScene;

  const metrics = getOpenBarrelInteriorMetrics();
  const layout = computeInteriorFlameLayout(
    metrics.innerRadius,
    metrics.floorY,
    metrics.topLipY,
    DEFAULT_INTERIOR_FIRE_TUNING,
  );

  const fireMaterial = createInteriorFireMaterial(
    videos.colorTex,
    videos.alphaTex,
    metrics.innerRadius,
    metrics.topLipY,
  );

  const fireMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(layout.width, layout.height),
    fireMaterial,
  );
  fireMesh.name = "oil_interior_video";
  fireMesh.position.set(layout.x, layout.y, layout.z);
  fireMesh.renderOrder = 6;
  barrelRoot.add(fireMesh);

  let frameId = 0;

  const renderLoop = () => {
    frameId = window.requestAnimationFrame(renderLoop);
    syncInteriorFireVideos(
      videos.colorVideo,
      videos.alphaVideo,
      videos.colorTex,
      videos.alphaTex,
    );
    billboardFireYawOnly(fireMesh, barrelRoot, camera);
    updateInteriorFireUniforms(fireMesh, barrelRoot);
    controls.update();
    renderer.render(scene, camera);
  };

  renderLoop();

  const resizeObserver = new ResizeObserver(() => {
    const nextWidth = host.clientWidth;
    const nextHeight = host.clientHeight;
    if (nextWidth <= 0 || nextHeight <= 0) {
      return;
    }

    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(nextWidth, nextHeight);
    fitCameraToObject(camera, controls, barrelScene);
  });
  resizeObserver.observe(host);

  return () => {
    window.cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
    controls.dispose();
    fireMesh.geometry.dispose();
    fireMaterial.dispose();
    videos.colorTex.dispose();
    videos.alphaTex.dispose();
    videos.colorVideo.pause();
    videos.alphaVideo.pause();
    videos.colorVideo.removeAttribute("src");
    videos.alphaVideo.removeAttribute("src");
    renderer.dispose();

    if (renderer.domElement.parentElement === host) {
      host.removeChild(renderer.domElement);
    }
  };
}
