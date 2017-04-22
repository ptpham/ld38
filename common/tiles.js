import { Mongo } from 'meteor/mongo';
import _ from 'lodash';
import HexGrid from './hexgrid';

const Tiles = new Mongo.Collection('tiles');
const tiles = [];
export default Tiles;

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';
export const ROCK = 'ROCK';
export const AQUA = 'AQUA';
export const NONE = 'NONE';

export function persist() {
  // TODO
}

export function makeTile(x, y, type) {
  tiles[x] = tiles[x] || [];
  tiles[x][y] = { x, y, type };
}

export function generate(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      makeTile(j, i, _.sample(possibleTypes));
    }
  }
}

export function build(x, y, type) {
  const tile = tiles[x][y];
  if (tile.type === AQUA || tile.type === ROCK) return;
  tile.type = type;
  return tile;
}

export function buildRoad(x, y) {
  let maxAdjacentRoads = false;
  let paths = 0;
  const adjacents = HexGrid.adjacent(null, x, y)
    .forEach(([ax, ay]) => {
      const tile = tiles[ax][ay];
      if (tile.type === ROAD) {
        paths += 1;
        maxAdjacentRoads = maxAdjacentRoads || tile.paths >= 3;
      }
    });
  if (maxAdjacentRoads || paths > 3) return;

  adjacents.forEach(tile => { tile.paths += 1; });
  const tile = build(x, y, ROAD);
  tile.paths = paths;
  return tile;
}

export function buildHome(x, y) {
  return build(x, y, HOME);
}

export function buildWork(x, y) {
  return build(x, y, WORK);
}

export function getAllIntersections() {
  const flatTiles = _.flatten(tiles);
  return _.filter(flatTiles,
    tile => (tile.type === ROAD && (tile.paths === 3 || tile.paths === 1))
  );
}
