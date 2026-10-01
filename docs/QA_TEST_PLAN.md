# CROCY — Quality Assurance & Testing Plan

## 1. Test Tiers

### A. Automated Unit & Logic Tests (Vitest)
- Run via: `npm run test`
- Scope:
  - Locomotion state transitions (`land`, `wading`, `surface`, `submerged`).
  - Speed calculation, heading integration, and boundary clamping.
  - Subterranean collision avoidance.
  - Asset path validity and Vite relative path configuration.
  - Wildlife habitat rules and bounds constraints.

### B. Automated Browser Smoke & Visual Tests (Playwright)
- Run via: `npx tsx src/test/smoke_test.ts`
- Scope:
  - Validates full Three.js scene initialization, WebGL context, and shaders.
  - Tests Desktop viewport (`1280x720`) and Mobile Touch Landscape viewport (`844x390`).
  - Simulates keyboard navigation and touch controls.
  - Captures high-resolution gameplay screenshots into `screenshots/`.
  - Asserts zero unhandled browser exceptions (`console.error` / `pageerror`).

### C. Live Production Deployment Verification
- Run via: `npx tsx src/test/verify_live.ts`
- Scope:
  - Validates live GitHub Pages HTTP 200 responses.
  - Verifies asset delivery over CDN.
  - Captures live production screenshots.

---

## 2. Performance Thresholds
| Platform | Target FPS | Minimum Acceptable FPS | Frame Time Budget |
| :--- | :---: | :---: | :---: |
| **Desktop (High Preset)** | 60 FPS | 55 FPS | 16.6 ms |
| **Desktop (Low Preset)** | 60 FPS | 60 FPS | 16.6 ms |
| **Mobile Landscape (Med Preset)**| 60 FPS | 30 FPS | 33.3 ms |

---

## 3. Manual Acceptance Scenarios (Per Phase)
Each phase delivery includes a step-by-step testing script for the user:
- Movement transitions (land → wading → swimming → diving → beaching).
- Camera behavior around steep riverbanks.
- Wildlife reaction upon direct approach.
- Graphics quality toggle responsiveness.
- Touch joystick fluidity on mobile devices.
