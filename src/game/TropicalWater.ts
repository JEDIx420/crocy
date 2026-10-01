import * as THREE from 'three';

export interface WaterOptions {
  size: number;
  waterLevel: number;
}

export class TropicalWater {
  public mesh: THREE.Mesh;
  public waterLevel: number;
  private material: THREE.MeshStandardMaterial;
  private time: number = 0;

  constructor(options: WaterOptions = { size: 240, waterLevel: 0 }) {
    this.waterLevel = options.waterLevel;

    const geometry = new THREE.PlaneGeometry(options.size, options.size, 64, 64);
    geometry.rotateX(-Math.PI / 2);

    // Realistic tropical murky/brackish mangrove water
    this.material = new THREE.MeshStandardMaterial({
      color: 0x133832,       // Murky brackish emerald/teal
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.82,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.y = this.waterLevel;
    this.mesh.receiveShadow = true;
    this.mesh.name = 'TropicalWater';
  }

  public update(dt: number) {
    this.time += dt;
    // Subtle wave shimmer modulation
    const pulse = Math.sin(this.time * 1.5) * 0.03;
    this.material.roughness = 0.12 + pulse;
  }
}
