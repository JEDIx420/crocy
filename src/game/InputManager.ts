import { CrocInputState } from './CrocodileTypes';

export class InputManager {
  private inputState: CrocInputState = {
    forward: 0,
    turn: 0,
    dive: 0,
    sprint: false
  };

  private keys: Record<string, boolean> = {};

  // Touch joystick tracking
  private touchActive: boolean = false;
  private touchStartPos: { x: number; y: number } = { x: 0, y: 0 };
  private touchCurrentPos: { x: number; y: number } = { x: 0, y: 0 };
  private maxJoystickRadius: number = 50;

  // Touch dive buttons
  public touchDiveDown: boolean = false;
  public touchDiveUp: boolean = false;
  public touchSprint: boolean = false;

  constructor() {
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  private setupTouch() {
    // Joystick container logic will be handled or linked via DOM
  }

  public bindJoystick(element: HTMLElement) {
    element.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      this.touchActive = true;
      const rect = element.getBoundingClientRect();
      this.touchStartPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };
      this.updateTouchVector();
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.touchActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.touchCurrentPos = { x: touch.clientX, y: touch.clientY };
        this.updateTouchVector();
        break;
      }
    }, { passive: false });

    const endTouch = () => {
      this.touchActive = false;
      this.inputState.forward = 0;
      this.inputState.turn = 0;
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }

  private updateTouchVector() {
    const dx = this.touchCurrentPos.x - this.touchStartPos.x;
    const dy = this.touchCurrentPos.y - this.touchStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      this.inputState.forward = 0;
      this.inputState.turn = 0;
      return;
    }

    const clampedDist = Math.min(dist, this.maxJoystickRadius);
    const normalizedDist = clampedDist / this.maxJoystickRadius;
    const angle = Math.atan2(dy, dx);

    // X is turn (-1 left, +1 right)
    // Y is forward (-1 is down/backward, +1 is up/forward)
    this.inputState.turn = Math.cos(angle) * normalizedDist;
    this.inputState.forward = -Math.sin(angle) * normalizedDist;
  }

  public getState(): CrocInputState {
    // Keyboard takes effect if active
    let f = 0;
    let t = 0;
    let d = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) f += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) f -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) t -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) t += 1;

    // Dive down: C or Ctrl or Space(dive) / PageDown
    if (this.keys['KeyC'] || this.keys['ControlLeft'] || this.keys['KeyE']) d += 1; // dive down
    // Surface / ascend: Space or Q
    if (this.keys['Space'] || this.keys['KeyQ']) d -= 1; // ascend / surface

    const sprint = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchSprint);

    // Merge touch if touch active
    if (this.touchActive) {
      f = this.inputState.forward;
      t = this.inputState.turn;
    }

    if (this.touchDiveDown) d += 1;
    if (this.touchDiveUp) d -= 1;

    return {
      forward: Math.max(-1, Math.min(1, f)),
      turn: Math.max(-1, Math.min(1, t)),
      dive: Math.max(-1, Math.min(1, d)),
      sprint: sprint
    };
  }
}
