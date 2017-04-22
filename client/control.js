
import { vec3, mat4 } from 'gl-matrix';

var _v3_0 = vec3.create();
var _v3_1 = vec3.create();
var rot90 = mat4.fromZRotation(mat4.create(), Math.PI/2);

export class Control {
  constructor(renderer) {
    this.renderer = renderer;
    this.camera = renderer.camera;
    this.hexgrid = renderer.hexgrid;
    this.mousedown = this.mousedown.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mouseup = this.mouseup.bind(this);
    this.mouseWorld = vec3.create();
    this.mouseScreen = vec3.create();
    this.invview = mat4.create();
    this.invproj = mat4.create();
    this.invcam = mat4.create();
  }

  screenToHex(clientX, clientY) {
    var invproj = mat4.invert(this.invproj, this.renderer.projection);
    var invview = mat4.invert(this.invview, this.renderer.view);
    var invcam = mat4.multiply(this.invcam, invview, invproj);

    var widthX = document.body.offsetWidth;
    var heightY = document.body.offsetHeight;
    vec3.set(this.mouseScreen, 2*clientX/widthX-1, -2*clientY/heightY+1, -1);
    vec3.transformMat4(this.mouseWorld, this.mouseScreen, invcam);

    var eye = this.camera._eye;
    vec3.sub(_v3_0, this.mouseWorld, eye);
    var t = -eye[2] / _v3_0[2];
    var x = eye[0] + t*_v3_0[0];
    var y = eye[1] + t*_v3_0[1];
    
    return this.hexgrid.lookup(_v3_1, x, y);
  }

  mousedown(e) {
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  mousemove(e) {
    this.renderer.highlight = this.screenToHex(e.clientX, e.clientY);
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

