import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SwampTerrain } from './SwampTerrain';

export class SwampVegetation {
  private scene: THREE.Scene;
  private terrain: SwampTerrain;

  constructor(scene: THREE.Scene, terrain: SwampTerrain) {
    this.scene = scene;
    this.terrain = terrain;
  }

  public async init(loader: GLTFLoader, baseUrl: string = './assets/') {
    try {
      // 1. Mangrove Trees
      const mangroveGltf = await loader.loadAsync(`${baseUrl}mangrove_tree.glb`);
      const mangroveMesh = mangroveGltf.scene;
      // Mangrove tree raw dimensions were ~900 units, scale to natural tree size (~7-9m tall)
      const treeScale = 0.008;
      mangroveMesh.scale.set(treeScale, treeScale, treeScale);

      // Distribute mangrove groves along river margins (distFromRiver ~ 18-35m)
      const treePositions: [number, number][] = [
        [20, 15], [24, -20], [-22, 30], [-25, -15],
        [28, 45], [-27, -40], [32, -60], [-30, 60],
        [35, 10], [-34, -5], [26, -75], [-28, 80],
        [22, -35], [-24, -55], [30, 25], [-32, 10]
      ];

      for (const [x, z] of treePositions) {
        const tree = mangroveMesh.clone();
        const y = this.terrain.getHeightAt(x, z);
        tree.position.set(x, y, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        const s = treeScale * (0.8 + Math.random() * 0.4);
        tree.scale.set(s, s, s);
        this.scene.add(tree);
      }

      // 2. Dead Tree Driftwood Trunks
      try {
        const trunkGltf = await loader.loadAsync(`${baseUrl}dead_tree_trunk/dead_tree_trunk_1k.gltf`);
        const trunkMesh = trunkGltf.scene;
        trunkMesh.scale.set(1.4, 1.4, 1.4);

        const trunkSpots: [number, number, number][] = [
          [16, 5, 0.4], [-17, -25, -0.6], [18, -45, 1.2], [-15, 35, 0.8], [14, -65, -0.2]
        ];

        for (const [x, z, rot] of trunkSpots) {
          const log = trunkMesh.clone();
          const y = this.terrain.getHeightAt(x, z);
          log.position.set(x, y - 0.1, z);
          log.rotation.y = rot;
          log.rotation.z = (Math.random() - 0.5) * 0.2;
          this.scene.add(log);
        }
      } catch (err) {
        console.warn('Driftwood trunk load skipped:', err);
      }

      // 3. Fern Undergrowth Clusters
      try {
        const fernGltf = await loader.loadAsync(`${baseUrl}fern_02/fern_02_1k.gltf`);
        const fernMesh = fernGltf.scene;
        fernMesh.scale.set(0.7, 0.7, 0.7);

        for (let i = 0; i < 24; i++) {
          const bankSide = i % 2 === 0 ? 1 : -1;
          const x = bankSide * (22.0 + Math.random() * 16.0);
          const z = (Math.random() - 0.5) * 160.0;
          const y = this.terrain.getHeightAt(x, z);

          const fern = fernMesh.clone();
          fern.position.set(x, y, z);
          fern.rotation.y = Math.random() * Math.PI * 2;
          const s = 0.5 + Math.random() * 0.4;
          fern.scale.set(s, s, s);
          this.scene.add(fern);
        }
      } catch (err) {
        console.warn('Fern load skipped:', err);
      }

      console.log('Swamp environment vegetation populated.');
    } catch (e) {
      console.warn('Mangrove vegetation init error:', e);
    }
  }
}
