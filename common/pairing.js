export function cantorZ(x, y) {
  return ((x + y) * (x + y + 1)) / 2 + y;
}

export function cantorXY(z) {
  var t = Math.floor((-1 + Math.sqrt(1 + 8 * z))/2);
  var x = t * (t + 3) / 2 - z;
  var y = z - t * (t + 1) / 2;
  return [x, y];
}
