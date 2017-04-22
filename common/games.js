import { Mongo } from 'meteor/mongo';
export const Games = new Mongo.Collection('games');

let gameId = null;
export function newGame() {
  gameId = Games.insert({});
  return gameId;
}

export function getGameId() {
  return gameId;
}
