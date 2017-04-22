import _ from 'lodash';
import { Tiles, TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import HexGrid from '../common/hexgrid';
import { addRoadToCostMatrix } from './pathing';
import { createLight } from './lighting';

export function build({ x, y, type, paths = null, index = null }) {
  const gameId = getGameId();
  return Tiles.upsert({ x, y, gameId }, { $set: { type, paths, index } });
}

let roadIndex = 0;
export function buildRoad(x, y) {
  const gameId = getGameId();
  let maxAdjacentRoads = false;
  let paths = [];
  let adjacentTiles = [];
  HexGrid.adjacent(null, x, y)
    .forEach(([ax, ay]) => {
      const tile = Tiles.findOne({ x: ax, y: ay, type: ROAD, gameId });
      if (tile) {
        adjacentTiles.push(tile);
        paths.push(tile._id);
        maxAdjacentRoads = maxAdjacentRoads || tile.paths.length >= 3;
      }
    });
  if (maxAdjacentRoads || paths.length > 3) return;

  const index = roadIndex;
  build({ x, y, type: ROAD, paths, index });

  const newRoad = Tiles.findOne({ x, y, type: ROAD, gameId });
  if (newRoad) {
    roadIndex += 1;
    addRoadToCostMatrix(index);
    adjacentTiles.forEach(tile => {
      tile.paths.push(newRoad._id);
      const adjId = build({
        x: tile.x,
        y: tile.y,
        type: tile.type,
        index: tile.index,
        paths: tile.paths
      });

      if (tile.paths.length === 3) createLight({ tileId: adjId, open: [0, 1] });
    });
  }

  return newRoad;
}

export function buildHome(x, y) {
  return build(x, y, HOME);
}

export function buildWork(x, y) {
  return build(x, y, WORK);
}

export function generateMap(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (i + j === 0 || i + j === height + width - 2) continue;
      build({ x: j, y: i, type: _.sample(possibleTypes) });
    }
  }

  // generate roads
  const center = [Math.ceil(width / 2) - 1, Math.ceil(height / 2) - 1];
  buildRoad(center[0], center[1]);
  if (width > 5 && height > 5) {
    buildRoad(center[0] + 1, center[1]);
    buildRoad(center[0], center[1] - 1);
    buildRoad(center[0] - 1, center[1] + 1);
  }
  return Tiles;
}
