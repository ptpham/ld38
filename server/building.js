import _ from 'lodash';
import { Tiles, TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import HexGrid from '../common/hexgrid';
import { addTileToCostMatrix } from './pathing';
import { createLight } from './lighting';
import { cantorZ } from '../common/pairing';

export function build({ x, y, type }, stop) {
  const gameId = getGameId();
  var index = index || cantorZ(x, y);

  var adjacentIndexes = HexGrid.shifts.map(shift =>
    cantorZ(x + shift[0], y + shift[1]));
  var adjacentTiles = Tiles.find({ gameId, index: { $in: adjacentIndexes } }).fetch();
  var adjacentRoads = _.filter(adjacentTiles, tile => tile.type == ROAD);
  if (adjacentRoads.length == 3) createLight({ x, y, closed: 0 });
  if (adjacentRoads.length > 3) return;

  var pathables = _.filter(adjacentTiles, tile =>
    tile.type == ROAD || tile.type == WORK || tile.type == HOME);
  var paths = pathables.map(x => x._id);

  var result = Tiles.upsert({ x, y, gameId }, { $set: { type, paths, index } });
  if (!stop) _.each(adjacentRoads, tile => build(tile, true));
  return result;
}

export function buildRoad(x, y) { return build({ x, y, type: ROAD }); }
export function buildHome(x, y) { return build({ x, y, type: HOME }); }
export function buildWork(x, y) { return build({ x, y, type: WORK }); }

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
    buildWork(center[0] + 1, center[1] + 1);
    buildHome(center[0] - 1, center[1] - 1);
  }
  return Tiles;
}
