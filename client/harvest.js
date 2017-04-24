
import { Template } from 'meteor/templating';
import { Teams } from '../common/teams';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tiles } from '../common/tiles';
import _ from 'lodash';

export var harvestParams = new ReactiveDict();

Template.harvest.helpers({
  isHidden() {
    return harvestParams.get('tileId') == null ? 'hidden' : '';
  },
  leftPos() { return harvestParams.get('clientX'); },
  topPos() { return harvestParams.get('clientY'); },
  resourcesEarned() {
    var tile = Tiles.findOne({ _id: harvestParams.get('tileId') });
    var teamId = localStorage.getItem('team');
    return _.get(tile, 'resources.' + teamId) || 0;
  }
});

