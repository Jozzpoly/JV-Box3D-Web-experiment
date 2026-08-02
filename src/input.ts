export interface DriveInput {
  drive: number;
  steer: number;
  brake: boolean;
}

export class KeyboardInput {
  readonly drive: DriveInput = { drive: 0, steer: 0, brake: false };
  private readonly pressed = new Set<string>();
  private restartRequested = false;

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.pressed.add(event.code);
      if (event.code === 'KeyR' && !event.repeat) this.restartRequested = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => this.pressed.delete(event.code));
    window.addEventListener('blur', () => this.pressed.clear());
  }

  update(): DriveInput {
    const forward = this.isDown('KeyW', 'ArrowUp') ? 1 : 0;
    const reverse = this.isDown('KeyS', 'ArrowDown') ? 1 : 0;
    const left = this.isDown('KeyA', 'ArrowLeft') ? 1 : 0;
    const right = this.isDown('KeyD', 'ArrowRight') ? 1 : 0;
    this.drive.drive = forward - reverse;
    this.drive.steer = left - right;
    this.drive.brake = this.pressed.has('Space');
    return this.drive;
  }

  consumeRestart(): boolean {
    const value = this.restartRequested;
    this.restartRequested = false;
    return value;
  }

  private isDown(primary: string, alternate: string): boolean {
    return this.pressed.has(primary) || this.pressed.has(alternate);
  }
}
