import { Template } from 'meteor/templating';
import { Teams } from '../common/teams';

Template.body.helpers({
  teams() { return Teams.find(); }
});

Template.score.helpers({
  teamClass(index) {
    const myTeam = localStorage.getItem('team');
    return index == myTeam ? 'mine': 'other';
  },
  background(color) {
    const str = color.slice(0, 3).map(c => Math.round(c*255)).join(',');
    return `rgb(${str})`;
  }
});
