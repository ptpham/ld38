import { Mongo } from 'meteor/mongo';

export const Teams = new Mongo.Collection('teams');
export const TEAM_COLORS = [
  [0.82, 0.39, 0.31, 1], // red
  [0.41, 0.68, 0.82, 1] // blue
];
