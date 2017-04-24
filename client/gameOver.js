
import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { Teams } from '../common/teams';
import { Games } from '../common/games';
import { introParams } from './intro';
import _ from 'lodash';

export const gameMeta = new ReactiveDict();

Template.gameOver.helpers({
  isHidden() {
    var game = Games.findOne(gameMeta.get('gameId'));
    if (game == null) return 'hidden';

    if (!game.active) introParams.set('hide', true);
    return game.active ? 'hidden' : '';
  },
  timeBegin() {
    var begin = _.get(Games.findOne(gameMeta.get('gameId')), 'begin');
    return new Date(begin).toLocaleString();
  },
  timeEnd() {
    var end = _.get(Games.findOne(gameMeta.get('gameId')), 'end');
    return new Date(end).toLocaleString();
  },
  users() {
    return _.get(Games.findOne(gameMeta.get('gameId')), 'users') - 1;
  },
  teams() { return Teams.find(); }
});

Template.gameOver.events({
  'click button': function(e) {
    localStorage.clear();
    document.location.reload(true);
  }
});

