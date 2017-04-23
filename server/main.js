import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles } from '../common/tiles';
import { Lights } from '../common/lights';
import { Cars } from '../common/cars';
import { Teams } from '../common/teams';

import { generateMap, buildRoad, buildHome, buildWork } from './building';
import { harvestTile } from './resources';
import { toggleLight, switchLight } from './lighting';
import { findDistances } from './pathing';
import { simulate } from './automata';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
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
    buildWork,
    buildHome,
    buildRoad,
    harvestTile,
    switchLight,
    toggleLight: (x, y) => toggleLight(x, y, true)
  });

  findDistances();
  Meteor.setInterval(() => { findDistances(); }, 5000);
  Meteor.setInterval(() => { simulate(); }, 1000);
});
