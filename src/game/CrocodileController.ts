import * as THREE from 'three';
import { LocomotionState, CrocInputState, CrocodilePhysicsConfig, DEFAULT_CROC_CONFIG } from './CrocodileTypes';
import { SwampTerrain } from './SwampTerrain';

export class CrocodileController {
  public group: THREE.Group;
  public modelPivot: THREE.Group;
  public state: LocomotionState = 'land';
  public config: CrocodilePhysicsConfig;
  public terrain: SwampTerrain;

  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public heading: number = 0; // rotation around Y axis in radians
  public pitch: number = 0;   // diving/climbing pitch
  public roll: number = 0;

  public currentSpeed: number = 0;
  public depthBelowWater: number = 0;
  public targetSubmergedDepth: number = 0;

  // Animation cycle accumulator for tail and body undulation
  private swimCycle: number = 0;
  private walkCycle: number = 0;

  constructor(terrain: SwampTerrain, config: Partial<CrocodilePhysicsConfig> = {}) {
    this.terrain = terrain;
    this.config = { ...DEFAULT_CROC_CONFIG, ...config };

    this.group = new THREE.Group();
    this.group.name = 'Crocodile_Root';

    this.modelPivot = new THREE.Group();
    this.modelPivot.name = 'Crocodile_ModelPivot';
    this.group.add(this.modelPivot);
  }

  /**
   * Mounts the loaded GLTF model into the pivot, applying natural scale and centering.
   */
  public attachModel(model: THREE.Object3D) {
    // Clear existing
    while (this.modelPivot.children.length > 0) {
      this.modelPivot.remove(this.modelPivot.children[0]);
    }

    // Measure raw bounding box
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Natural adult saltwater crocodile length: ~4.5 to 5.0 meters long
    // If original model length (Z or Y) is ~75 units, scale to 4.8m
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetLength = 4.8;
    const scaleFactor = targetLength / maxDim;

    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Center model at origin with belly on ground
    const updatedBox = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    updatedBox.getCenter(center);

    model.position.x = -center.x;
    model.position.z = -center.z;
    model.position.y = -updatedBox.min.y; // base rests on local Y=0

    // Authoritative orientation: in model coords, snout faces +Z. Rotate 180deg so snout faces forward (-Z)
    model.rotation.y = Math.PI;

    this.modelPivot.add(model);
  }

  /**
   * Determine locomotion state based on terrain height and water level
   */
  public evaluateState(terrainH: number, currentY: number): LocomotionState {
    const waterDepth = this.config.waterLevel - terrainH;

    // If terrain is above water or barely damp (< 0.25m water)
    if (waterDepth <= 0.25) {
      return 'land';
    }

    // Wading: water is shallow enough that crocodile can still touch ground with body partly submerged
    if (waterDepth < 1.1) {
      return 'wading';
    }

    // Deep water: check if crocodile is diving or on surface
    const submergedAmount = this.config.waterLevel - currentY;
    if (submergedAmount > 0.6) {
      return 'submerged';
    }

    return 'surface';
  }

  /**
   * Authoritative physics step
   */
  public update(dt: number, input: CrocInputState) {
    // Clamp delta time to avoid large physics steps
    const delta = Math.min(dt, 0.1);

    const terrainH = this.terrain.getHeightAt(this.position.x, this.position.z);
    this.state = this.evaluateState(terrainH, this.position.y);

    // Turn handling
    const turnRate = (this.state === 'surface' || this.state === 'submerged')
      ? this.config.swimTurnSpeed
      : this.config.turnSpeed;

    this.heading -= input.turn * turnRate * delta;

    // Movement speeds per state
    let targetSpeed = 0;
    if (input.forward !== 0) {
      if (this.state === 'land') {
        targetSpeed = input.sprint ? this.config.sprintWalkSpeed : this.config.walkSpeed;
      } else if (this.state === 'wading') {
        targetSpeed = this.config.wadeSpeed;
      } else if (this.state === 'surface') {
        targetSpeed = input.sprint ? this.config.burstSwimSpeed : this.config.swimSpeed;
      } else {
        // submerged
        targetSpeed = input.sprint ? this.config.swimSpeed : this.config.submergedSpeed;
      }
      targetSpeed *= input.forward;
    }

    // Smooth speed inertia
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, 8.0 * delta);

    // Calculate displacement along forward heading
    const forwardX = -Math.sin(this.heading);
    const forwardZ = -Math.cos(this.heading);

    this.position.x += forwardX * this.currentSpeed * delta;
    this.position.z += forwardZ * this.currentSpeed * delta;

    // Boundary containment within terrain size
    const halfSize = this.terrain.size * 0.46;
    this.position.x = THREE.MathUtils.clamp(this.position.x, -halfSize, halfSize);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -halfSize, halfSize);

    // Query new terrain height after horizontal move
    const newTerrainH = this.terrain.getHeightAt(this.position.x, this.position.z);

    // Vertical positioning & swimming logic
    let targetY = newTerrainH + this.config.landClearance;

    if (this.state === 'land') {
      targetY = newTerrainH + this.config.landClearance;
      this.targetSubmergedDepth = 0;
    } else if (this.state === 'wading') {
      // Semi-floating between terrain bed and water surface
      const floatH = this.config.waterLevel + this.config.surfaceOffset;
      const groundH = newTerrainH + this.config.landClearance;
      targetY = Math.max(groundH, floatH);
      this.targetSubmergedDepth = 0;
    } else if (this.state === 'surface') {
      const surfaceH = this.config.waterLevel + this.config.surfaceOffset;
      // Dive command can initiate transition to submerged
      if (input.dive > 0.1) {
        this.targetSubmergedDepth += input.dive * this.config.diveSpeed * delta;
        const maxDepth = Math.max(0, this.config.waterLevel - (newTerrainH + 0.3));
        this.targetSubmergedDepth = THREE.MathUtils.clamp(this.targetSubmergedDepth, 0, maxDepth);
        targetY = surfaceH - this.targetSubmergedDepth;
      } else {
        this.targetSubmergedDepth = 0;
        targetY = surfaceH;
      }
    } else if (this.state === 'submerged') {
      // Underwater navigation: dive input changes depth
      const surfaceH = this.config.waterLevel + this.config.surfaceOffset;
      const minAllowableY = newTerrainH + this.config.landClearance;

      if (input.dive > 0.1) {
        // Dive deeper
        this.targetSubmergedDepth += input.dive * this.config.diveSpeed * delta;
      } else if (input.dive < -0.1) {
        // Ascend towards surface
        this.targetSubmergedDepth += input.dive * this.config.diveSpeed * delta;
      }

      const maxDepth = Math.max(0, this.config.waterLevel - minAllowableY);
      this.targetSubmergedDepth = THREE.MathUtils.clamp(this.targetSubmergedDepth, 0, maxDepth);
      targetY = surfaceH - this.targetSubmergedDepth;

      // Prevent sinking through ground
      targetY = Math.max(targetY, minAllowableY);
    }

    // Vertical lerp for smooth water buoyancy and slope traversal
    const verticalLerpFactor = (this.state === 'land' || this.state === 'wading') ? 14.0 : 5.0;
    this.position.y = THREE.MathUtils.lerp(this.position.y, targetY, verticalLerpFactor * delta);
    this.depthBelowWater = Math.max(0, this.config.waterLevel - this.position.y);

    // Apply rotation and align with terrain slope on land
    this.group.position.copy(this.position);
    this.group.rotation.y = this.heading;

    // Pitch & Roll orientation
    if (this.state === 'land' || this.state === 'wading') {
      // Sample slope ahead and behind
      const stepDist = 1.2;
      const frontH = this.terrain.getHeightAt(this.position.x + forwardX * stepDist, this.position.z + forwardZ * stepDist);
      const backH = this.terrain.getHeightAt(this.position.x - forwardX * stepDist, this.position.z - forwardZ * stepDist);
      const targetPitch = Math.atan2(frontH - backH, stepDist * 2.0);

      this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, 8.0 * delta);
      this.roll = THREE.MathUtils.lerp(this.roll, 0, 8.0 * delta);
    } else {
      // Swimming pitch reacts dynamically to diving
      const targetPitch = input.dive * 0.35 * (Math.abs(this.currentSpeed) > 0.5 ? 1 : 0.4);
      this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, 4.0 * delta);
      // Banking roll into turns
      const targetRoll = input.turn * 0.15;
      this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, 4.0 * delta);
    }

    this.group.rotation.x = this.pitch;
    this.group.rotation.z = this.roll;

    // Procedural crocodile motion: undulation / spine swim & walk waddle
    if (Math.abs(this.currentSpeed) > 0.05) {
      if (this.state === 'surface' || this.state === 'submerged') {
        this.swimCycle += delta * Math.abs(this.currentSpeed) * 3.5;
        // Lateral tail-driven spine wave
        this.modelPivot.rotation.y = Math.sin(this.swimCycle) * 0.08;
      } else {
        this.walkCycle += delta * Math.abs(this.currentSpeed) * 4.0;
        // Belly waddle gait
        this.modelPivot.rotation.y = Math.sin(this.walkCycle) * 0.05;
        this.modelPivot.rotation.z = Math.cos(this.walkCycle) * 0.03;
      }
    } else {
      this.modelPivot.rotation.y = THREE.MathUtils.lerp(this.modelPivot.rotation.y, 0, 5.0 * delta);
      this.modelPivot.rotation.z = THREE.MathUtils.lerp(this.modelPivot.rotation.z, 0, 5.0 * delta);
    }
  }
}
