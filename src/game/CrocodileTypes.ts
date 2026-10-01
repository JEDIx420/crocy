export type LocomotionState = 'land' | 'wading' | 'surface' | 'submerged';

export interface CrocInputState {
  forward: number;      // -1 (backward) to 1 (forward)
  turn: number;         // -1 (left) to 1 (right)
  dive: number;         // -1 (surface) to 1 (submerge/dive down)
  sprint: boolean;      // sprint / burst swim
}

export interface CrocodilePhysicsConfig {
  walkSpeed: number;
  sprintWalkSpeed: number;
  wadeSpeed: number;
  swimSpeed: number;
  burstSwimSpeed: number;
  submergedSpeed: number;
  turnSpeed: number;
  swimTurnSpeed: number;
  diveSpeed: number;
  surfaceOffset: number;   // Y offset when swimming on surface (snout/eyes exposed)
  submergedOffset: number; // Y offset when submerged
  landClearance: number;   // ground clearance when on belly/legs
  waterLevel: number;
}

export const DEFAULT_CROC_CONFIG: CrocodilePhysicsConfig = {
  walkSpeed: 3.2,
  sprintWalkSpeed: 5.8,
  wadeSpeed: 2.4,
  swimSpeed: 4.6,
  burstSwimSpeed: 7.8,
  submergedSpeed: 4.2,
  turnSpeed: 1.8,
  swimTurnSpeed: 2.4,
  diveSpeed: 2.2,
  surfaceOffset: -0.15,
  submergedOffset: -1.6,
  landClearance: 0.18,
  waterLevel: 0.0
};
