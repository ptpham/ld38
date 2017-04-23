import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import { Tiles, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';

export const pathing = {
  // cost matrix
  cMatrix: Matrix.ones(1, 1),
  // adjacency matrix
  aMatrix: null,
  // distance matrix
  dMatrix: null
};

export function addRoadToCostMatrix(index) {
  if (index === 0) return; // skip first row / col
  const cMatrix = pathing.cMatrix;
  cMatrix.addColumn(index, Matrix.rowVector(_.times(cMatrix.rows, () => 1)));
  cMatrix.addRow(index, Matrix.rowVector(_.times(cMatrix.columns, () => 1)));
}

export function getRoad(query = {}) {
  const gameId = getGameId();
  return Tiles.findOne(Object.assign({ type: ROAD, gameId }, query));
}

export function getRoads(query = {}) {
  const gameId = getGameId();
  return Tiles.find(
    Object.assign({ type: ROAD, gameId }, query),
    { sort: { index: 1 } }
  );
}

export function findDistances() {
  const tiles = getRoads().fetch();
  const aMatrix = Matrix.zeros(tiles.length, tiles.length);
  tiles.forEach((tile) => {
    const i = tile.index;
    const adjRoads = tile.paths.map(id => Tiles.findOne(id));
    aMatrix.set(i, i, pathing.cMatrix.get(i, i));
    adjRoads.forEach((tile) => {
      const ai = tile.index;
      aMatrix.set(i, ai, pathing.cMatrix.get(i, ai));
      aMatrix.set(ai, i, pathing.cMatrix.get(ai, i));
    });
  });

  pathing.aMatrix = aMatrix;
  pathing.dMatrix = floydWarshall(aMatrix);
  return pathing;
}

export function findNextTile(x, y, xG, yG, xF, yF) {
  let next = null;
  const start = getRoad({ x, y }).index;
  const goal = getRoad({ x: xG, y: yG }).index;
  const from = getRoad({ x: xF, y: yF }).index;
  const min = pathing.dMatrix.get(start, goal);
  if (min === -1) return;

  const startAdjRow = pathing.aMatrix.getRow(start);
  for (let adj = 0; adj < startAdjRow.length; adj++) {
    if (from === adj) continue; // ignore where it came from
    const sumCost = startAdjRow[adj] + pathing.dMatrix.get(adj, goal);
    if (sumCost === min) {
      next = adj;
      break;
    }
  }

  return getRoad({ index: next });
}
