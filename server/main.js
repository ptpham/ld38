import { Meteor } from 'meteor/meteor';
import { Tiles, generate } from '../common/tiles';

Meteor.startup(() => {
  // code to run on server at startup
  generate(5, 5);
  console.log(Tiles.find().fetch());
});
