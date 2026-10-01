# CROCY — Game Vision & Experience Specification
**Version:** 0.2 (The Living Swamp Update)  
**Authoritative Engine:** Three.js (r160+) / TypeScript / Vite  
**Deployment Target:** GitHub Pages (Static SPA)  
**Target Viewports:** Desktop (1080p / 60 FPS) and Mobile Landscape (Touch / 30-60 FPS)  

---

## 1. Identity & Objective
**CROCY** is a realistic, single-player, third-person saltwater crocodile (*Crocodylus porosus*) simulator set in an atmospheric Indo-Pacific mangrove swamp and estuarine river system.

The core design goal is **ecological immersion and authentic crocodilian movement**:
- The player experiences the natural world through the perspective of an apex reptilian predator.
- Movement must convey heavy mass, natural sprawling gait, buoyant transitions, and powerful sinusoidal tail-driven aquatic locomotion.
- The player is not a rigid hovercraft or vehicle skinned as an animal; the creature's spine, limbs, head, and tail must articulate realistically.

---

## 2. Visual Standards & Aesthetic Benchmark
- **Natural Tropical Estuary:** Murky brackish water, dark muddy tidal riverbanks, exposed mangrove stilt roots, sandbars, ferns, and driftwood.
- **Organic Atmosphere:** Humid tropical haze, natural sunlight filtered through foliage, and murky low-visibility underwater fog.
- **PBR Asset Integrity:** Strictly preserve high-detail geometry and photorealistic PBR textures from the authoritative repository inventory. Never substitute generic low-poly or stylized cartoon placeholders.
- **Living Dynamics:** Even when stationary, water shimmers and ripples, wildlife goes about natural routines, and vegetation sways gently.

---

## 3. Experience Scenarios (V0.2 Acceptance Standard)
1. **Leaving the Riverbank:** The crocodile walks across wet mud with alternating limb steps and lateral spine undulations. Shoreline crabs detect the approach and scuttle for cover.
2. **Entering the River:** The crocodile steps into shallow water. Gait transitions to buoyant wading; small surface disturbances ripple outward.
3. **Swimming:** In deep water, limbs tuck alongside the body; powerful rhythmic tail undulations propel the crocodile forward, trailing a V-shaped wake.
4. **Diving & Underwater Exploration:** The camera transitions into murky emerald depths; surface sounds muffle; suspended sediment particles become visible.
5. **Encountering Wildlife:** Schools of rice fish disperse in panic as the predator passes, regrouping once the disturbance subsides. Sleeper fish dart into the sediment.

---

## 4. Scope & Feature Boundaries

### Included in V0.2:
- Fully articulated crocodile animation system (idle breathing, terrestrial walk, wading, surface swim, submerged dive, steering flexion).
- Dynamic water interactions (displacement wakes, swimming ripples, water entry splashes, stable underwater fog).
- Habitat-aware reactive wildlife (schooling rice fish with boid cohesion/separation, riverbed sleeper fish, grounded shoreline crabs fleeing threats).
- Enhanced swamp environment (PBR terrain blending, denser mangrove groves, driftwood landmarks, optimized wind sway).
- Web audio foundation (environmental river and wind ambience, spatial water splashes, underwater low-pass filter).
- Desktop & mobile controls with robust touch joystick handling and telemetry HUD.

### Deliberately Excluded from V0.2:
- Combat, bite damage calculations, death rolls, and prey consumption (reserved for V0.3 Hunting Update).
- Territorial AI rival crocodiles and breeding mechanics.
- Large procedural chunk streaming or infinite map generation (the 240m handcrafted estuary provides optimal visual density and performance).
- Multiplayer or network synchronization.
