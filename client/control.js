
import { vec3, mat4 } from 'gl-matrix';
import { Meteor } from 'meteor/meteor';
import { Tiles, ROAD, WORK } from '../common/tiles';
import { Lights } from '../common/lights';
import { harvestParams } from './harvest';
import { buildParams } from './build';
import HexGrid from '../common/hexgrid';
import _ from 'lodash';

var _v3_0 = vec3.create();
var _v3_1 = vec3.create();
var _v3_2 = vec3.create();
var rot90 = mat4.fromZRotation(mat4.create(), Math.PI/2);

export class Control {
  constructor(renderer) {
    this.renderer = renderer;
    this.camera = renderer.camera;
    this.hexgrid = renderer.hexgrid;
    this.mousedown = this.mousedown.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mouseup = this.mouseup.bind(this);
    this.mouseWorld = vec3.create();
    this.mouseScreen = vec3.create();
    this.invview = mat4.create();
    this.invproj = mat4.create();
    this.invcam = mat4.create();
  }

  screenToPlane(result, clientX, clientY) {
    var invproj = mat4.invert(this.invproj, this.renderer.projection);
    var invview = mat4.invert(this.invview, this.renderer.view);
    var invcam = mat4.multiply(this.invcam, invview, invproj);

    var widthX = document.body.offsetWidth;
    var heightY = document.body.offsetHeight;
    vec3.set(this.mouseScreen, 2*clientX/widthX-1, -2*clientY/heightY+1, -1);
    vec3.transformMat4(this.mouseWorld, this.mouseScreen, invcam);

    var eye = this.camera._eye;
    vec3.sub(_v3_0, this.mouseWorld, eye);
    var t = -eye[2] / _v3_0[2];
    var x = eye[0] + t*_v3_0[0];
    var y = eye[1] + t*_v3_0[1];
  
    result[0] = x;
    result[1] = y;
    return result;
  }

  screenToHex(clientX, clientY) {
    this.screenToPlane(_v3_2, clientX, clientY);
    return this.hexgrid.lookup(_v3_1, _v3_2[0], _v3_2[1]);
  }

  moved() {
    return Math.abs(this.lastX - this.firstX) > 10 ||
      Math.abs(this.lastY - this.firstY) > 10;
  }

  mousedown(e) {
    this.firstX = e.clientX;
    this.firstY = e.clientY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  mousemove(e) {
    var mouseHit = this.screenToPlane(this.renderer.mouseHit, e.clientX, e.clientY);
    var highlight = this.hexgrid.lookup(this.renderer.highlight,
      mouseHit[0], mouseHit[1]);

    var tile = Tiles.findOne({ x: highlight[0], y: highlight[1] });
    var light = Lights.findOne({ x: highlight[0], y: highlight[1] });
    if (light != null) {
      var best = Infinity, orientation = null;
      for (var otherId of tile.paths) {
        var other = Tiles.findOne({ _id: otherId });
        var center = this.hexgrid.center(_v3_0, other.x, other.y);
        var distance = vec3.distance(center, mouseHit);
        var currentOrientation = HexGrid.orientation(tile.x, tile.y, other.x, other.y);
        if (other.type == ROAD && distance < best && currentOrientation != light.closed) {
          orientation = currentOrientation;
          best = distance;
        }
      }
      if (orientation != null) {
        this.renderer.proposeLight = orientation;
      } else {
        this.renderer.proposeLight = null;
      }
    }

    if (tile != null) {
      let team = localStorage.getItem('team');

      if (tile.type == WORK) {
        harvestParams.set('clientX', e.clientX);
        harvestParams.set('clientY', e.clientY);
        harvestParams.set('money', _.get(tile, 'resources.' + team) || 0);
      } else {
        harvestParams.set('money', -1);
      }
    }

    if (this.lastX == null) return;
    var deltaX = this.lastX - e.clientX;
    var deltaY = this.lastY - e.clientY;

    if (e.shiftKey) {
      this.camera.theta += deltaX / 100;
      this.camera.phi += deltaY / 100;
    } else {
      var forward = this.camera.forward(_v3_0);
      forward[2] = 0;

      var side = vec3.transformMat4(_v3_1, forward, rot90);
      vec3.scale(forward, forward, deltaY/(vec3.length(forward)*100));
      vec3.scale(side, side, deltaX/(vec3.length(side)*100));
      vec3.add(_v3_0, _v3_0, _v3_1);
      this.camera.translate(_v3_0);
    }
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  mouseup(e) {
    if (!this.moved()) {
      const coords = this.screenToHex(this.lastX, this.lastY);
      const tile = Tiles.findOne({ x: coords[0], y: coords[1] });
      this.perform(tile);
    }
    delete this.lastX;
    delete this.lastY;
    delete this.firstX;
    delete this.firstY;
  }

  perform(tile) {
    if (!tile) return;
    if (tile.type === ROAD && this.renderer.proposeLight != null) {
      var args = [tile.x, tile.y, this.renderer.proposeLight];
      Meteor.apply('switchLight', args, { wait: true });
    } else if (!buildParams.get('show')) {
      buildParams.set('tile', tile);
      buildParams.set('show', true);
    }
  }

  addListeners() {
    document.addEventListener('mousedown', this.mousedown);
    document.addEventListener('mousemove', this.mousemove);
    document.addEventListener('mouseup', this.mouseup);
  }
}

