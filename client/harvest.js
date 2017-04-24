
import { Template } from 'meteor/templating';
import { Teams } from '../common/teams';
import { ReactiveDict } from 'meteor/reactive-dict';

export var harvestParams = new ReactiveDict();

Template.harvest.helpers({
  isHidden() { return harvestParams.get('money') >= 0 ? '' : 'hidden'; },
  leftPos() { return harvestParams.get('clientX'); },
  topPos() { return harvestParams.get('clientY'); },
  resourcesEarned() { return harvestParams.get('money'); }
});

