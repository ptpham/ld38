import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { TEAM_COLORS } from '../common/teams';
import { HOME, ROAD, TILE_COSTS } from '../common/tiles';

export const introParams = new ReactiveDict();
introParams.set('hide', !!localStorage.getItem('intro'));

Template.intro.helpers({
  isHidden() {
    const hide = introParams.get('hide');
    return hide ? 'hidden': 'visible';
  },
  isHiddenInv() {
    const hide = introParams.get('hide');
    return hide ? 'visible': 'hidden';
  },
  teamColor() {
    const team = introParams.get('team');
    if (team == null) return;
    const color = TEAM_COLORS[team];
    const str = color.slice(0, 3).map(c => Math.round(c*255)).join(',');
    return `rgb(${str})`;
  },
  rivalColor() {
    const team = introParams.get('team');
    if (team == null) return;
    const color = TEAM_COLORS[(Number(team) + 1) % 2];
    const str = color.slice(0, 3).map(c => Math.round(c*255)).join(',');
    return `rgb(${str})`;
  },
  homeCost() { return TILE_COSTS[HOME]; },
  roadCost() { return TILE_COSTS[ROAD]; }
});

Template.intro.events({
  'click button': function(event) {
    event.stopImmediatePropagation();
    introParams.set('hide', true);
    localStorage.setItem('intro', 'done');
  },
  'click #info': function(event) {
    event.stopImmediatePropagation();
    introParams.set('hide', false);
  }
});
