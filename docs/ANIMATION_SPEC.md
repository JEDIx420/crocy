# CROCY — Animation Specification (Phase 1 Blueprint)

## 1. Asset Status & Technical Challenge
As verified in Phase 0 audit (`docs/ASSET_INVENTORY.md`):
- The authoritative crocodile model (`crocodile_high_quality.glb` / `public/assets/crocodile.glb`) is an **unrigged sculpt** (0 skins, 0 bones, 0 animations).
- In V0.1, locomotion was represented by oscillating the model pivot as a rigid body.

---

## 2. Animation Strategy for Phase 1

### Approach A (Recommended): Programmatic Skeletal Rigging & Vertex Skinning Pipeline
Rather than relying on manual external GUI tools, we can implement a deterministic Python script or Three.js skinning builder that:
1. Constructs an anatomical bone hierarchy matching the crocodile's dimensions (4.8m length along Z, 1.86m width along X, 0.72m height along Y):
   - `Root_Pelvis` (center of mass)
   - `Spine_01`, `Spine_02`, `Neck`, `Head`, `Jaw`
   - `Tail_01`, `Tail_02`, `Tail_03`, `Tail_04`, `Tail_Tip` (5 articulated tail joints)
   - `Front_Leg_L` (`Shoulder`, `Elbow`, `Wrist`, `Paw`) & `Front_Leg_R`
   - `Back_Leg_L` (`Hip`, `Knee`, `Ankle`, `Paw`) & `Back_Leg_R`
2. Calculates bone weights (`JOINTS_0` and `WEIGHTS_0`) for each of the 13,192 vertices using bounded distance and anatomical bounding capsules.
3. Injects the skin, joints, and inverse bind matrices into `crocodile.glb` so it becomes a standard glTF `SkinnedMesh`.
4. Produces authentic skeletal clips or programmatic bone pose calculations driving authentic movement.

### Approach B: GPU Vertex Shader Deformation (Spine & Tail Undulation)
- Feasible for spine and tail undulation in water, but does not solve individual articulated limb stepping on land.
- Therefore, **Approach A** will be the primary target for Phase 1.

---

## 3. Required Animation States & Locomotion Gait

| State | Propulsion Mechanism | Limb Pose / Action | Spine / Tail Motion | Head & Jaw |
| :--- | :--- | :--- | :--- | :--- |
| **Idle (Land)** | None | Sprawled belly contact, paws planted | Subtle periodic breathing expansion (12 bpm) | Occasional small alert scanning |
| **Walk (Land)** | Diagonal limb alternation (LF+RH, RF+LH) | Low sprawl gait with natural ground contact | S-curve spine flexion counter-balancing limbs; tail drags with inertia | Head remains focused on heading |
| **Sprint (Land)** | Rapid high-walk gait | Faster stride cycle, increased torso lift | Pronounced lateral torso undulation | Slight forward extension |
| **Wading** | Semi-buoyant hybrid | Limbs push against shallows | Tail begins sinusoidal propulsion | Snout above waterline |
| **Surface Swimming**| 100% Tail-driven | Limbs tucked streamlined back against flank | Traveling sinusoidal wave through tail joints | Snout, eyes, and dorsal ridge skimming surface |
| **Submerged Diving**| 100% Tail-driven | Limbs tucked back | Continuous full tail wave with vertical pitch trim | Head pitches downward into dive |
| **Turning / Steering**| Differential torque | Outward limb bracing on land; tail ruddering in water | Lateral flexion bending body into turn arc | Head turns into direction of travel |

---

## 4. Animation Blending & Parameter Controller
An `AnimationController` module will interface between `CrocodileController` (authoritative physics) and `THREE.SkinnedMesh` / `AnimationMixer`:
- **Blend Parameters:**
  - `speed` (0.0 to 7.8 m/s)
  - `gaitCycle` (accumulator driven by actual traveled distance on land)
  - `swimCycle` (accumulator driven by water speed)
  - `turnRate` (-1.0 to +1.0)
  - `waterImmersion` (0.0 on land to 1.0 deep submerged)
  - `diveAngle` (-0.4 to +0.4 rad)
- Zero physics desync: kinematic root displacement remains completely authoritative; animation adapts to match the speed rather than applying root motion displacement.
