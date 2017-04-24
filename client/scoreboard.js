import { Template } from 'meteor/templating';
import { TEAM_COLORS } from '../common/teams';

Template.score.helpers({
  teamClass(index) {
    const myTeam = localStorage.getItem('team');
    return index == myTeam ? 'mine': 'other';
  },
  background(index) {
    const color = TEAM_COLORS[index];
    const str = color.slice(0, 3).map(c => Math.round(c*255)).join(',');
    return `rgb(${str})`;
  }
});
