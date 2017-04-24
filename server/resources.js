
import { Teams } from '../common/teams';
import { Tiles, WORK, MAX_RESOURCES } from '../common/tiles';
import { getGameId } from '../common/games';

export function harvestTile(tileId, teamId) {
  var tile = Tiles.findOne({ _id: tileId });
  if (tile == null || tile.type != WORK) return;

  var amount = Math.min(tile.resources[teamId], MAX_RESOURCES);
  if (amount == 0 || amount == null || Number.isNaN(amount)) return;

  var set = { };
  var gameId = getGameId();
  set['resources.' + teamId] = 0;
  Tiles.update({ _id: tile._id }, { $set: set });
  Teams.update({ gameId, index: teamId }, { $inc: { resources: amount } });
}

