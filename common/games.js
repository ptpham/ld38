import { Mongo } from 'meteor/mongo';
import { Teams } from './teams';
export const Games = new Mongo.Collection('games');

let gameId = null;
export function newGame() {
  gameId = Games.insert({});
  Teams.insert({ gameId, resources: 0, index: '0' });
  Teams.insert({ gameId, resources: 0, index: '1' });
  return gameId;
}

export function getGameId() {
  return gameId;
}
