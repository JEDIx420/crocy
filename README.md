# 🐊 Saltwater Crocodile Simulator (V0.1)

A realistic single-player saltwater crocodile (*Crocodylus porosus*) simulator built with Three.js, TypeScript, and Vite, deployed live on GitHub Pages.

**Live Game URL:** [https://jedix420.github.io/crocy/](https://jedix420.github.io/crocy/)  
**Repository:** [https://github.com/JEDIx420/crocy](https://github.com/JEDIx420/crocy)

---

## 🎮 Overview & Core Features

- **Authoritative 3D Model:** Uses the high-detail crocodile model from the local repository inventory (`crocodile_high_quality.glb`), preserved with 100% geometric and texture fidelity and optimized for web delivery (3.8 MB). Scaled to a realistic adult saltwater crocodile length (~4.8 meters) with correct axis alignment.
- **Dynamic 4-State Locomotion Controller:**
  - `LAND`: Ground crawling / sprawling gait with belly waddle and slope alignment.
  - `WADING`: Transition state along muddy riverbanks where body is semi-buoyant and feet touch bed.
  - `SURFACE`: Floating on river surface with snout, eyes, and dorsal scutes exposed; sinusoidal lateral spine undulation.
  - `SUBMERGED`: Full 3D underwater navigation and diving with pitch and roll banking into turns.
- **Tropical Swamp & Mangrove River Environment:**
  - Organic heightmap with meandering deep river channel and gradual muddy shorelines.
  - Realistic brackish tropical water with depth fading and wave shimmer.
  - Dynamic atmospheric fog: soft humid swamp haze on surface, transitioning to murky deep emerald underwater fog.
  - Distributed mangrove trees, driftwood logs, and fern undergrowth.
- **Ambient Wildlife (V0.1 Scope):**
  - Schooling *Rice Fish* near surface waters with swim animations.
  - Bottom-dwelling *Dark Sleeper Fish* foraging along riverbed floor.
  - Shoreline *Crabs* with sideways patrol animation along mud banks.
- **Controls & Cross-Platform Support:**
  - **Desktop Keyboard & Mouse:**
    - `W` / `S` or `↑` / `↓`: Move Forward / Backward
    - `A` / `D` or `←` / `→`: Turn Left / Right
    - `Shift`: Sprint (Land) / Burst Swim (Water)
    - `C` / `Ctrl`: Dive Submerged
    - `Space` / `Q`: Surface / Ascend
  - **Mobile Touch Controls (Landscape):**
    - Virtual analog joystick for smooth directional movement & turning.
    - On-screen touch buttons for Sprint, Dive, and Surface.
- **Graphics Settings & Camera:**
  - Quality selector (`High`, `Medium`, `Low`) adjusting shadow maps and pixel ratio for smooth 60 FPS on any device.
  - Third-person follow camera with terrain collision avoidance to prevent clipping through the ground.

---

## 🧪 Testing & Verification

1. **Unit & Physics Tests:**
   - 10 automated Vitest unit tests covering state classification, forward velocity, heading, river transitions, dive limits, and asset path integrity.
2. **Automated Browser Smoke Tests:**
   - Headless Chromium (Playwright) tested on Desktop (1280x720) and Mobile Landscape (844x390).
   - Real render validation confirmed 60 FPS and zero unhandled errors.
3. **Live Production Smoke Test:**
   - Deployed bundle verified directly on `https://jedix420.github.io/crocy/` with successful asset loads and screenshots captured.

---

## ⚠️ Current Scope & Limitations (V0.1)

- **Hunting & Prey AI:** Hunting, predation, and biting mechanics are excluded from V0.1 per specification.
- **Audio:** Spatial audio and underwater muffled soundscapes planned for V0.2.
- **Multiplayer / Breeding:** Excluded from initial single-player core locomotion release.
