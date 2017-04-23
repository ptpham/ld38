import { Lights } from '../common/lights';
import { getGameId } from '../common/games';
import { Tiles, ROAD } from '../common/tiles';
import HexGrid from '../common/hexgrid';
import _ from 'lodash';

export function getLight(x, y) {
  const gameId = getGameId();
  return Lights.findOne({ x, y, gameId });
}

export function createLight({ x, y, closed }) {
  const gameId = getGameId();
  return Lights.upsert({ x, y, gameId }, { $set: { closed } });
}

export function switchLight(x, y, tx, ty) {
  const light = getLight(x, y);
  if (!light) return;

  const closed = HexGrid.orientation(x, y, tx, ty);
  return createLight({ x, y, closed });
}

export function toggleLight(x, y) {
  const light = getLight(x, y);
  if (!light) return;

  var tile = Tiles.findOne({ gameId: getGameId(), x, y });
  var { paths } = tile;
  var found = null;

  for (var i = 0; i < paths.length && found == null; i++) {
    var adjacent = Tiles.findOne({ _id: paths[i] });
    var orientation = HexGrid.orientation(tile.x, tile.y, adjacent.x, adjacent.y);
    if (orientation == light.closed) found = i;
  }

  if (found == null) return;
  var picked = Tiles.findOne({ _id: paths[(found+1)%paths.length] });
  return switchLight(x, y, picked.x, picked.y);
}

