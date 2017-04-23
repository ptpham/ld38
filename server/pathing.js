import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import { Tiles, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import { cantorXY, cantorZ } from '../common/pairing';
import { HexGrid } from '../common/hexgrid';

export const pathing = {
  // cost matrix
  cMatrix: new Map(),
  mapDown: new Map(),
  mapUp: null,
  // distance matrix
  dMatrix: null
};

export function findDistances() {
  const tiles = Tiles.find({ gameId: getGameId() }).fetch();
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
  pathing.dMatrix = floydWarshall(aMatrix);
  return pathing;
}

export function findNextTile(x, y, xG, yG, xF, yF) {
  var { cMatrix, dMatrix, mapDown, mapUp } = pathing;

  let next = null;
  const start = mapDown.get(cantorZ(x, y));
  const goal = mapDown.get(cantorZ(xG, yG));
  if (start == null || goal == null) return;

  const from = mapDown.get(cantorZ(xF, yF));
  const min = dMatrix.get(start, goal);
  if (min === -1) return;

  for (var shift of HexGrid.shifts) {
    var adj = mapDown.get(cantorZ(x + shift[0], y + shift[1]));
    if (adj == null || from === adj) continue; // ignore where it came from
    const sumCost = cMatrix.get(adj) + dMatrix.get(adj, goal);
    if (sumCost === min) {
      next = mapUp.get(adj);
      break;
    }
  }

  return Tiles.findOne({ gameId: getGameId(), index: next });
}
