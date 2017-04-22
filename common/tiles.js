import { Mongo } from 'meteor/mongo';
import _ from 'lodash';
import HexGrid from './hexgrid';

const Tiles = new Mongo.Collection('tiles');
export default Tiles;

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';
export const ROCK = 'ROCK';
export const AQUA = 'AQUA';
export const NONE = 'NONE';

export function makeTile(x, y, type, paths = null) {
  return Tiles.upsert({ x, y }, { $set: { type, paths } });
}

export function generate(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      makeTile(j, i, _.sample(possibleTypes));
    }
  }
  return Tiles;
}

export function build(x, y, type, paths) {
  const tile = Tiles.findOne({ x, y });
  if (tile.type === AQUA || tile.type === ROCK) return;
  return makeTile(x, y, type, paths);
}

export function buildRoad(x, y) {
  let maxAdjacentRoads = false;
  let paths = 0;
  let adjacentTiles = [];
  HexGrid.adjacent(null, x, y)
    .forEach(([ax, ay]) => {
      const tile = Tiles.findOne({ x: ax, y: ay, type: ROAD });
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

export function getAllIntersections() {
  return Tiles.find({ type: ROAD, paths: { $in: [1, 3] } });
}
