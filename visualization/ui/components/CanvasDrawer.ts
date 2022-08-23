export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function getFillStyle(rgba: RGBA): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
}

export default class CanvasDrawer {
  ctx: CanvasRenderingContext2D;
  canvas_w = 500;
  canvas_h = 500;
  _padding = 10;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawCircle(
    x: number,
    y: number,
    radius: number,
    color?: string,
    label?: string
  ) {
    // draw the grid in the background
    this.ctx.moveTo(x, y);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (color) {
      this.ctx.fillStyle = color;
    }
    this.ctx.fill();
    this.ctx.closePath();
    if (label) {
      this.ctx.fillStyle = "black";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(label, x + 10, y + 10);
    }
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

  /* 
  How to call:--------------------------- 
      const quads = this.drawCalibrationQuads(['rgb(255, 0, 0, 0.2)', 'rgb(0, 255, 0, 0.2)', 'rgb(255, 255, 0, 0.2)', 'rgb(0, 0, 255, 0.2)'])
  
  Use case:------------------------------
      this.ctx.canvas.addEventListener('mouseup', (event) => {
          // Check whether point is inside each quad
          if (this.ctx.isPointInPath(quads[0], event.offsetX, event.offsetY)) {
            console.log("quad 1 is clicked")
          } else if (this.ctx.isPointInPath(quads[1], event.offsetX, event.offsetY)) {
            console.log("quad 2 is clicked")
          } else if (this.ctx.isPointInPath(quads[2], event.offsetX, event.offsetY)) {
            console.log("quad 3 is clicked")
          } else if (this.ctx.isPointInPath(quads[3], event.offsetX, event.offsetY)) {
            console.log("quad 4 is clicked")
          }
        })  
  */
  drawCalibrationQuads(
    color: Array<RGBA>,
    text?: Array<string>
  ): Array<Path2D> {
    let quad_one = new Path2D();
    let quad_two = new Path2D();
    let quad_three = new Path2D();
    let quad_four = new Path2D();
    this.ctx.font = "50px Arial";
    let counter = 0;

    // first quad
    quad_one.moveTo(this.canvas_w / 2, (3 * this.canvas_h) / 8);
    quad_one.quadraticCurveTo(
      this.canvas_w,
      this._padding,
      this.canvas_w / 2,
      this._padding
    );
    quad_one.quadraticCurveTo(
      0,
      this._padding,
      this.canvas_w / 2,
      (3 * this.canvas_h) / 8
    );
    this.ctx.fillStyle = getFillStyle(color[counter]);
    this.ctx.fill(quad_one);
    this.ctx.fillStyle = "black";
    counter++;
    this.ctx.fillText(
      text !== undefined ? text[0] : counter.toString(),
      this.canvas_w / 2 - 2 * this._padding,
      this.canvas_h / 5
    );

    // second quad
    quad_two.moveTo(this.canvas_w / 2, (5 * this.canvas_h) / 8);
    quad_two.quadraticCurveTo(
      this.canvas_w,
      this.canvas_h - this._padding,
      this.canvas_w / 2,
      this.canvas_h - this._padding
    );
    quad_two.quadraticCurveTo(
      0,
      this.canvas_h - this._padding,
      this.canvas_w / 2,
      (5 * this.canvas_h) / 8
    );
    this.ctx.fillStyle = getFillStyle(color[counter]);
    this.ctx.fill(quad_two);
    this.ctx.fillStyle = "black";
    counter++;
    this.ctx.fillText(
      text !== undefined ? text[1] : counter.toString(),
      this.canvas_w / 2 - 2 * this._padding,
      (9 * this.canvas_h) / 10 - this._padding
    );

    // third quad
    quad_three.moveTo((3 * this.canvas_w) / 8, this.canvas_h / 2);
    quad_three.quadraticCurveTo(
      this._padding,
      this.canvas_h,
      this._padding,
      this.canvas_h / 2
    );
    quad_three.quadraticCurveTo(
      this._padding,
      this._padding,
      (3 * this.canvas_w) / 8,
      this.canvas_h / 2
    );
    this.ctx.fillStyle = getFillStyle(color[counter]);
    this.ctx.fill(quad_three);
    this.ctx.fillStyle = "black";
    counter++;
    this.ctx.fillText(
      text !== undefined ? text[2] : counter.toString(),
      this.canvas_w / 5 - 2 * this._padding,
      this.canvas_h / 2 + this._padding
    );

    //fourth quad
    quad_four.moveTo((5 * this.canvas_w) / 8, this.canvas_h / 2);
    quad_four.quadraticCurveTo(
      this.canvas_w,
      this.canvas_h,
      this.canvas_w - this._padding,
      this.canvas_h / 2
    );
    quad_four.quadraticCurveTo(
      this.canvas_w,
      this._padding,
      (5 * this.canvas_w) / 8,
      this.canvas_h / 2
    );
    this.ctx.fillStyle = getFillStyle(color[counter]);
    this.ctx.fill(quad_four);
    this.ctx.fillStyle = "black";
    counter++;
    this.ctx.fillText(
      text !== undefined ? text[3] : counter.toString(),
      (9 * this.canvas_w) / 10 - 4 * this._padding,
      this.canvas_h / 2 + this._padding
    );

    return [quad_one, quad_two, quad_three, quad_four];
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid(this._padding, this.canvas_h, this.canvas_w);
  }
}
