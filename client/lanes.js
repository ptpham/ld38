
import HexGrid from '../common/hexgrid';
import { vec3, mat4, vec2 } from 'gl-matrix';
import _ from 'lodash';

var _v3_0 = vec3.create();

var SHIFT_Y = -0.7;
var SHIFT_X = 2;

export default class Lanes {
  static applyLaneTransform(result, orientation, leaving, carScale) {
    mat4.rotateZ(result, result, orientation*Math.PI/3);

    var sign = (leaving ? 1 : -1);
    vec3.set(_v3_0, sign*carScale, sign*carScale, carScale);
    mat4.scale(result, result, _v3_0);

    _v3_0[0] = leaving ? SHIFT_X : -SHIFT_X - 0.5;
    _v3_0[1] = SHIFT_Y;
    mat4.translate(result, result, _v3_0);
    return result;
  }
}

