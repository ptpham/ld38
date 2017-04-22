
export class Control {
  constructor(camera) {
    this.camera = camera;
    this.mousedown = this.mousedown.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mouseup = this.mouseup.bind(this);
  }

  mousedown(e) {
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  mousemove(e) {
    if (this.lastX == null) return;
    var deltaX = this.lastX - e.clientX;
    var deltaY = this.lastY - e.clientY;
    this.camera.theta += deltaX / 100;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  mouseup(e) {
    delete this.lastX;
    delete this.lastY;
  }

  addListeners() {
    document.addEventListener('mousedown', this.mousedown);
    document.addEventListener('mousemove', this.mousemove);
    document.addEventListener('mouseup', this.mouseup);
  }
}

