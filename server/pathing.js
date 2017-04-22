import _ from 'lodash';
import Matrix from 'ml-matrix';
import floydWarshall from 'ml-floyd-warshall';
import cantorZ from '../common/pairing';
import HexGrid from '../common/hexgrid';
import { Tiles, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';

export const pathing = {
  indices: {},
  aMatrix: null,
  dMatrix: null
};

export function getTiles(query = {}) {
  const gameId = getGameId();
  return Tiles.find(Object.assign({ gameId }, query));
}

export function getAllSegments() {
  return getTiles({ type: ROAD, paths: 2 });
}

export function getAllIntersections() {
  return getTiles({ type: ROAD, paths: { $in: [1, 3] } });
}

export function findDistances() {
  const tiles = getTiles({ type: ROAD }).fetch();
  const aMatrix = Matrix.ones(tiles.length, tiles.length).neg();
  tiles.forEach((tile, i) => {
    const z = cantorZ(tile.x, tile.y);
    const adjIndices = _.chain(HexGrid.adjacents(null, tile.x, tile.y))
      .filter(([ax, ay]) => {
        const outOfBounds = ax < 0 || ay < 0;
        const az = cantorZ(ax, ay);
        return !outOfBounds && pathing.indices[az] != null;
      })
      .map(([ax, ay]) => pathing.indices[cantorZ(ax, ay)]);

    pathing.indices[z] = i;
    aMatrix.set(i, i, 0);
    adjIndices.forEach((ai) => {
      aMatrix.set(ai, i , 1);
      aMatrix.set(i, ai , 1);
    });
  });

  pathing.aMatrix = aMatrix;
  pathing.dMatrix = floydWarshall(aMatrix);
  return pathing;
}
