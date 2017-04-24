
import _ from 'lodash';
import HexGrid from '../common/hexgrid';
import { Cars } from '../common/cars';
import { Tiles, ROAD, WORK, HOME } from '../common/tiles';
import lighting from './lighting';
import { getGameId } from '../common/games';
import { cantorZ, cantorXY } from '../common/pairing';
import pathing from './pathing';

export function assignWork(workTiles, car) {
  var work = _.sample(workTiles);
  if (work == null) return;
  car.workTileId = work._id;
}

export function assignDestination(car) {
  var dstTileId = null;
  if (car.currentTileId == car.homeTileId && car.workTileId != null) {
    dstTileId = car.workTileId;
  }
  if (car.currentTileId == car.workTileId) {
    dstTileId = car.homeTileId;
    var inc = {};
    inc['resources.' + car.teamId] = 1;
    Tiles.update({ _id: car.workTileId }, { $inc: inc });
  }
  if (dstTileId == null) return;
  car.dstTileId = dstTileId;
}

export function checkSlotOpen(tileId, orientation, leaving) {
  return Cars.findOne({ currentTileId: tileId,
    orientation, leaving, gameId: getGameId() }) == null;
}

function routeCar(car) {
  var current = Tiles.findOne({ _id: car.currentTileId });
  var last = Tiles.findOne({ _id: car.lastTileId }) || {};
  var dst = Tiles.findOne({ _id: car.dstTileId });
  if (dst == null) return;
  var next = pathing.findNextTile(current.x, current.y,
    dst.x, dst.y, last.x || -1, last.y || -1);
  if (next == null) return null;

  var orientation = HexGrid.orientation(current.x, current.y, next.x, next.y);
  return { next, orientation };
}

function moveCar(car, route) {
  if (route == null) return car;

  // Deal with an embark
  if (car.orientation == null) {
    car.orientation = route.orientation;
    car.leaving = true;
    return car;
  }

  // Deal with a turn in the same tile
  var opposite = HexGrid.opposite(route.orientation);
  if (car.leaving == false && car.orientation != opposite) {
    var tile = Tiles.findOne(car.currentTileId);
    var light = lighting.getLight(tile.x, tile.y);
    if (light != null && (light.closed == route.orientation
      || car.orientation == light.closed)) return car;
    car.orientation = route.orientation;
    car.leaving = true;
    return car;
  }

  // Deal with a transition to the next tile
  car.lastTileId = route.next._id == car.dstTileId ? null : car.currentTileId;
  car.orientation = opposite;
  car.currentTileId = route.next._id;
  car.leaving = false;
  return car;
}

export function createCar(homeTile) {
  var gameId = getGameId();
  var homeTileId = homeTile._id;
  var currentTileId = homeTileId;
  return Cars.upsert({ homeTileId, gameId },
    { $set: { currentTileId, teamId: homeTile.teamId } });
}

export function simulate() {
  var gameId = getGameId();
  var homeTiles = Tiles.find({ type: HOME, gameId }).fetch();
  var workTiles = Tiles.find({ type: WORK, gameId }).fetch();

  for (var home of homeTiles) {
    if (!Cars.findOne({ gameId, homeTileId: home._id })) {
      createCar(home);
    }

    var car = Cars.findOne({ homeTileId: home._id });
    if (car.workTileId == null) assignWork(workTiles, car);
    assignDestination(car);
    moveCar(car, routeCar(car));

    if (checkSlotOpen(car.currentTileId, car.orientation, car.leaving)) {
      Cars.update({ _id: car._id, gameId  }, { $set: car });
    }
  }
}

