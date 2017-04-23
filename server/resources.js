
import { Teams } from '../common/teams';
import { Tiles, WORK } from '../common/tiles';
import { getGameId } from '../common/games';

export function harvestTile(teamId, x, y) {
  var tile = Tiles.findOne({ gameId, x, y });
  if (tile == null || tile.type != WORK) return;

  var amount = tile.resources[teamId];
  if (amount == 0 || amount == null) return;

  var set = { };
  set['resources.' + teamId] = 0;
  Tiles.update({ _id: tile._id }, { $set: set });
  Teams.update({ _id: teamId }, { $inc: amount });
}

