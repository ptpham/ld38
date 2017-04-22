
import './main.html';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Renderer } from './renderer';
import { Control } from './control';
import _ from 'lodash';

import { Tiles } from '../common/tiles';

Meteor.startup(() => {
  Tracker.autorun(() => {
    console.log(Tiles.find().fetch());
  });

  var canvas = document.getElementById('canvas');
  var renderer = new Renderer(canvas);
  var control = new Control(renderer.camera);

  function raf() {
    renderer.draw();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  control.addListeners();
});
