import _ from 'lodash';
import { Tiles, TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import HexGrid from '../common/hexgrid';
import { addRoadToCostMatrix } from './pathing';

export function build({ x, y, type, paths = null, index = null }) {
  const gameId = getGameId();
  return Tiles.upsert({ x, y, gameId }, { $set: { type, paths, index } });
}

let roadIndex = 0;
export function buildRoad(x, y) {
  const gameId = getGameId();
  let maxAdjacentRoads = false;
  let paths = 0;
  let adjacentTiles = [];
  HexGrid.adjacent(null, x, y)
    .forEach(([ax, ay]) => {
      const tile = Tiles.findOne({ x: ax, y: ay, type: ROAD, gameId });
      if (tile) {
        adjacentTiles.push(tile);
        paths += 1;
        maxAdjacentRoads = maxAdjacentRoads || tile.paths >= 3;
      }
    });
  if (maxAdjacentRoads || paths > 3) return;

  const index = roadIndex;
  const newRoad = build({ x, y, type: ROAD, paths, index });
  if (newRoad) {
    roadIndex += 1;
    addRoadToCostMatrix(index);
    adjacentTiles.forEach(tile => {
      build({ x: tile.x, y: tile.y, paths: tile.paths + 1, type: tile.type, index: tile.index });
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
  return Tiles;
}