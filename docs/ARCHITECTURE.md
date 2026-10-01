# CROCY — Technical Architecture Specification

## 1. System Module Overview

```
                      +-------------------+
                      |    main.ts        |
                      +---------+---------+
                                |
             +------------------+------------------+
             |                                     |
    +--------v----------+               +----------v----------+
    |   GameEngine.ts   | <-----------> |    UIManager.ts     |
    +--------+----------+               +----------+----------+
             |                                     |
   +---------+--------------------+                | (Touch/Keys)
   |         |          |         |                |
+--v---+  +--v---+  +---v---+  +--v---+     +------v------+
|Croc  |  |Water |  |Terrain|  |Fauna |     |InputManager |
|Ctrl  |  |System|  |System |  |Mgr   |     +-------------+
+--+---+  +------+  +-------+  +------+
   |
+--v------------+
| Animation     |
| Controller    |
+---------------+
```

### Core Modules & Responsibilities:
- **`src/game/GameEngine.ts`**: Master loop driver (`requestAnimationFrame`). Owns scene graph, lighting, camera coordination, post-effects/fog transitions, quality settings, and time step management.
- **`src/game/CrocodileController.ts`**: Authoritative physics and kinematic controller. Evaluates ground/water interactions, calculates velocity, steering, buoyancy, and clamps positions within terrain boundaries.
- **`src/game/CrocodileTypes.ts`**: Physics and state configurations (`LocomotionState`: `land`, `wading`, `surface`, `submerged`).
- **`src/game/SwampTerrain.ts`**: Shared analytical heightmap engine. Computes exact ground height `getHeightAt(x, z)` and surface normal `getNormalAt(x, z)` without mesh raycast bottlenecks.
- **`src/game/TropicalWater.ts`**: Mangrove river water surface representation, plane geometry, and material shading.
- **`src/game/AmbientFaunaManager.ts`**: Manages aquatic and terrestrial ambient wildlife (schooling rice fish, benthic sleeper fish, shoreline crabs).
- **`src/game/SwampVegetation.ts`**: Populates mangrove trees, driftwood logs, and fern ground cover.
- **`src/game/FollowCamera.ts`**: Damped third-person orbit camera with subterranean collision prevention.
- **`src/game/InputManager.ts`**: Normalized input vector aggregator for keyboard, mouse, and mobile touch.
- **`src/ui/UIManager.ts`**: Heads-up display (HUD), graphic quality switcher, touch joystick, and action buttons.

---

## 2. Game-Loop Execution Order
In every tick (`render()` in `GameEngine.ts`):
1. **Delta Time Calculation:** Clamped via `clock.getDelta()` to maximum `0.1s` to prevent simulation tunnelling.
2. **Input Processing:** `InputManager.getState()` fetches normalized horizontal/vertical axes and dive/sprint toggles.
3. **Authoritative Physics Step:** `CrocodileController.update(dt, input)`:
   - Evaluates current locomotion state (`land`, `wading`, `surface`, `submerged`) via `SwampTerrain.getHeightAt()`.
   - Updates forward speed, heading, pitch, and roll.
   - Computes displacement and bounds checking.
   - Computes ground contact and vertical buoyancy.
4. **Animation Step:** Updates skeletal bone transforms or articulated deformations based on actual locomotion state and linear/angular velocity.
5. **Camera Update:** `FollowCamera.update(dt, heading)` smoothly lags behind the player's heading while checking ground height to avoid terrain clipping.
6. **Water & FX Step:** Updates water shader uniform time, swimming displacement ripples, and trailing wake particle pool.
7. **Fauna Simulation:** Updates fish schooling boids and crab shoreline avoidance vectors based on crocodile proximity.
8. **Underwater Transition:** Checks camera Y coordinate against water level; triggers hysteresis fog and ambient color transitions.
9. **Render Frame:** Renders scene with active camera.
10. **Telemetry Broadcast:** Updates HUD state, speed, depth, and FPS.

---

## 3. Coordinate System & Orientations
- **World Space:** Right-handed Cartesian:
  - `+X` = Right (across river channel to Eastern bank)
  - `+Y` = Up (elevation)
  - `+Z` = Down river (South)
  - `-Z` = Up river (North / Forward movement when `heading = 0`)
- **Water Level:** Authoritative planar constant `Y = 0.0`.
- **Crocodile Model Local Alignment:**
  - In raw GLB, snout points toward `+Z` and tail points toward `-Z`.
  - Scaled to natural `4.8m` adult length.
  - Aligned via a 180° rotation around local Y (`Math.PI`), ensuring the snout faces along forward vector `-Z`.

---

## 4. Build, Deployment & Assets
- **Vite Configuration:** `base: './'` for static hosting on GitHub Pages under `https://<user>.github.io/<repo>/`.
- **Optimized Asset Pipeline:** Assets placed in `public/assets/`, referenced via relative paths.
- **CI/CD:** Automated GitHub Actions workflow (`.github/workflows/deploy.yml`) running test suites, production build, and GitHub Pages artifact deployment.
