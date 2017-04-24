
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
import { gameMeta } from './gameOver';
import { Games } from '../common/games';

Template.body.helpers({
  teams() { return Teams.find(); },
});

Meteor.startup(() => {
  Meteor.call('getGameId', (err, gameId) => {
    var localGameId = localStorage.getItem('gameId');
    if (localGameId  == null) {
      localStorage.setItem('gameId', gameId);
    } else {
      gameId = localGameId;
    }

    gameMeta.set('gameId', gameId);
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

    Meteor.subscribe('tiles', gameId, () => {
      var sum = 0;
      Tiles.find().forEach(tile => sum += tile.x);
      var center = sum/Tiles.find().count();
      renderer.camera.translate(vec3.fromValues(center, center, 0));

      function raf() {
        renderer.draw();
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      control.addListeners();
    });
    Meteor.subscribe('lights', gameId);
    Meteor.subscribe('cars', gameId);
    Meteor.subscribe('teams', gameId);
    Meteor.subscribe('games', gameId);
  });

  Meteor.setInterval(() => {
    gameMeta.set('now', Date.now());
  }, 1000);
});
