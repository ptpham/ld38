import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles } from '../common/tiles';
import { generateMap, buildRoad, buildHome, buildWork } from './building';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
  generateMap(4, 4);

  console.log(Tiles.find({ gameId }).fetch());
  Meteor.publish('tiles', () => Tiles.find({ gameId }));
  Meteor.methods({
    buildWork,
    buildHome,
    buildRoad
  });
});
