# CROCY — Animation Specification (Phase 1 Blueprint)

## 1. Asset Status & Technical Challenge
As verified in Phase 0 audit (`docs/ASSET_INVENTORY.md`):
- The authoritative crocodile model (`crocodile_high_quality.glb` / `public/assets/crocodile.glb`) is an **unrigged sculpt** (0 skins, 0 bones, 0 animations).
- In V0.1, locomotion was represented by oscillating the model pivot as a rigid body.

---

## 2. Animation Strategy for Phase 1

### Approach A (Recommended): Programmatic Skeletal Rigging & Vertex Skinning Pipeline
Rather than relying on manual external GUI tools, we implement a deterministic Python pipeline that constructs an anatomical **23-bone crocodilian skeleton**:
- **Core Spine & Head (6 bones):**
  - `Root_Pelvis` (Center of mass / pelvic girdle)
  - `Spine_01` (Lumbar/abdominal spine)
  - `Spine_02` (Thoracic/chest spine)
  - `Neck` (Cervical articulation)
  - `Head` (Cranium & snout)
  - `Jaw` (Lower mandible - weighted only if geometry allows believable opening without tearing)
- **Caudal / Tail Chain (5 articulated bones for traveling sinusoidal waves):**
  - `Tail_01` (Base of muscular tail)
  - `Tail_02` (Upper mid-tail)
  - `Tail_03` (Mid-tail)
  - `Tail_04` (Lower tail)
  - `Tail_Tip` (Flexible caudal fin/tip)
- **Left Front Limb (3 bones):**
  - `Shoulder_L` (Clavicle/upper arm)
  - `Elbow_L` (Forearm)
  - `Wrist_Paw_L` (Planted front-left manus)
- **Right Front Limb (3 bones):**
  - `Shoulder_R`
  - `Elbow_R`
  - `Wrist_Paw_R`
- **Left Hind Limb (3 bones):**
  - `Hip_L` (Femur / thigh)
  - `Knee_L` (Crus / shin)
  - `Ankle_Paw_L` (Planted rear-left pes)
- **Right Hind Limb (3 bones):**
  - `Hip_R`
  - `Knee_R`
  - `Ankle_Paw_R`

Total: **23 anatomical bones**, providing full independent articulation of all four limbs, multi-segment sinusoidal tail propulsion, spine curvature, and head orientation.

2. Calculates smooth, anatomically segmented skin weights (`JOINTS_0` and `WEIGHTS_0`) for all 13,192 vertices using bounded capsule line distances with distance-falloff smoothing.
3. Injects the skin, joints, and inverse bind matrices into a separate rigged asset `crocodile_rigged.glb` (preserving the original `crocodile.glb` unrigged file as a baseline).
4. Produces authentic skeletal clips or bone pose keyframes for validation in an inspection scene.

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
