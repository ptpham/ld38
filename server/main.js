import { Meteor } from 'meteor/meteor';
import { newGame } from '../common/games';
import { Tiles, generate } from '../common/tiles';

Meteor.startup(() => {
  // code to run on server at startup
  const gameId = newGame();
  generate(4, 4);

  Meteor.publish('tiles', () => Tiles.find({ gameId }));
});
