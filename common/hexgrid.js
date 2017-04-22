
import { vec2 } from 'gl-matrix';
var shifts = [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]]
  .map(x => vec2.fromValues(x[0], x[1]));

var _v2_0 = vec2.create();

export class HexGrid {
  static adjacent(i, j) {
    vec2.set(_v2_0, i, j);
    return shifts.map(x => {
      var result = vec2.clone(x);
      return vec2.add(result, result, _v2_0);
    });
  }
}

