
import './main.html';
import { Meteor } from 'meteor/meteor';
import { Renderer } from './renderer';
import { Control } from './control';
import _ from 'lodash';

Meteor.startup(() => {
  Meteor.subscribe('tiles');
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
