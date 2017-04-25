
import HexGrid from '../common/hexgrid';
import { vec3, mat4, vec2 } from 'gl-matrix';
import _ from 'lodash';

var _v3_0 = vec3.create();
var _m4_0 = mat4.create();

var SHIFT_Y = -0.7;
var SHIFT_X = 2;

export default class Lanes {
  constructor(hexgrid, carScale) {
    this.lastTransforms = new Map();
    this.carScale = carScale;
    this.hexgrid = hexgrid;
  }

  applyLaneTransform(result, id, hx, hy, orientation, leaving) {
    this.hexgrid.center(_v3_0, hx, hy);
    mat4.fromTranslation(result, _v3_0);
    Lanes.applyLaneTransform(result, orientation, leaving, this.carScale);

    var last = this.lastTransforms.get(id);
    if (last == null) {
      last = mat4.clone(result);
      this.lastTransforms.set(id, last);
    } else {
      var alpha = 0.1;
      mat4.multiplyScalar(last, last, 1 - alpha);
      mat4.multiplyScalar(result, result, alpha);
      mat4.add(last, last, result);
      mat4.copy(result, last);
    }
    return result;
  }

  static applyLaneTransform(result, orientation, leaving, carScale) {
    mat4.rotateZ(result, result, orientation*Math.PI/3);

    var sign = (leaving ? 1 : -1);
    vec3.set(_v3_0, sign*carScale, sign*carScale, carScale);
    mat4.scale(result, result, _v3_0);

    _v3_0[0] = leaving ? SHIFT_X : -SHIFT_X - 0.5;
    _v3_0[1] = SHIFT_Y;
    _v3_0[2] = 0;
    mat4.translate(result, result, _v3_0);
    return result;
  }
}

