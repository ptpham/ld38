
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
      var xs = Tiles.find().map(tile => renderer.hexgrid.center(vec3.create(), tile.x, tile.y)[0]);
      var ys = Tiles.find().map(tile => renderer.hexgrid.center(vec3.create(), tile.x, tile.y)[1]);
      var centerX = (_.max(xs) + _.min(xs))/2;
      var centerY = (_.max(ys) + _.min(ys))/2;
      renderer.camera.translate(vec3.fromValues(centerX, centerY, 0));

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
    Meteor.subscribe('games', gameId, () => {
      if (Games.findOne(localStorage.getItem('gameId')) == null) {
        localStorage.clear();
        document.location.reload(true);
      }
    });
  });

  Meteor.setInterval(() => {
    gameMeta.set('now', Date.now());
  }, 1000);
});
