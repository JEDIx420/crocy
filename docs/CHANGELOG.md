# CROCY — Changelog

All notable changes to the CROCY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0-phase0] - 2026-10-01
### Added
- Created dedicated development branch `v0.2-living-swamp`.
- Comprehensive Phase 0 documentation suite:
  - `docs/GAME_VISION.md`: Game pillars, aesthetics, acceptance scenarios, and scope boundaries.
  - `docs/ARCHITECTURE.md`: Module decomposition, game-loop execution sequence, and coordinate conventions.
  - `docs/ASSET_INVENTORY.md`: Verified audit of all models, textures, vertex counts, and rigging status.
  - `docs/ANIMATION_SPEC.md`: Rigging blueprint and gait kinematics plan for unrigged crocodile sculpt.
  - `docs/WATER_SYSTEM.md`: Wave simulation, ripple ring buffer, wake generation, and underwater rendering design.
  - `docs/WILDLIFE_SYSTEM.md`: Boid schooling, threat detection states, and habitat constraint design.
  - `docs/ROADMAP.md`: Phase progression tracking and strict single-phase approval rules.
  - `docs/QA_TEST_PLAN.md`: Vitest, Playwright, and manual verification protocols.
- Baseline screenshot captures organized in `screenshots/phase0/`:
  - `baseline_land_idle.png`: Stationary idle posture on riverbank.
  - `baseline_land_moving.png`: Terrestrial locomotion.
  - `baseline_mobile.png`: Mobile landscape viewport with virtual joystick and action buttons.
  - `baseline_live_production.png`: Live deployed build on GitHub Pages.

### Verified & Audited
- Audited authoritative crocodile model (`public/assets/crocodile.glb`): confirmed 13,192 vertices, 22,154 triangles, 100% geometry and 2k PBR textures preserved, 0 bones / 0 skins (sculpt asset requiring skeletal rigging in Phase 1).
- Vitest automated test suite passing (10 tests, 0 failures).
- Production build passing (`tsc && vite build` clean).
- Live deployment running on GitHub Pages (`https://jedix420.github.io/crocy/`).

---

## [0.1.0] - 2026-10-01
### Added
- Initial single-player saltwater crocodile prototype with Three.js, TypeScript, and Vite.
- Authoritative high-quality crocodile model optimized for browser delivery (3.75 MB).
- 4-state locomotion controller (`land`, `wading`, `surface`, `submerged`).
- Procedural swamp heightmap with river channel, mangroves, driftwood, and ferns.
- Ambient wildlife: animated rice fish, sleeper fish, and mudbank crabs.
- Dual control support: Desktop keyboard/mouse + Mobile landscape touch joystick.
- GitHub Pages CI/CD automated deployment workflow.
