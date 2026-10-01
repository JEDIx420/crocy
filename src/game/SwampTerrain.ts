import * as THREE from 'three';

export interface HeightmapConfig {
  size: number;       // e.g. 200m x 200m
  segments: number;   // e.g. 128
  waterLevel: number; // e.g. 0.0
}

export class SwampTerrain {
  public mesh: THREE.Mesh;
  public geometry: THREE.PlaneGeometry;
  public size: number;
  public segments: number;
  public waterLevel: number;
  private heightData: Float32Array;

  constructor(config: HeightmapConfig = { size: 240, segments: 120, waterLevel: 0 }) {
    this.size = config.size;
    this.segments = config.segments;
    this.waterLevel = config.waterLevel;

    // Plane is horizontal on XZ
    this.geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    this.geometry.rotateX(-Math.PI / 2);

    const pos = this.geometry.attributes.position;
    this.heightData = new Float32Array(pos.count);

    // Procedural organic river & swamp banks
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = this.calculateHeight(x, z);
      pos.setY(i, h);
      this.heightData[i] = h;
    }

    this.geometry.computeVertexNormals();

    // Natural muddy swamp material with vertex coloring or procedural shading
    let mudTex: THREE.Texture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#2d2417'; // rich dark mud
        ctx.fillRect(0, 0, 512, 512);

        // Mud texture noise
        for (let j = 0; j < 5000; j++) {
          const nx = Math.random() * 512;
          const ny = Math.random() * 512;
          const nr = Math.random() * 4 + 1;
          ctx.fillStyle = Math.random() > 0.5 ? '#1a140d' : '#3d3222';
          ctx.beginPath();
          ctx.arc(nx, ny, nr, 0, Math.PI * 2);
          ctx.fill();
        }
        mudTex = new THREE.CanvasTexture(canvas);
        mudTex.wrapS = THREE.RepeatWrapping;
        mudTex.wrapT = THREE.RepeatWrapping;
        mudTex.repeat.set(24, 24);
      }
    }

    const mat = new THREE.MeshStandardMaterial({
      map: mudTex,
      roughness: 0.85,
      metalness: 0.1,
      color: 0x8a7b68,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(this.geometry, mat);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'SwampTerrain';
  }

  /**
   * Continuous analytical height function for fast queries and seamless physics.
   * Meandering river channel running through the center (Z axis) flanked by muddy banks and islands.
   */
  public calculateHeight(x: number, z: number): number {
    // Meandering river centerline offset along X as a function of Z
    const riverCenter = Math.sin(z * 0.035) * 18.0 + Math.cos(z * 0.015) * 10.0;
    const distFromRiver = Math.abs(x - riverCenter);

    // River bed profile:
    // When distFromRiver < 14, deep water (-2.5 to -3.8m)
    // When distFromRiver between 14 and 25, gradual shallow bank / wading slope
    // When distFromRiver > 25, elevated muddy terrain (+0.5 to +4.0m)
    let baseH = 0;
    if (distFromRiver < 12.0) {
      // Deep channel
      baseH = -3.2 - Math.cos((distFromRiver / 12.0) * Math.PI * 0.5) * 0.8;
    } else if (distFromRiver < 26.0) {
      // Muddy shoreline / wading transition zone
      const t = (distFromRiver - 12.0) / 14.0; // 0 to 1
      baseH = -3.2 * (1.0 - t) + 1.2 * t;
    } else {
      // Dry ground / elevated mangrove mounds
      const t = Math.min((distFromRiver - 26.0) / 30.0, 1.0);
      baseH = 1.2 + t * 2.2;
    }

    // Gentle organic natural mounds
    const detailNoise = Math.sin(x * 0.12 + z * 0.08) * 0.4 +
                        Math.cos(x * 0.07 - z * 0.11) * 0.5 +
                        Math.sin(x * 0.25) * Math.cos(z * 0.22) * 0.25;

    // Small sandbars and mud hummocks in shallow waters
    let hummock = 0;
    if (distFromRiver > 14 && distFromRiver < 22) {
      hummock = Math.sin(z * 0.18) * Math.sin(x * 0.3) * 0.4;
    }

    return baseH + detailNoise + hummock;
  }

  /**
   * Fast height query at any world (x, z)
   */
  public getHeightAt(x: number, z: number): number {
    return this.calculateHeight(x, z);
  }

  /**
   * Calculate surface normal analytically
   */
  public getNormalAt(x: number, z: number, outNormal: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const eps = 0.2;
    const hL = this.calculateHeight(x - eps, z);
    const hR = this.calculateHeight(x + eps, z);
    const hD = this.calculateHeight(x, z - eps);
    const hU = this.calculateHeight(x, z + eps);

    outNormal.set(hL - hR, 2.0 * eps, hD - hU).normalize();
    return outNormal;
  }
}
