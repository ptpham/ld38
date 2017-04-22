import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles } from '../common/tiles';
import { generateMap, buildRoad, buildHome, buildWork } from './building';
import { findDistances } from './pathing';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
  generateMap(4, 4);
  buildRoad(0, 1);
  buildRoad(1, 1);
  buildRoad(1, 2);
  buildRoad(2, 2);

  Meteor.publish('tiles', () => Tiles.find({ gameId }));
  Meteor.methods({
    buildWork,
    buildHome,
    buildRoad
  });
  Meteor.setInterval(() => {
    findDistances();
  }, 5000);
});
