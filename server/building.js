import _ from 'lodash';
import { Tiles, canBuildHome, canBuildRoad, BUILDABLE_SET,
  TREE, ROCK, AQUA, NONE, WORK, HOME, ROAD } from '../common/tiles';
import { getGameId } from './games';
import HexGrid from '../common/hexgrid';
import { createLight } from './lighting';
import { cantorZ } from '../common/pairing';
import { Teams } from '../common/teams';

function pushPath(src, dst) {
  var bothRoad = src.type == ROAD && dst.type == ROAD;
  var singleUnconnected = dst.type == ROAD
    && (src.type == WORK || src.type == HOME)
    && (src.paths == null || src.paths.length < 1);
  
  if (src.type == ROAD) {
    Tiles.update({ _id: dst._id }, { $inc: { roads: 1 } }, () => {
      checkStopLight(dst._id);
    });
  }

  if (singleUnconnected || bothRoad) {
    Tiles.update({ _id: dst._id }, { $push: { 'paths': src._id } });
    Tiles.update({ _id: src._id }, { $push: { 'paths': dst._id } });
    src.paths = src.paths || [];
    src.paths.push(dst._id);
  }
}

function addStopLight(tile) {
  var adjacentRoads = Tiles.find({ _id: { $in: tile.paths }, type: ROAD }).fetch();
  var closedTile = Tiles.findOne({ _id: _.sample(adjacentRoads)._id });

  var { x, y } = tile;
  var closed = HexGrid.orientation(x, y, closedTile.x, closedTile.y);
  createLight({ x, y, closed });
}

function checkStopLight(tileId) {
  var tile = Tiles.findOne({ _id: tileId });
  if (tile == null || tile.type != ROAD) return;
  if (tile.roads == 3) addStopLight(tile);
}

export function updatePaths(tile, adjacent) {
  if (tile == null) return;
  adjacent = _.shuffle(Array.from(adjacent));
  for (var other of adjacent) {
    pushPath(tile, other);
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
    checkStopLight(tile);
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
    Tiles.upsert({ x, y, gameId }, { $set: { teamId } }, () => expandRoads());
    Teams.update({ gameId, index: teamId.toString() }, { $inc: { homes: 1 } });
  }
}
export function buildWork(x, y) { return build({ x, y, type: WORK }); }

export function generateMap(width, height) {
  const possibleTypes = [TREE, ROCK, AQUA, NONE];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (i + j < width/2 || i + j >= 1.5*width) continue;
      build({ x: j, y: i, type: _.sample(possibleTypes) });
    }
  }

  // generate roads
  const center = [Math.ceil(width / 2) - 1, Math.ceil(height / 2) - 1];
  buildRoad(center[0], center[1]);
  buildRoad(center[0] + 1, center[1]);
  buildRoad(center[0], center[1] - 1);
  buildRoad(center[0] - 1, center[1] + 1);
  buildWork(center[0] - 2, center[1] + 2);
  buildHome(center[0] + 1, center[1] + 1, 0);
  buildHome(center[0] - 1, center[1] - 1, 1);
  return Tiles;
}

export function expandWork() {
  var gameId = getGameId();
  var population = Tiles.find({ gameId, type: HOME }).count();
  var workCount = Tiles.find({ gameId, type: WORK }).count();

  if (workCount >= population / 2) return;
  var roads = Tiles.find({ gameId, type: ROAD }).fetch();
  var found = null;
  
  roads.forEach(road => {
    if (road.paths.length == 6) return;
    
    HexGrid.shifts.forEach(shift => {
      var other = Tiles.findOne({ gameId,
        index: cantorZ(road.x + shift[0], road.y + shift[1]) });
      if (other == null) return;
      if (other.type in BUILDABLE_SET) found = found || other;
    })
  });

  if (found != null) buildWork(found.x, found.y);
}

function expandRoads() {
  var gameId = getGameId();
  var candidates = Tiles.find({ gameId,
    type: { $in: _.keys(BUILDABLE_SET) }, roads: { $gt: 0 } }).fetch();
  var filtered = _.filter(candidates, tile => canBuildRoad(tile));
  if (filtered.length > 3 || filtered.length == 0) return;
  var target = _.sample(filtered);
  buildRoad(target.x, target.y);
  expandRoads();
}

