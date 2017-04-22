import { Lights } from '../common/lights';
import { getGameId } from '../common/games';

export function createLight({ tileId, open }) {
  const gameId = getGameId();
  return Lights.upsert({ tileId, gameId }, { $set: { open } });
}