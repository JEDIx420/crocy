import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AmbientFaunaManager {
  private scene: THREE.Scene;
  private mixers: THREE.AnimationMixer[] = [];
  private fishInstances: { obj: THREE.Object3D; speed: number; rotSpeed: number; baseY: number; radius: number; angle: number; center: THREE.Vector3 }[] = [];
  private crabInstances: { obj: THREE.Object3D; speed: number; startPos: THREE.Vector3; range: number; dir: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public async init(loader: GLTFLoader, baseUrl: string = './assets/') {
    try {
      // 1. School of Rice Fish (Fast schooling near surface/submerged)
      const riceGltf = await loader.loadAsync(`${baseUrl}rice_fish.glb`);
      const riceRoot = riceGltf.scene;
      riceRoot.scale.set(12.0, 12.0, 12.0); // Make visible for small fish

      for (let i = 0; i < 8; i++) {
        const fish = riceRoot.clone();
        const center = new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          -0.8 - Math.random() * 0.8,
          (Math.random() - 0.5) * 40
        );
        fish.position.copy(center);
        this.scene.add(fish);

        if (riceGltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fish);
          const action = mixer.clipAction(riceGltf.animations[0]);
          action.timeScale = 1.0 + Math.random() * 0.5;
          action.play();
          this.mixers.push(mixer);
        }

        this.fishInstances.push({
          obj: fish,
          speed: 1.2 + Math.random() * 0.8,
          rotSpeed: 0.6 + Math.random() * 0.4,
          baseY: center.y,
          radius: 3.0 + Math.random() * 5.0,
          angle: Math.random() * Math.PI * 2,
          center: center
        });
      }

      // 2. Dark Sleeper Fish (Riverbed bottom dweller)
      const sleeperGltf = await loader.loadAsync(`${baseUrl}sleeper_fish.glb`);
      const sleeperRoot = sleeperGltf.scene;
      sleeperRoot.scale.set(3.5, 3.5, 3.5);

      for (let i = 0; i < 4; i++) {
        const fish = sleeperRoot.clone();
        const center = new THREE.Vector3(
          (Math.random() - 0.5) * 35,
          -2.2 - Math.random() * 0.6,
          (Math.random() - 0.5) * 35
        );
        fish.position.copy(center);
        this.scene.add(fish);

        if (sleeperGltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fish);
          const action = mixer.clipAction(sleeperGltf.animations[0]);
          action.timeScale = 0.8 + Math.random() * 0.4;
          action.play();
          this.mixers.push(mixer);
        }

        this.fishInstances.push({
          obj: fish,
          speed: 0.8 + Math.random() * 0.5,
          rotSpeed: 0.4 + Math.random() * 0.3,
          baseY: center.y,
          radius: 4.0 + Math.random() * 6.0,
          angle: Math.random() * Math.PI * 2,
          center: center
        });
      }

      // 3. Ambient Mudbank Crabs (Walking sideways along riverbank sand/mud)
      const crabGltf = await loader.loadAsync(`${baseUrl}crab.glb`);
      const crabRoot = crabGltf.scene;
      crabRoot.scale.set(0.45, 0.45, 0.45);

      for (let i = 0; i < 6; i++) {
        const crab = crabRoot.clone();
        // Place along river shoreline (x between 16 and 22, height around 0.2 to 0.8)
        const bankSide = i % 2 === 0 ? 1 : -1;
        const crabX = bankSide * (18.0 + (Math.random() - 0.5) * 4.0);
        const crabZ = (Math.random() - 0.5) * 60;
        const startPos = new THREE.Vector3(crabX, 0.25, crabZ);
        crab.position.copy(startPos);
        this.scene.add(crab);

        if (crabGltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(crab);
          const action = mixer.clipAction(crabGltf.animations[0]);
          action.timeScale = 1.2;
          action.play();
          this.mixers.push(mixer);
        }

        this.crabInstances.push({
          obj: crab,
          speed: 0.4 + Math.random() * 0.3,
          startPos: startPos.clone(),
          range: 3.0 + Math.random() * 3.0,
          dir: 1
        });
      }

      console.log('Ambient wildlife initialized successfully (fish + crabs).');
    } catch (e) {
      console.warn('Fauna loading warning:', e);
    }
  }

  public update(dt: number) {
    for (const mixer of this.mixers) {
      mixer.update(dt);
    }

    // Update fish paths
    for (const fish of this.fishInstances) {
      fish.angle += fish.rotSpeed * dt;
      const nx = fish.center.x + Math.cos(fish.angle) * fish.radius;
      const nz = fish.center.z + Math.sin(fish.angle) * fish.radius;

      // Facing tangent
      fish.obj.rotation.y = -fish.angle + Math.PI / 2;
      fish.obj.position.x = nx;
      fish.obj.position.z = nz;
      fish.obj.position.y = fish.baseY + Math.sin(fish.angle * 2.0) * 0.15;
    }

    // Update crabs patrolling sideways along shore
    for (const crab of this.crabInstances) {
      const zOffset = crab.obj.position.z - crab.startPos.z;
      if (Math.abs(zOffset) > crab.range) {
        crab.dir *= -1;
      }
      crab.obj.position.z += crab.speed * crab.dir * dt;
    }
  }
}
