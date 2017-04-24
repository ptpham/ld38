
import './main.html';
import './scoreboard';
import { introParams } from './intro';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Renderer } from './renderer';
import { Control } from './control';
import { Teams } from '../common/teams';
import { Tiles } from '../common/tiles';
import { vec3 } from 'gl-matrix';

Template.body.helpers({
  teams() { return Teams.find(); }
});

Meteor.startup(() => {
  Meteor.call('getGameId', gameId => {
    if (gameId != localStorage.getItem('gameId')) {
      localStorage.clear();
    }

    localStorage.setItem('gameId', gameId);
    let team = localStorage.getItem('team');

    if (team == null) {
      Meteor.call('registerTeam', (err, teamId) => {
        localStorage.setItem('team', teamId);
        introParams.set('team', teamId);
      });
    } else {
      introParams.set('team', team);
    }

    var canvas = document.getElementById('canvas');
    var renderer = new Renderer(canvas);
    var control = new Control(renderer);

    Meteor.subscribe('tiles', () => {
      var sum = 0;
      Tiles.find().forEach(tile => sum += tile.x);
      var center = sum/Tiles.find().count();
      renderer.camera.translate(vec3.fromValues(center, center, 0));
    });
    Meteor.subscribe('lights');
    Meteor.subscribe('cars');
    Meteor.subscribe('teams');

    function raf() {
      renderer.draw();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    control.addListeners();
  });
});
