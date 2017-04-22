import { Mongo } from 'meteor/mongo';
import _ from 'lodash';
import HexGrid from './hexgrid';

const Tiles = new Mongo.Collection('tiles');
export default Tiles;

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';

export function makeTile(x, y, type) {
  Tiles.insert({ x, y, type });
}

export function isIntersection(x, y) {
  const tile = Tiles.findOne({ x, y });
  if (tile.type !== ROAD) return false;

  const adjacents = HexGrid.adjacent(null, x, y);
  const adjacentTiles = adjacents
    .map(([ax, ay]) => Tiles.findOne({ x: ax, y: ay, type: ROAD }));
  const adjacentRoads = _.compact(adjacentTiles);
  return adjacentRoads > 2;
}
