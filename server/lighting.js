import { Lights } from '../common/lights';
import { getGameId } from '../common/games';

export function getLight(x, y) {
  const gameId = getGameId();
  return Lights.findOne({ x, y, gameId });
}

export function createLight({ x, y, closed }) {
  const gameId = getGameId();
  return Lights.upsert({ x, y, gameId }, { $set: { closed } });
}

export function switchLight(x, y) {
  const light = getLight(x, y);
  if (!light) return;

  const closed = (light.closed + 1) % 3;
  return createLight({ x, y, closed });
}
