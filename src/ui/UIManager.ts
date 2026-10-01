import { GameEngine, QualitySetting } from '../game/GameEngine';

export class UIManager {
  private engine: GameEngine;
  private container: HTMLElement;
  private hudElement: HTMLElement;
  private joystickElement: HTMLElement;
  private diveControlsElement: HTMLElement;
  private instructionsElement: HTMLElement;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.container = document.body;

    this.hudElement = this.createHUD();
    this.instructionsElement = this.createInstructions();
    this.joystickElement = this.createTouchJoystick();
    this.diveControlsElement = this.createTouchDiveControls();

    this.container.appendChild(this.hudElement);
    this.container.appendChild(this.instructionsElement);
    this.container.appendChild(this.joystickElement);
    this.container.appendChild(this.diveControlsElement);

    // Bind touch events
    this.engine.input.bindJoystick(this.joystickElement);

    // Attach status listener
    this.engine.onStatusUpdate = (status) => {
      this.updateHUD(status);
    };

    // Detect mobile touch
    this.checkTouchEnvironment();
  }

  private checkTouchEnvironment() {
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) {
      this.joystickElement.style.display = 'block';
      this.diveControlsElement.style.display = 'flex';
      this.instructionsElement.style.display = 'none'; // Keep screen clean on mobile
    }
  }

  private createHUD(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'croc-hud';
    el.innerHTML = `
      <div class="hud-panel">
        <div class="hud-row"><span class="hud-label">STATE:</span> <span id="hud-state" class="hud-val state-tag">LAND</span></div>
        <div class="hud-row"><span class="hud-label">SPEED:</span> <span id="hud-speed" class="hud-val">0.0 m/s</span></div>
        <div class="hud-row"><span class="hud-label">DEPTH:</span> <span id="hud-depth" class="hud-val">0.0 m</span></div>
        <div class="hud-row"><span class="hud-label">FPS:</span> <span id="hud-fps" class="hud-val">60</span></div>
      </div>
      <div class="hud-controls">
        <select id="quality-selector">
          <option value="high">Quality: High</option>
          <option value="medium">Quality: Medium</option>
          <option value="low">Quality: Low</option>
        </select>
      </div>
    `;

    const selector = el.querySelector('#quality-selector') as HTMLSelectElement;
    selector.addEventListener('change', (e) => {
      const q = (e.target as HTMLSelectElement).value as QualitySetting;
      this.engine.setQuality(q);
    });

    return el;
  }

  private createInstructions(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'croc-instructions';
    el.innerHTML = `
      <div class="instruct-card">
        <h3>🐊 Saltwater Crocodile Simulator</h3>
        <ul>
          <li><b>W / S</b> or <b>↑ / ↓</b>: Move Forward / Backward</li>
          <li><b>A / D</b> or <b>← / →</b>: Turn Left / Right</li>
          <li><b>Shift</b>: Sprint (Land) / Burst Swim (Water)</li>
          <li><b>C / Ctrl</b>: Dive Submerged</li>
          <li><b>Space / Q</b>: Surface / Ascend</li>
        </ul>
        <p class="hint">Walk down the muddy riverbank into the channel to swim and dive!</p>
      </div>
    `;
    return el;
  }

  private createTouchJoystick(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'touch-joystick';
    el.innerHTML = `<div class="joystick-knob"></div>`;
    return el;
  }

  private createTouchDiveControls(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'touch-action-buttons';
    el.innerHTML = `
      <button id="btn-sprint" class="touch-btn">⚡ SPRINT</button>
      <button id="btn-surface" class="touch-btn">▲ SURFACE</button>
      <button id="btn-dive" class="touch-btn">▼ DIVE</button>
    `;

    const btnSprint = el.querySelector('#btn-sprint') as HTMLButtonElement;
    const btnSurface = el.querySelector('#btn-surface') as HTMLButtonElement;
    const btnDive = el.querySelector('#btn-dive') as HTMLButtonElement;

    // Sprint
    btnSprint.addEventListener('touchstart', (e) => { e.preventDefault(); this.engine.input.touchSprint = true; });
    btnSprint.addEventListener('touchend', (e) => { e.preventDefault(); this.engine.input.touchSprint = false; });

    // Surface
    btnSurface.addEventListener('touchstart', (e) => { e.preventDefault(); this.engine.input.touchDiveUp = true; });
    btnSurface.addEventListener('touchend', (e) => { e.preventDefault(); this.engine.input.touchDiveUp = false; });

    // Dive
    btnDive.addEventListener('touchstart', (e) => { e.preventDefault(); this.engine.input.touchDiveDown = true; });
    btnDive.addEventListener('touchend', (e) => { e.preventDefault(); this.engine.input.touchDiveDown = false; });

    return el;
  }

  private updateHUD(status: { state: string; speed: number; depth: number; fps: number; underwater: boolean }) {
    const stateEl = document.getElementById('hud-state');
    const speedEl = document.getElementById('hud-speed');
    const depthEl = document.getElementById('hud-depth');
    const fpsEl = document.getElementById('hud-fps');

    if (stateEl) {
      stateEl.innerText = status.state.toUpperCase();
      stateEl.className = `hud-val state-tag state-${status.state}`;
    }
    if (speedEl) {
      speedEl.innerText = `${status.speed.toFixed(1)} m/s`;
    }
    if (depthEl) {
      depthEl.innerText = `${status.depth.toFixed(1)} m`;
    }
    if (fpsEl) {
      fpsEl.innerText = `${status.fps}`;
    }
  }
}
