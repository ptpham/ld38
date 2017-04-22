import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles } from '../common/tiles';
import { Lights } from '../common/lights';

import { generateMap, buildRoad, buildHome, buildWork } from './building';
import { findDistances } from './pathing';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
  generateMap(10, 10);

  Meteor.publish('tiles', () => Tiles.find({ gameId }));
  Meteor.publish('lights', () => Lights.find({ gameId }));
  Meteor.methods({
    buildWork,
    buildHome,
    buildRoad
  });
  Meteor.setInterval(() => {
    findDistances();
  }, 5000);
});
