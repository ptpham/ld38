import _ from 'lodash';
import { Tiles, TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import HexGrid from '../common/hexgrid';

export function makeTile(x, y, type, paths = null) {
  const gameId = getGameId();
  return Tiles.upsert({ x, y, gameId }, { $set: { type, paths } });
}

export function generateMap(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      makeTile(j, i, _.sample(possibleTypes));
    }
  }
  return Tiles;
}

export function build(x, y, type, paths) {
  const gameId = getGameId();
  const tile = Tiles.findOne({ x, y, gameId });
  if (tile.type === AQUA || tile.type === ROCK) return;
  return makeTile(x, y, type, paths);
}

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

  adjacentTiles.forEach(tile => {
    build(tile.x, tile.y, tile.type, tile.paths + 1);
  });
  return build(x, y, ROAD, paths);
}

export function buildHome(x, y) {
  return build(x, y, HOME);
}

export function buildWork(x, y) {
  return build(x, y, WORK);
}
