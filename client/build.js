
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ROAD, HOME, TILE_COSTS, canBuildHome, canBuildRoad, canBuyHome, canBuyRoad } from '../common/tiles';
import { Teams } from '../common/teams';

export const buildParams = new ReactiveDict();
export function teamResources() {
  const teamId = localStorage.getItem('team');
  const team = Teams.findOne({ index: teamId });
  return team && team.resources || 0;
}
export function buildable(tile) { return buildableHome(tile) || buildableRoad(tile); }
export function buildableHome(tile) { return canBuildHome(tile) && canBuyHome(teamResources()); }
export function buildableRoad(tile) { return canBuildRoad(tile) && canBuyRoad(teamResources()); }

Template.build.helpers({
  buildable() {
    const buildable = [];
    const tile = buildParams.get('tile');
    if (tile) {
      if (buildableHome(tile)) buildable.push({ id: HOME, name: 'Home', cost: TILE_COSTS[HOME] });
      if (buildableRoad(tile)) buildable.push({ id: ROAD, name: 'Road', cost: TILE_COSTS[ROAD] });
    }
    return buildable;
  },
  isHidden() {
    const show = buildParams.get('show');
    return show ? 'visible' : '';
  }
});

Template.build.events({
  'click button': function(event) {
    event.stopImmediatePropagation();
    const buildType = event.target.id;
    const tile = buildParams.get('tile');
    const teamId = localStorage.getItem('team');
    if (buildType === HOME) {
      Meteor.apply('buildHome', [tile.x, tile.y, teamId], { wait: true });
    } else if (buildType === ROAD) {
      Meteor.apply('buildRoad', [tile.x, tile.y, teamId], { wait: true });
    }
    buildParams.set('show', 0);
  },
  'click': function(event) {
    event.stopImmediatePropagation();
    buildParams.set('show', 0);
  }
});
