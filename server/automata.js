
import _ from 'lodash';
import HexGrid from '../common/hexgrid';
import { Cars } from '../common/cars';
import { Tiles, ROAD, WORK, HOME } from '../common/tiles';
import { getGameId } from '../common/games';
import { cantorZ, cantorXY } from '../common/pairing';

export function assignWork(workTiles, car) {
  var work = _.sample(workTiles)._id;
  if (work == null) return;
  return Cars.upsert(_.pick(car, 'homeTileId', 'gameId'), { $set: { workTileId } });
}

export function checkSlotOpen(tile, slot) {
  var others = Cars.find({ currentTileId: tile._id }).fetch();
  for (var other of otehrs) {
    if (other.slot[0] == slot[0] && other.slot[1] == slot[1]) return false;
  }
  return true;
}

function findEmbarkSlot(car, tile) {

}

export function embarkCar(car) {
  if (car.workTileId == null) return false;
  if (car.currentTileId != car.workTileId
    && car.currentTileId != car.homeTileId) return false;
  var currentTile = Tiles.findOne({ _id: car.currentTileId });

  for (var _id of _.shuffle(homeTile.paths)) {
    var tile = Tiles.findOne({ _id });
    if (tile.type != ROAD) continue;
    var slot = findEmbarkSlot(car, tile);
    if (slot == null || checkSlotOpen(tile, slot)) continue;
    Tiles.update({ _id: car._id }, { $set: { currentTileId: _id, slot } })
    return true;
  }
  return false;
}

export function createCar(homeTile) {
  var gameId = getGameId();
  var homeTileId = homeTile._id;
  var currentTileId = homeTileId;
  return Cars.upsert({ homeTileId, gameId },
    { $set: { currentTileId, slot: [0,0], teamId } });
}

export function simulate() {
  var homeTiles = Tiles.find({ type: HOME }).fetch();
  var workTiles = Tiles.find({ type: WORK }).fetch();
  for (var home of homeTiles) {
    if (!Car.fetchOne({ homeTileId: home._id })) {
      createCar(homeTile);
    }

    var car = Car.fetchOne({ homeTileId: home._id }); 
    assignWork(workTiles, car);
    if (embarkCar(car)) continue;
  }
}

