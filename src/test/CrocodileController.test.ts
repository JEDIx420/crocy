import { describe, it, expect, beforeEach } from 'vitest';
import { SwampTerrain } from '../game/SwampTerrain';
import { CrocodileController } from '../game/CrocodileController';

describe('Crocodile Locomotion & Physics Tests', () => {
  let terrain: SwampTerrain;
  let croc: CrocodileController;

  beforeEach(() => {
    terrain = new SwampTerrain({ size: 200, segments: 40, waterLevel: 0.0 });
    croc = new CrocodileController(terrain, { waterLevel: 0.0 });
  });

  it('correctly classifies locomotion states based on water depth and elevation', () => {
    // 1. Dry ground (terrain above waterLevel)
    expect(croc.evaluateState(1.5, 1.68)).toBe('land');

    // 2. Very shallow water (<0.25m depth)
    expect(croc.evaluateState(-0.1, 0.08)).toBe('land');

    // 3. Wading zone (water depth between 0.25m and 1.1m)
    expect(croc.evaluateState(-0.6, -0.1)).toBe('wading');

    // 4. Deep water on surface (depth > 1.1m, croc near surface)
    expect(croc.evaluateState(-3.0, -0.15)).toBe('surface');

    // 5. Deep water submerged (depth > 1.1m, croc submerged > 0.6m below water)
    expect(croc.evaluateState(-3.0, -1.5)).toBe('submerged');
  });

  it('moves forward on land when forward input is applied', () => {
    croc.position.set(-30, 2.1, 0); // elevated dry bank (terrain h is ~1.9m)
    croc.heading = 0; // facing negative Z
    const initialZ = croc.position.z;

    croc.update(0.1, { forward: 1.0, turn: 0, dive: 0, sprint: false });

    // Moving forward with heading 0 moves along -Z
    expect(croc.position.z).toBeLessThan(initialZ);
    expect(croc.currentSpeed).toBeGreaterThan(0);
    expect(croc.state).toBe('land');
  });

  it('turns responsively according to turn input', () => {
    croc.heading = 0;
    croc.update(0.1, { forward: 0, turn: 1.0, dive: 0, sprint: false });
    expect(croc.heading).not.toBe(0);
  });

  it('smoothly transitions into water channel when moving towards center', () => {
    // Start on bank at x=-15, facing towards river center (x=10)
    croc.position.set(-15, 0.4, 0);
    croc.heading = -Math.PI / 2; // facing +X towards river center

    // Simulate several steps moving forward towards river
    for (let i = 0; i < 40; i++) {
      croc.update(0.05, { forward: 1.0, turn: 0, dive: 0, sprint: false });
    }

    // Crocodile should have entered the river and reached wading or surface swimming
    expect(croc.position.x).toBeGreaterThan(-15);
    expect(['wading', 'surface', 'submerged']).toContain(croc.state);
  });

  it('can dive down in deep water', () => {
    // Place directly in deep channel
    croc.position.set(0, -0.15, 0);
    croc.state = 'surface';

    // Apply dive command
    for (let i = 0; i < 20; i++) {
      croc.update(0.05, { forward: 0, turn: 0, dive: 1.0, sprint: false });
    }

    expect(croc.targetSubmergedDepth).toBeGreaterThan(0);
    expect(croc.position.y).toBeLessThan(0);
  });

  it('respects terrain elevation and avoids sinking through riverbed', () => {
    croc.position.set(0, -0.15, 0);
    const bedH = terrain.getHeightAt(0, 0);

    // Try extreme diving
    for (let i = 0; i < 100; i++) {
      croc.update(0.1, { forward: 0, turn: 0, dive: 1.0, sprint: false });
    }

    // Position Y must never be lower than terrain bed + landClearance
    expect(croc.position.y).toBeGreaterThanOrEqual(bedH + croc.config.landClearance - 0.05);
  });
});
