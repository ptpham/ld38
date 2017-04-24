import { Mongo } from 'meteor/mongo';

export const Teams = new Mongo.Collection('teams');
export const TEAM_COLORS = [
  [0.97, 0.49, 0.14, 1], // red-orange
  [0.41, 0.68, 0.82, 1]  // blue
];
