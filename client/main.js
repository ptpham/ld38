
import './main.html';
import './scoreboard';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Renderer } from './renderer';
import { Control } from './control';
import { Teams } from '../common/teams';

Template.body.helpers({
  teams() { return Teams.find(); }
});

Meteor.startup(() => {
  let team = localStorage.getItem('team');
  if (team == null) {
    Meteor.call('registerTeam', (team) => {
      localStorage.setItem('team', team);
    });
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
