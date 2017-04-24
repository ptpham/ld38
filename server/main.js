import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles, TILE_COSTS, HOME, ROAD,
  canBuyRoad, canBuyHome} from '../common/tiles';
import { Lights } from '../common/lights';
import { Cars } from '../common/cars';
import { Teams } from '../common/teams';

import { generateMap, buildRoad, buildHome, expandWork } from './building';
import { harvestTile } from './resources';
import { cycleLights, switchLight } from './lighting';
import { findDistances } from './pathing';
import { simulate } from './automata';
import { getGameId } from '../common/games';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
  let users = 0;
  generateMap(10, 10);

  Cars.rawCollection().createIndex({ homeTileId: 1, gameId: 1 });
  Tiles.rawCollection().createIndex({ gameId: 1, index: 1 });
  Lights.rawCollection().createIndex({ gameId: 1 });
  Teams.rawCollection().createIndex({ gameId: 1, index: 1 });
  Meteor.publish('tiles', () => Tiles.find({ gameId }));
  Meteor.publish('lights', () => Lights.find({ gameId }));
  Meteor.publish('cars', () => Cars.find({ gameId }));
  Meteor.publish('teams', () => Teams.find({ gameId }));
  Meteor.methods({
    buildHome: (x, y, index) => {
      const resources = Teams.findOne({ gameId, index }).resources;
      if (!canBuyHome(resources)) return;
      Teams.update({ gameId, index }, { $set: { resources: resources - TILE_COSTS[HOME] } });
      buildHome(x, y, index, true);
    },
    buildRoad: (x, y, index) => {
      const resources = Teams.findOne({ gameId, index }).resources;
      if (!canBuyRoad(resources)) return;
      Teams.update({ gameId, index }, { $set: { resources: resources - TILE_COSTS[ROAD] } });
      buildRoad(x, y, true);
    },
    harvestTile,
    switchLight,
    getGameId,
    registerTeam: () => { users++; return users % 2; }
  });

  findDistances();
  Meteor.setInterval(() => { findDistances(); }, 5000);
  Meteor.setInterval(() => {
    simulate();
    expandWork();
    cycleLights();
  }, 1000);
});
