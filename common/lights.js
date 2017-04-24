import { Mongo } from 'meteor/mongo';

export const Lights = new Mongo.Collection('lights');
export const LIGHT_CD = 2000;
export const LIGHT_WAIT = 8000;
