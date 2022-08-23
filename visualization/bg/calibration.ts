export class CalibrationEvent {
  static VALIDITY_TIME = 100; // milliseconds
  quad: number;
  time: Date;
  isResolved: boolean;
  constructor(quad: number) {
    this.quad = quad;
    this.time = new Date();
    this.isResolved = false;
  }
  isValid(): boolean {
    return (
      new Date().getTime() - this.time.getTime() <
      CalibrationEvent.VALIDITY_TIME
    );
  }
}
