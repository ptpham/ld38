
import './main.html';
import { Meteor } from 'meteor/meteor';
import { Renderer } from './renderer';
import _ from 'lodash';


Meteor.startup(() => {
  var canvas = document.getElementById('canvas');
  var renderer = new Renderer(canvas);
  renderer.draw();
});

