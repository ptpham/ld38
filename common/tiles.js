import { Mongo } from 'meteor/mongo';

export const Tiles = new Mongo.Collection('tiles');

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';
export const ROCK = 'ROCK';
export const AQUA = 'AQUA';
export const NONE = 'NONE';

export const MAX_RESOURCES = 5;
export const BUILDABLE_SET = {TREE, ROCK, AQUA, NONE};
export const TILE_COSTS = {
  [HOME]: 10,
  [ROAD]: 5
};

export function canBuildHome(tile) {
  return tile.roads > 0 && tile.type in BUILDABLE_SET;
}

export function homeCost(homes, resources) {
  return homes * TILE_COSTS[HOME];
}

export function canBuyHome(homes, resources) {
  const cost = homeCost(homes, resources);
  return resources >= cost;
}

export function canBuildRoad(tile) {
  return tile.roads > 0 && tile.roads < 3 &&
    tile.type in BUILDABLE_SET;
}

export function canBuyRoad(resources) {
  const cost = TILE_COSTS[ROAD];
  return resources >= cost;
}
