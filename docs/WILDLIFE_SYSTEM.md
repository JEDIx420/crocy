# CROCY — Reactive Wildlife System Specification

## 1. Current Implementation (V0.1)
- **Rice Fish:** 8 instances placed at random centers, rotating in rigid circles.
- **Dark Sleeper Fish:** 4 instances circling bottom locations.
- **Crabs:** 6 instances with linear forward/backward oscillation on Z axis.
- **Deficiencies:** No terrain grounding checks, zero awareness of the player's presence, no schooling cohesion, and no habitat boundaries.

---

## 2. Planned Upgrades (Phase 3)

### A. Habitat-Aware Spawning
- **Spawning Rules:**
  - `Rice Fish`: Require water depth between 0.8m and 2.5m; spawn in clusters (schools) of 6–12 fish.
  - `Dark Sleeper Fish`: Require deep water channels (>2.5m); hover within 0.15m–0.3m above the riverbed.
  - `Crabs`: Require damp mudflats (elevation between -0.2m and +0.8m); must strictly snap to terrain elevation using `terrain.getHeightAt(x, z)`.

### B. Schooling Algorithm (Boids)
- Lightweight flocking rules for Rice Fish:
  1. **Cohesion:** Steer towards average local school center.
  2. **Alignment:** Match average velocity of neighboring fish.
  3. **Separation:** Avoid crowding neighbors within personal space (0.8m).
  4. **Boundary Avoidance:** Steer away from river shoreline and water surface.

### C. Predator Threat Awareness & States
- **Threat Detection Radius:**
  - 8.0 meters (reduced to 4.0 meters if crocodile is stationary/floating).
- **Behavioral State Machine:**
  - `IDLE / FORAGING`: Natural schooling or bottom feeding.
  - `ALERT`: Heads turn toward approaching threat.
  - `FLEEING`: Rapid burst swim away from crocodile position.
  - `RECOVERING`: Gradually regrouping back to school center once danger passes (>12m distance).
- **Crab Threat Response:**
  - Crabs detect crocodile footsteps within 5.0m.
  - Scuttle away towards nearest mangrove root or burrow spot; freeze if cornered.
