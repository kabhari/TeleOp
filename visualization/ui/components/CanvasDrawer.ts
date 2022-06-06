export default class CanvasDrawer {
  ctx: CanvasRenderingContext2D;
  canvas_w = 500;
  canvas_h = 500;
  _padding = 10;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawCircle(x: number, y: number, radius: number) {
    // draw the grid in the background
    this.ctx.moveTo(x, y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawGrid(_padding: number, _height: number, _width: number) {
    for (var x = 0; x <= _width; x += 10) {
      this.ctx.moveTo(x + _padding, _padding);
      this.ctx.lineTo(x + _padding, _height - _padding);
    }
    for (var x = 0; x <= _height; x += 10) {
      this.ctx.moveTo(_padding, x + _padding);
      this.ctx.lineTo(_width - _padding, x + _padding);
    }
    this.ctx.strokeStyle = "linen";
    this.ctx.stroke();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid(this._padding, this.canvas_h, this.canvas_w);
  }
}
