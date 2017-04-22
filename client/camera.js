
var { vec3, mat4 } = require('gl-matrix');

export class Camera {
  constructor(center, theta, phi, radius) {
    radius = radius || 1;

    this._up = vec3.fromValues(0,0,1);
    this._center = center || vec3.create();
    this._radius = radius || 1;
    this._theta = theta || 0;
    this._phi = phi || 0;

    this._eye = vec3.create();
    this._recompute();
  }

  get radius() { return this._radius; }
  get theta() { return this._theta; }
  get phi() { return this._phi; }

  set radius(value) { this._radius = value; }
  set theta(value) { this._theta = value; }
  set phi(value) {
    this._phi = Math.min(Math.max(value, -Math.PI/2 + 0.1), Math.PI/2 - 0.1);
  }

  translate(v) {
    vec3.add(this._center, this._center, v);
    vec3.add(this._eye, this._eye, v);
  }

  forward(out) {
    return vec3.sub(out, this._center, this._eye);
  }

  _recompute() {
    vec3.set(this._eye, this._radius, 0, 0);
    vec3.add(this._eye, this._eye, this._center);
    vec3.rotateY(this._eye, this._eye, this._center, -this._phi);
    vec3.rotateZ(this._eye, this._eye, this._center, this._theta);
  }

  view(out) {
    this._recompute();
    return mat4.lookAt(out, this._eye, this._center, this._up);
  }
}

module.exports = Camera;

