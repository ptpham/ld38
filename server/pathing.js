import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import cantorZ from '../common/pairing';
import HexGrid from '../common/hexgrid';
import { Tiles, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';

export const pathing = {
  indices: {},
  // cost matrix
  cMatrix: null,
  // adjacency matrix
  aMatrix: null,
  // distance matrix
  dMatrix: null
};

export function initialize() {
  const tiles = getTiles({ type: ROAD }).fetch();
  pathing.cMatrix = Matrix.ones(tiles.length, tiles.length);
  findDistances();
  return pathing;
}

export function addRoadToCostMatrix(index) {
  const cMatrix = pathing.cMatrix;
  cMatrix.addColumn(index, _.times(cMatrix.nRows, () => 1));
  cMatrix.addRow(index, _.times(cMatrix.nCols, () => 1));
}

export function getTiles(query = {}, options) {
  const gameId = getGameId();
  return Tiles.find(Object.assign({ gameId }, query), options);
}

export function getAllSegments() {
  return getTiles({ type: ROAD, paths: 2 });
}

export function getAllIntersections() {
  return getTiles({ type: ROAD, paths: { $in: [1, 3] } });
}

export function findDistances() {
  const tiles = getTiles({ type: ROAD }, { sort: { index: 1 } }).fetch();
  const aMatrix = Matrix.zeros(tiles.length, tiles.length);
  tiles.forEach((tile) => {
    const i = tile.index;
    const z = cantorZ(tile.x, tile.y);
    const adjIndices = _.chain(HexGrid.adjacents(null, tile.x, tile.y))
      .filter(([ax, ay]) => {
        const outOfBounds = ax < 0 || ay < 0;
        const az = cantorZ(ax, ay);
        return !outOfBounds && pathing.indices[az] != null;
      })
      .map(([ax, ay]) => pathing.indices[cantorZ(ax, ay)]);

    pathing.indices[z] = i;
    aMatrix.set(i, i, pathing.cMatrix[i, i]);
    adjIndices.forEach((ai) => {
      aMatrix.set(ai, i, pathing.cMatrix[i, ai]);
      aMatrix.set(i, ai, pathing.cMatrix[ai, i]);
    });
  });

  pathing.aMatrix = aMatrix;
  pathing.dMatrix = floydWarshall(aMatrix);
  return pathing;
}

export function findNextTile(x, y, x2, y2) {
  let next = null;

  const p1 = pathing.indices[cantorZ(x, y)];
  const p2 = pathing.indices[cantorZ(x2, y2)];
  const minD = pathing.dMatrix.get(p1, p2);
  if (minD === -1) return;

  const p1AdjRow = pathing.aMatrix.getRow(p1);
  for (let i = 0; i < p1AdjRow.length; i++) {
    const cost = p1AdjRow[i];
    const sumCost = cost + pathing.dMatrix.get(p1, i);
    if (sumCost === minD) {
      next = i;
      break;
    }
  }

  const gameId = getGameId();
  return Tiles.findOne({ gameId, type: ROAD, index: next });
}
