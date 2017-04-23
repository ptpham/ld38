import { Lights, LIGHT_CD } from '../common/lights';
import { getGameId } from '../common/games';
import { Tiles } from '../common/tiles';
import HexGrid from '../common/hexgrid';
import _ from 'lodash';

export function getLight(x, y) {
  const gameId = getGameId();
  return Lights.findOne({ x, y, gameId });
}

export function createLight({ x, y, closed, cd }) {
  const gameId = getGameId();
  return Lights.upsert({ x, y, gameId }, { $set: { closed, cd } });
}

export function switchLight(x, y, tx, ty, cd) {
  const light = getLight(x, y);
  if (!light) return;

  const closed = HexGrid.orientation(x, y, tx, ty);
  return createLight({ x, y, closed, cd: cd || light.cd });
}

export function toggleLight(x, y, triggerCd) {
  const light = getLight(x, y);
  const currentTime = Date.now();
  if (!light || light.cd > currentTime) return;

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

  if (triggerCd) {
    return switchLight(x, y, picked.x, picked.y, currentTime + LIGHT_CD);
  }
  return switchLight(x, y, picked.x, picked.y);
}

