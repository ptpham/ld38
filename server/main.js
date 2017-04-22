import { Meteor } from 'meteor/meteor';
import tiles, { generate } from '../common/tiles';

Meteor.startup(() => {
  // code to run on server at startup
  console.log(generate(5, 5));
});
