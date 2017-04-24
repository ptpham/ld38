import { Mongo } from 'meteor/mongo';

export const Tiles = new Mongo.Collection('tiles');

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';
export const ROCK = 'ROCK';
export const AQUA = 'AQUA';
export const NONE = 'NONE';

export const MAX_RESOURCES = 10;

export function canBuildHome(tile) {
  return tile.roads == 1;
}

export function canBuildRoad(tile) {
  return tile.roads > 0 && tile.roads < 3;
}
