import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import { Tiles, ROAD, WORK, HOME } from '../common/tiles';
import { getGameId } from '../common/games';
import { cantorXY, cantorZ } from '../common/pairing';
import HexGrid from '../common/hexgrid';

export const pathing = {
  // cost matrix
  cMatrix: new Map(),
  mapDown: new Map(),
  mapUp: null,
  // distance matrix
  dMatrix: null
};

export function findDistances() {
  const tiles = Tiles.find({ gameId: getGameId(),
    type: { $in: [ROAD, WORK, HOME] } }).fetch();
  var { cMatrix } = pathing;

  var aMatrix = Matrix.zeros(tiles.length, tiles.length);
  var mapDown = new Map();
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
    const adjRoads = tile.paths.map(id => Tiles.findOne(id));
    aMatrix.set(i, i, 0);
    adjRoads.forEach((other) => {
      const ai = lookup(other.index);
      aMatrix.set(i, ai, cMatrix.get(cantorZ(tile.index, other.index)) || 1);
      aMatrix.set(ai, i, cMatrix.get(cantorZ(other.index, tile.index)) || 1);
    });
  });

  pathing.mapUp = mapUp;
  pathing.mapDown = mapDown;
  pathing.dMatrix = floydWarshall(aMatrix);
  return pathing;
}

export function findNextTile(x, y, xG, yG, xF, yF) {
  var { cMatrix, dMatrix, mapDown, mapUp } = pathing;

  let next = null;
  const start = mapDown.get(cantorZ(x, y));
  const goal = mapDown.get(cantorZ(xG, yG));

  if (start == null || goal == null) return;
  const min = dMatrix.get(start, goal);
  if (min === -1) return;

  var from = xF == null || yF == null ? null : cantorZ(xF, yF);
  for (var shift of HexGrid.shifts) {
    var adj = cantorZ(x + shift[0], y + shift[1]);
    if (from != null && from == adj) continue; // ignore where it came from
    var edgeCost = cMatrix.get(cantorZ(start, adj)) || 1;
    if (!mapDown.has(adj)) continue;
    var farCost = dMatrix.get(mapDown.get(adj), goal);
    if (farCost == -1) continue;
    const sumCost = edgeCost + farCost;
    if (sumCost == min) {
      next = Tiles.findOne({ gameId: getGameId(), index: adj});
      if (next != null) return next;
    }
  }
}
