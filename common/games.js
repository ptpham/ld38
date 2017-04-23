import { Mongo } from 'meteor/mongo';
import { Teams } from './teams';
export const Games = new Mongo.Collection('games');

let gameId = null;
export function newGame() {
  gameId = Games.insert({});
  Teams.insert({ gameId, resources: 0, color: [0.82, 0.39, 0.31] }); // red-ish
  Teams.insert({ gameId, resources: 0, color: [0.41, 0.68, 0.82] }); // blue-ish
  return gameId;
}

export function getGameId() {
  return gameId;
}
