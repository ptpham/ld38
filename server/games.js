import { Mongo } from 'meteor/mongo';
import { Teams } from '../common/teams';
import _ from 'lodash';

import { resetPathingState } from './pathing';
import { generateMap } from './building';
import { Games } from '../common/games';

export const GAME_TIME = 5*60*1000;

let gameId = null;
var users = 0;
export function newGame() {
  var begin = _.now();
  var end = begin + GAME_TIME;
  gameId = Games.insert({ begin, end, active: true, users: 0 });
  Teams.insert({ gameId, resources: 5, index: '0' });
  Teams.insert({ gameId, resources: 5, index: '1' });
  generateMap(15, 15);
  resetPathingState();
  users = 0;
  return gameId;
}

export function checkGameEnd() {
  var game = Games.findOne({ _id: gameId });
  if (game.active == false || _.now() > game.end) {
    Games.update({ _id: gameId }, { $set: { active: false } });
    newGame();
  }
}

export function reloadGame() {
  if (gameId != null) return gameId;
  var currentGame = Games.findOne({ active: true });
  if (currentGame == null || currentGame.active == false) return newGame();
  gameId = currentGame._id;
  return currentGame._id;
}

export function registerTeam() {
  users++;
  Games.update({ _id: gameId }, { $inc: { users: 1 } });
  return users % 2;
}

export function getGameId() {
  return gameId;
}
