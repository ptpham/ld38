
import { vec3, mat4 } from 'gl-matrix';

var _v3_0 = vec3.create();
var _v3_1 = vec3.create();
var rot90 = mat4.fromZRotation(mat4.create(), Math.PI/2);

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

    if (e.shiftKey) {
      this.camera.theta += deltaX / 100;
    } else {
      var forward = this.camera.forward(_v3_0);
      forward[2] = 0;

      var side = vec3.transformMat4(_v3_1, forward, rot90);
      vec3.scale(forward, forward, deltaY/(vec3.length(forward)*100));
      vec3.scale(side, side, deltaX/(vec3.length(side)*100));
      vec3.add(_v3_0, _v3_0, _v3_1);
      this.camera.translate(_v3_0);
    }
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

