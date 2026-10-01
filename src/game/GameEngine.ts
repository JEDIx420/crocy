import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SwampTerrain } from './SwampTerrain';
import { TropicalWater } from './TropicalWater';
import { CrocodileController } from './CrocodileController';
import { FollowCamera } from './FollowCamera';
import { InputManager } from './InputManager';
import { AmbientFaunaManager } from './AmbientFaunaManager';
import { SwampVegetation } from './SwampVegetation';

export type QualitySetting = 'low' | 'medium' | 'high';

export class GameEngine {
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  public terrain: SwampTerrain;
  public water: TropicalWater;
  public crocodile: CrocodileController;
  public followCamera: FollowCamera;
  public input: InputManager;
  public fauna: AmbientFaunaManager;
  public vegetation: SwampVegetation;

  private clock: THREE.Clock;
  private isUnderwater: boolean = false;
  public quality: QualitySetting = 'high';

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Fog configurations for surface vs underwater
  private surfaceFog: THREE.FogExp2;
  private underwaterFog: THREE.FogExp2;

  // Status callback for UI HUD
  public onStatusUpdate?: (status: {
    state: string;
    speed: number;
    depth: number;
    fps: number;
    underwater: boolean;
  }) => void;

  private frameCount: number = 0;
  private fpsTimer: number = 0;
  private currentFps: number = 60;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.surfaceFog = new THREE.FogExp2(0xa2bead, 0.006); // Soft warm tropical swamp mist
    this.underwaterFog = new THREE.FogExp2(0x0c2522, 0.065); // Deep brackish murky water fog
    this.scene.fog = this.surfaceFog;
    this.scene.background = new THREE.Color(0xa2bead);

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 3. Environmental Lighting
    this.hemiLight = new THREE.HemisphereLight(0xe4efe6, 0x3d3527, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    this.dirLight.position.set(40, 80, 50);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 250;
    const shadowD = 60;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.scene.add(this.dirLight);

    // 4. World components
    this.terrain = new SwampTerrain({ size: 240, segments: 120, waterLevel: 0.0 });
    this.scene.add(this.terrain.mesh);

    this.water = new TropicalWater({ size: 240, waterLevel: 0.0 });
    this.scene.add(this.water.mesh);

    // 5. Authoritative Player Character (Crocodile)
    this.crocodile = new CrocodileController(this.terrain, { waterLevel: 0.0 });
    // Spawn on muddy shoreline bank facing toward the river channel
    const spawnX = -14;
    const spawnZ = 10;
    const spawnH = this.terrain.getHeightAt(spawnX, spawnZ);
    this.crocodile.position.set(spawnX, spawnH + 0.2, spawnZ);
    this.crocodile.heading = -Math.PI / 2; // Facing towards river center (+X)
    this.scene.add(this.crocodile.group);

    // 6. Camera
    this.followCamera = new FollowCamera(this.crocodile.group, this.terrain, window.innerWidth / window.innerHeight);

    // 7. Input
    this.input = new InputManager();

    // 8. Wildlife & Vegetation
    this.fauna = new AmbientFaunaManager(this.scene);
    this.vegetation = new SwampVegetation(this.scene, this.terrain);

    // Window events
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  public async loadAssets(baseUrl: string = './assets/'): Promise<void> {
    const loader = new GLTFLoader();

    // 1. Authoritative crocodile model
    try {
      const crocData = await loader.loadAsync(`${baseUrl}crocodile.glb`);
      this.crocodile.attachModel(crocData.scene);
      console.log('Original authoritative crocodile model loaded and attached.');
    } catch (e) {
      console.error('Failed to load crocodile.glb:', e);
      // Fallback debug mesh just in case to never crash
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.5, 4.5),
        new THREE.MeshStandardMaterial({ color: 0x224422, roughness: 0.7 })
      );
      this.crocodile.attachModel(box);
    }

    // 2. Fauna & Vegetation
    await Promise.all([
      this.fauna.init(loader, baseUrl),
      this.vegetation.init(loader, baseUrl)
    ]);
  }

  public setQuality(quality: QualitySetting) {
    this.quality = quality;
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
      this.dirLight.castShadow = false;
    } else if (quality === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(1024, 1024);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(2048, 2048);
    }
  }

  private onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.followCamera.onWindowResize(width, height);
  }

  public start() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private render() {
    const dt = this.clock.getDelta();

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.currentFps = Math.round((this.frameCount / this.fpsTimer));
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // Input & crocodile update
    const inputState = this.input.getState();
    this.crocodile.update(dt, inputState);

    // Follow camera update
    this.followCamera.update(dt, this.crocodile.heading);

    // Water animation
    this.water.update(dt);

    // Wildlife animation
    this.fauna.update(dt);

    // Dynamic underwater camera effect
    const camY = this.followCamera.camera.position.y;
    const underwaterNow = camY < this.water.waterLevel;

    if (underwaterNow !== this.isUnderwater) {
      this.isUnderwater = underwaterNow;
      if (this.isUnderwater) {
        this.scene.fog = this.underwaterFog;
        this.scene.background = new THREE.Color(0x0a221f);
      } else {
        this.scene.fog = this.surfaceFog;
        this.scene.background = new THREE.Color(0x8fae9d);
      }
    }

    // Directional light follows crocodile for shadow coverage
    this.dirLight.position.x = this.crocodile.position.x + 40;
    this.dirLight.position.z = this.crocodile.position.z + 50;
    this.dirLight.target.position.copy(this.crocodile.position);
    this.dirLight.target.updateMatrixWorld();

    // Render frame
    this.renderer.render(this.scene, this.followCamera.camera);

    // Send status callback to HUD
    if (this.onStatusUpdate) {
      this.onStatusUpdate({
        state: this.crocodile.state,
        speed: Math.abs(this.crocodile.currentSpeed),
        depth: this.crocodile.depthBelowWater,
        fps: this.currentFps,
        underwater: this.isUnderwater
      });
    }
  }
}
