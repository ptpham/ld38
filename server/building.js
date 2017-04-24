import _ from 'lodash';
import { Tiles, canBuildHome, canBuildRoad,
  TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from '../common/games';
import HexGrid from '../common/hexgrid';
import { createLight } from './lighting';
import { cantorZ } from '../common/pairing';

function pushPath(src, dst, roadsOnly) {
  let update = { $inc: { roads: dst.type == ROAD ? 1 : 0 } };
  if (!roadsOnly) {
    update = Object.assign(update, { $push: { 'paths': dst._id } });
  }
  return Tiles.update({ _id: src._id }, update, () => {
      checkStopLight(src._id);
  });
}

function checkStopLight(tileId) {
  var tile = Tiles.findOne({ _id: tileId });
  if (tile.type != ROAD) return;

  if (tile.roads == 3) {
    var adjacentRoads = Tiles.find({ _id: { $in: tile.paths }, type: ROAD }).fetch();
    var closedTile = Tiles.findOne({ _id: _.sample(adjacentRoads)._id });

    var { x, y } = tile;
    var closed = HexGrid.orientation(x, y, closedTile.x, closedTile.y);
    createLight({ x, y, closed });
  }
}

export function updatePaths(tile, adjacent) {
  if (tile == null) return;
  if (tile.type != WORK && tile.type != HOME && tile.type != ROAD) return;
  if (tile.type != ROAD && _.get(tile, 'paths.length') > 0) return;

  adjacent = _.shuffle(Array.from(adjacent));
  for (var other of adjacent) {
    if (other.type == ROAD) {
      pushPath(tile, other);
      pushPath(other, tile);
      if (tile.type != ROAD) return;
    } else {
      pushPath(tile, other, true);
      pushPath(other, tile, true);
    }
  }
}

export function build({ x, y, type }) {
  const gameId = getGameId();
  var index = index || cantorZ(x, y);

  var adjacentIndexes = HexGrid.shifts.map(shift =>
    cantorZ(x + shift[0], y + shift[1]));
  var allAdjacent = Tiles.find({ gameId, index: { $in: adjacentIndexes } }).fetch();
  var adjacentTiles = Tiles.find({ gameId, type: { $in: [WORK, ROAD, HOME] },
    index: { $in: adjacentIndexes } }).fetch();
  var adjacentRoads = _.filter(adjacentTiles, tile => tile.type == ROAD);
  if (type == ROAD && adjacentRoads.length > 3) return;

  return Tiles.upsert({ x, y, gameId }, { $set: { type, index } }, err => {
    var tile = Tiles.findOne({ gameId, index });
    updatePaths(tile, allAdjacent);
  });
}

export function buildRoad(x, y, check) {
  const gameId = getGameId();
  const tile = Tiles.findOne({ x, y, gameId });
  if (!check || canBuildRoad(tile)) {
    build({ x, y, type: ROAD });
  }
}
export function buildHome(x, y, teamId, check) {
  const gameId = getGameId();
  const tile = Tiles.findOne({ x, y, gameId });
  if (!check || canBuildHome(tile)) {
    build({ x, y, type: HOME });
    Tiles.upsert({ x, y, gameId }, { $set: { teamId } });
  }
}
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
  buildRoad(center[0] + 1, center[1]);
  buildRoad(center[0], center[1] - 1);
  buildRoad(center[0] - 1, center[1] + 1);
  buildWork(center[0] + 1, center[1] + 1);
  buildHome(center[0] - 1, center[1] - 1, 0);
  buildHome(center[0] + 1, center[1] - 1, 0);
  buildHome(center[0] - 1, center[1] + 2, 1);
  return Tiles;
}
