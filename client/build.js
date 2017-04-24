
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { ROAD, HOME, canBuildHome, canBuildRoad } from '../common/tiles';

export const buildParams = new ReactiveDict();

Template.build.helpers({
  buildable() {
    const buildable = [];
    const tile = buildParams.get('tile');
    if (tile) {
      if (canBuildHome(tile)) buildable.push({ id: HOME, name: 'Home' });
      if (canBuildRoad(tile)) buildable.push({ id: ROAD, name: 'Road' });
    }
    return buildable;
  },
  isHidden() {
    const show = buildParams.get('show');
    const tile = buildParams.get('tile');
    const canBuild = tile && (canBuildHome(tile) || canBuildRoad(tile));
    const visible = canBuild && show;
    buildParams.set('show', visible);
    return visible ? 'visible' : '';
  }
});

Template.build.events({
  'click button': function(event) {
    event.stopImmediatePropagation();
    const buildType = event.target.id;
    const tile = buildParams.get('tile');
    if (buildType === HOME) {
      const teamId = localStorage.getItem('team');
      Meteor.apply('buildHome', [tile.x, tile.y, teamId], { wait: true });
    } else if (buildType === ROAD) {
      Meteor.apply('buildRoad', [tile.x, tile.y], { wait: true });
    }
    buildParams.set('show', 0);
  },
  'click': function(event) {
    event.stopImmediatePropagation();
    buildParams.set('show', 0);
  }
});
