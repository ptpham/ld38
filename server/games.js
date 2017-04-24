import { Mongo } from 'meteor/mongo';
import { Teams } from '../common/teams';
import _ from 'lodash';

import { resetPathingState } from './pathing';
import { generateMap } from './building';

export const Games = new Mongo.Collection('games');
export const GAME_TIME = 30*60*1000;

let gameId = null;
var users = 0;
export function newGame() {
  var begin = _.now();
  var end = begin + GAME_TIME;
  gameId = Games.insert({ begin, end, active: true, users: 0 });
  Teams.insert({ gameId, resources: 5, index: '0' });
  Teams.insert({ gameId, resources: 5, index: '1' });
  generateMap(10, 10);
  resetPathingState();
  users = 0;
  return gameId;
}

export function reloadGame() {
  if (gameId != null) return gameId;

  var currentGame = Games.findOne({ active: true });
  if (currentGame == null) return newGame();
  return currentGame._id;
}

export function registerTeam() {
  users++;
  return users % 2;
}

export function getGameId() {
  return gameId;
}
