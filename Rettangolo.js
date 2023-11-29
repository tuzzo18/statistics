"use strict";

class Rettangolo {

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  left() {
    return this.x
  }

  top() {
    return this.y
  }

  right() {
    return this.x + this.width
  }

  bottom() {
    return this.y + this.height
  }

  aspectRatio() {
    return this.width / this.height || 1
    //converto Nan a 1
  }


  disegnaRettangolo(ctx, Colore, Spessore, lineDash) {

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = Colore;
    ctx.lineWidth = Spessore;
    ctx.setLineDash(lineDash);
    ctx.stroke();
    ctx.restore()

  }

}

