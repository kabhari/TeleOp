export class CalibrationEvent {
  static VALIDITY_TIME = 10; // milliseconds
  quad: number;
  time: Date;
  constructor(quad: number) {
    this.quad = quad;
    this.time = new Date();
  }
  isValid(): boolean {
    return (
      new Date().getTime() - this.time.getTime() <
      CalibrationEvent.VALIDITY_TIME
    );
  }
}
