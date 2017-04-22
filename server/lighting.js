import { Lights } from '../common/lights';
import { getGameId } from '../common/games';

export function getLight(x, y) {
  const gameId = getGameId();
  return Lights.findOne({ x, y, gameId });
}

export function createLight({ x, y, open }) {
  const gameId = getGameId();
  return Lights.upsert({ x, y, gameId }, { $set: { open } });
}

export function switchLight(x, y) {
  const light = getLight(x, y);
  const newOpen = [light.open[1], (light.open[1] + 1) % 3];
  return createLight({ x, y, open: newOpen });
}
