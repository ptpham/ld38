
import { vec2, mat2 } from 'gl-matrix';

var shifts = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]
  .map(x => vec2.fromValues(x[0], x[1]));

var _v2_0 = vec2.create();
var rot60 = mat2.fromRotation(mat2.create(), Math.PI/3);

export class HexGrid {
  constructor(scale, di) {
    this.scale = scale;
    this.di = vec2.clone(di);
    this.dj = HexGrid.rotate(vec2.create(), di);
  }

  center(result, i, j) {
    return HexGrid.center(result, this.scale, i, j, this.di, this.dj);
  }

  static rotate(result, di) {
    return vec2.transformMat2(result, di, rot60);
  }
  
  static center(result, scale, i, j, di, dj) {
    vec2.scale(result, di, scale*i);
    vec2.scale(_v2_0, dj, scale*j);
    return vec2.add(result, result, _v2_0);
  }

  static adjacent(result, i, j) {
    if (result == null) result = shifts.map(x => vec2.create());
    vec2.set(_v2_0, i, j);

    for (var i = 0; i < shifts.length; i++) {
      var current = result[i];
      vec2.add(current, current, _v2_0);
    }
    return result;
  }
}

