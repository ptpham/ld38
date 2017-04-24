import { Meteor } from 'meteor/meteor';
import { Tiles, TILE_COSTS, HOME, ROAD,
  canBuyRoad, canBuyHome} from '../common/tiles';
import { Lights } from '../common/lights';
import { Cars } from '../common/cars';
import { Teams } from '../common/teams';
import { Games, newGame, registerTeam, getGameId, reloadGame } from './games';

import { buildRoad, buildHome, expandWork } from './building';
import { harvestTile } from './resources';
import { cycleLights, switchLight } from './lighting';
import { findDistances } from './pathing';
import { simulate } from './automata';

Meteor.startup(() => {
  Cars.rawCollection().createIndex({ homeTileId: 1, gameId: 1 });
  Tiles.rawCollection().createIndex({ gameId: 1, index: 1 });
  Lights.rawCollection().createIndex({ gameId: 1 });
  Teams.rawCollection().createIndex({ gameId: 1, index: 1 });
  Meteor.publish('tiles', gameId => Tiles.find({ gameId }));
  Meteor.publish('lights', gameId => Lights.find({ gameId }));
  Meteor.publish('cars', gameId => Cars.find({ gameId }));
  Meteor.publish('teams', gameId => Teams.find({ gameId }));
  Meteor.publish('games', gameId => Games.find({ _id: gameId }));
  Meteor.methods({
    buildHome: (x, y, index) => {
      var gameId = getGameId();
      const resources = Teams.findOne({ gameId, index }).resources;
      if (!canBuyHome(resources)) return;
      Teams.update({ gameId, index }, { $set: { resources: resources - TILE_COSTS[HOME] } });
      buildHome(x, y, index, true);
    },
    buildRoad: (x, y, index) => {
      var gameId = getGameId();
      const resources = Teams.findOne({ gameId, index }).resources;
      if (!canBuyRoad(resources)) return;
      Teams.update({ gameId, index }, { $set: { resources: resources - TILE_COSTS[ROAD] } });
      buildRoad(x, y, true);
    },
    harvestTile,
    switchLight,
    getGameId,
    registerTeam
  });

  reloadGame();

  findDistances();
  Meteor.setInterval(() => { findDistances(); }, 5000);
  Meteor.setInterval(() => {
    simulate();
    expandWork();
    cycleLights();
  }, 1000);
});
