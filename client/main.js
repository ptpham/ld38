
import './main.html';
import { Meteor } from 'meteor/meteor';
import { Renderer } from './renderer';
import { Control } from './control';
import _ from 'lodash';

Meteor.startup(() => {
  let team = localStorage.getItem('team');
  if (team == null) {
    team = _.sample([0, 1]);
    localStorage.setItem('team', team);
  }

  Meteor.subscribe('tiles');
  Meteor.subscribe('lights');
  Meteor.subscribe('cars');
  Meteor.subscribe('teams');
  var canvas = document.getElementById('canvas');
  var renderer = new Renderer(canvas);
  var control = new Control(renderer);

  function raf() {
    renderer.draw();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  control.addListeners();
});
