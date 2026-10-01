import * as THREE from 'three';
import { SwampTerrain } from './SwampTerrain';

export class FollowCamera {
  public camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private terrain: SwampTerrain;

  // Camera settings
  public distance: number = 7.5;
  public height: number = 2.4;
  public fov: number = 60;
  
  // Smooth damped positions
  private currentPos: THREE.Vector3 = new THREE.Vector3(0, 5, 10);
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Orbit angles (mouse drag or right-stick)
  public azimuthOffset: number = 0;
  public elevationOffset: number = 0;

  constructor(target: THREE.Object3D, terrain: SwampTerrain, aspect: number) {
    this.target = target;
    this.terrain = terrain;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.1, 800);
    this.currentPos.copy(target.position).add(new THREE.Vector3(0, this.height, this.distance));
    this.camera.position.copy(this.currentPos);
  }

  public update(dt: number, heading: number) {
    const delta = Math.min(dt, 0.1);

    // Compute ideal camera placement behind crocodile based on heading + azimuth
    const angle = heading + this.azimuthOffset;
    const behindX = Math.sin(angle) * this.distance;
    const behindZ = Math.cos(angle) * this.distance;

    let targetCamX = this.target.position.x + behindX;
    let targetCamZ = this.target.position.z + behindZ;
    let targetCamY = this.target.position.y + this.height + this.elevationOffset;

    // Terrain clearance check: ensure camera never clips underground
    const terrainH = this.terrain.getHeightAt(targetCamX, targetCamZ);
    const minCamY = terrainH + 0.6;
    if (targetCamY < minCamY) {
      targetCamY = minCamY;
    }

    const desiredPos = new THREE.Vector3(targetCamX, targetCamY, targetCamZ);

    // Smooth camera damping
    this.currentPos.lerp(desiredPos, 6.0 * delta);
    this.camera.position.copy(this.currentPos);

    // Look at target crocodile center (slightly above ground)
    const desiredLookAt = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + 0.6,
      this.target.position.z
    );
    this.currentLookAt.lerp(desiredLookAt, 10.0 * delta);
    this.camera.lookAt(this.currentLookAt);

    // Slowly return azimuth and elevation offsets towards center when not actively orbiting
    this.azimuthOffset = THREE.MathUtils.lerp(this.azimuthOffset, 0, 1.5 * delta);
    this.elevationOffset = THREE.MathUtils.lerp(this.elevationOffset, 0, 1.5 * delta);
  }

  public onWindowResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
