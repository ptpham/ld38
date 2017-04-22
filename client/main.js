
import './main.html';
import { Meteor } from 'meteor/meteor';
import Tiles from '../common/tiles';

Meteor.startup(() => {
  Meteor.subscribe('tiles');

  console.log(Tiles.find().fetch());
});
