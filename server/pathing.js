import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import { Tiles, ROAD, WORK, HOME } from '../common/tiles';
import { getGameId } from './games';
import { cantorXY, cantorZ } from '../common/pairing';
import HexGrid from '../common/hexgrid';

export const pathing = { };

export function resetPathingState() {
  pathing.cMatrix = new Map();
  pathing.cMatrixSaved = new Map();
  pathing.traversable = new Set();
  pathing.mapDown = new Map();
  pathing.mapUp = null;
  pathing.dMatrix = null;
}
resetPathingState();

export function updateCMatrix(x0, y0, x1, y1, time) {
  var z0 = cantorZ(x0, y0);
  var z1 = cantorZ(x1, y1);
  var entry = cantorZ(z0, z1);
  var { cMatrix } = pathing;
  current = cMatrix.get(entry) || 1;
  var alpha = 0.1;
  var averaged = current*(1 - alpha) + alpha*time;
  cMatrix.set(entry, averaged);
}

export function findDistances() {
  const tiles = Tiles.find({ gameId: getGameId(),
    type: { $in: [ROAD, WORK, HOME] } }).fetch();
  var { cMatrix } = pathing;

  if (tiles.length == 0) return pathing;
  var aMatrix = Matrix.from1DArray(tiles.length, tiles.length,
    _.times(tiles.length*tiles.length, () => Infinity));
  var mapDown = new Map();
  var traversable = new Set();
  var mapUp = [];

  function lookup(z) {
    if (!mapDown.has(z)) {
      mapUp[mapDown.size] = z;
      mapDown.set(z, mapDown.size);
    }
    return mapDown.get(z);
  }

  tiles.forEach((tile) => {
    const i = lookup(tile.index);
    const adjRoads = (tile.paths || []).map(id => Tiles.findOne(id));
    aMatrix.set(i, i, 0);
    adjRoads.forEach((other) => {
      const ai = lookup(other.index);
      aMatrix.set(i, ai, cMatrix.get(cantorZ(tile.index, other.index)) || 1);
      traversable.add(cantorZ(i, ai));
    });
  });

  pathing.mapUp = mapUp;
  pathing.mapDown = mapDown;
  pathing.dMatrix = floydWarshall(aMatrix);
  pathing.traversable = traversable;
  pathing.cMatrixSaved = _.cloneDeep(cMatrix);
  return pathing;
}

export function findNextTile(x, y, xG, yG, xF, yF) {
  var { cMatrixSaved, dMatrix, mapDown, mapUp, traversable } = pathing;

  let next = null;
  const start = mapDown.get(cantorZ(x, y));
  const goal = mapDown.get(cantorZ(xG, yG));

  if (start == null || goal == null) return;
  const min = dMatrix.get(start, goal);
  if (min === -1) return;

  var best = Infinity, found = null;
  var from = xF == null || yF == null ? null : cantorZ(xF, yF);
  for (var shift of HexGrid.shifts) {
    var adj = cantorZ(x + shift[0], y + shift[1]);
    if (from != null && from == adj) continue; // ignore where it came from
    var edgeCost = cMatrixSaved.get(cantorZ(start, adj)) || 1;
    if (!mapDown.has(adj)) continue;
    var adjDown = mapDown.get(adj);
    if (!traversable.has(cantorZ(start, adjDown))) continue;
    var farCost = dMatrix.get(adjDown, goal);
    if (farCost == -1) continue;
    const sumCost = edgeCost + farCost;
    if (sumCost < best) {
      best = sumCost;
      found = adj;
    }
  }

  if (found != null) return Tiles.findOne({ gameId: getGameId(), index: found });
}
