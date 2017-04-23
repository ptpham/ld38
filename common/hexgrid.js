
import { vec2, vec3, mat2 } from 'gl-matrix';
import _ from 'lodash';

var shifts = [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]]
  .map(x => vec2.fromValues(x[0], x[1]));

var _v2_0 = vec2.create();
var _v2_1 = vec2.create();
var _v2_2 = vec2.create();
var rot60 = mat2.fromRotation(mat2.create(), Math.PI/3);
var sec30 = 1/Math.cos(Math.PI/6);
var tan30 = Math.tan(Math.PI/6);
var _adjacents = shifts.map(x => vec2.create());

export default class HexGrid {
  constructor(di) {
    this.scale = vec2.length(di);
    this.di = vec2.clone(di);
    vec2.normalize(this.di, this.di);
    this.dj = HexGrid.rotate(vec2.create(), this.di);
  }

  center(result, i, j) {
    return HexGrid.center(result, this.scale, i, j, this.di, this.dj);
  }

  lookup(result, x, y) {
    return HexGrid.lookup(result, this.scale, x, y, this.di, this.dj);
  }

  static lookup(result, scale, x, y, di, dj) {
    var point = vec2.set(_v2_1, x, y);
    var pi = vec2.dot(di, point)/scale;
    var pio = Math.sqrt(Math.max(vec2.squaredLength(point)/(scale*scale)- pi*pi, 0));
    var iamt = pi - tan30*pio;
    var jamt = sec30*pio;
    
    var it = Math.floor(iamt + 0.5);
    var jt = Math.floor(jamt + 0.5);

    vec2.set(result, it, jt);
    var center = HexGrid.center(_v2_2, scale, it, jt, di, dj);
    var bestDistance = vec2.distance(center, point), best = result;
    HexGrid.adjacent(_adjacents, it, jt);
    for (var i = 0; i < _adjacents.length; i++) {
      var adj = _adjacents[i];
      var center = HexGrid.center(_v2_2, scale, adj[0], adj[1], di, dj);
      var distance = vec2.distance(center, point);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = adj;
      }
    }

    return vec2.copy(result, best);
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

    for (var k = 0; k < shifts.length; k++) {
      var current = result[k];
      vec2.add(current, shifts[k], _v2_0);
    }
    return result;
  }

  static adjacentByOrientation(result, i, j, orientation) {
    vec2.set(_v2_0, i, j);
    return vec2.add(result, shifts[orientation], _v2_0);
  }

  static orientation(i0, j0, i1, j1) {
    var di = i1 - i0;
    var dj = j1 - j0;
    if (di == 1) {
      if (dj == -1) return 5;
      else if (dj == 0) return 0;
    } else if (di == 0) {
      if (dj == -1) return 4;
      else if (dj == 1) return 1;
    } else if (di == -1) {
      if (dj == 0) return 3;
      else if (dj == 1) return 2;
    }
  }

  static opposite(orientation) {
    return (orientation + 3) % 6;
  }

  static get shifts() { return shifts; }
}

