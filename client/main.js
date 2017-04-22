
import './main.html';
import { Meteor } from 'meteor/meteor';
import { Renderer } from './renderer';
import { Tiles } from '../common/tiles';

Meteor.startup(() => {
  Meteor.subscribe('tiles');
  console.log(Tiles.find().fetch());

  var canvas = document.getElementById('canvas');
  var renderer = new Renderer(canvas);
  renderer.draw();
});
