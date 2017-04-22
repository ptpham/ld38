import _ from 'lodash';
import { Mongo } from 'meteor/mongo';
import HexGrid from './hexgrid';

export const Tiles = new Mongo.Collection('tiles');

export const ROAD = 'ROAD';
export const HOME = 'HOME';
export const WORK = 'WORK';
export const TREE = 'TREE';
export const ROCK = 'ROCK';
export const AQUA = 'AQUA';
export const NONE = 'NONE';
