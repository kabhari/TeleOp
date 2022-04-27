export default class CanvasDrawer {
  ctx: CanvasRenderingContext2D;
  canvas_w = 500;
  canvas_h = 500;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  drawCircle(x: number, y: number, radius: number) {
    this.ctx.moveTo(x, y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }
  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }
}
