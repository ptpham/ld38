
import { flatShader } from './shaders';
import { Camera } from './camera';
import createGeometry from 'gl-geometry';
import { vec3, mat4 } from 'gl-matrix';
import { Tiles, ROAD, WORK, HOME, TREE, AQUA, ROCK } from '../common/tiles';
import { Cars } from '../common/cars';
import { Teams } from '../common/teams';
import { Lights } from '../common/lights';
import Lanes from './lanes';
import HexGrid from '../common/hexgrid';
import { Mesh } from 'webgl-obj-loader';
import carGeometry from './geometry/car';
import houseGeometry from './geometry/house';
import officeGeometry from './geometry/office';
import treeGeometry from './geometry/tree';
import rockGeometry from './geometry/rock';
import _ from 'lodash';

var _v3_0 = vec3.create();
var _v3_1 = vec3.create();
const RADIUS = 1;
const RADIUS_COS30 = RADIUS*Math.cos(Math.PI/6);
var ROAD_SCALE = 0.3;
var CAR_SCALE = 0.12;
var ROAD_SCALING = _.times(3, () => ROAD_SCALE);
var CAR_MESH = new Mesh(carGeometry);
var HOUSE_MESH = new Mesh(houseGeometry);
var OFFICE_MESH = new Mesh(officeGeometry);
var TREE_MESH = new Mesh(treeGeometry);
var ROCK_MESH = new Mesh(rockGeometry);
var HOUSE_SCALINGS = [[0.15, 0.2, 0.2],[0.2,0.15,0.2],[0.2,0.2,0.15]];
var OFFICE_SCALINGS = [[0.3, 0.4, 0.5],[0.3,0.3,0.4],[0.4,0.6,0.3]];
var TREE_SCALINGS = [[0.2, 0.2, 0.2],[0.2,0.2,0.3],[0.15,0.15,0.4]];
var ROCK_SCALINGS = [[0.1, 0.1, 0.1],[0.2,0.1,0.2],[0.1,0.2,0.2]];
var DEGREES_60 = Math.PI/3;

function resizeCanvas(gl, canvas) {
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  var { width, height } = canvas;
  gl.viewport(0, 0, width, height);
}

function makeCircle(gl, sides) {
  sides = sides || 6;
  var positions = [vec3.create()].concat(_.times(sides, i => {
    var angle = 2*i*Math.PI/sides + Math.PI/sides;
    return vec3.fromValues(0.5*Math.cos(angle), 0.5*Math.sin(angle), 0);
  }));

  var cells = _.times(sides, i => [0,i+1, (i+1)%sides+1]);
  return createGeometry(gl).attr('positions', { positions, cells });
}

export class Renderer {
  constructor(canvas) {
    var gl = canvas.getContext('webgl');
    var camera = new Camera();
    camera.phi += Math.PI/4;
    camera.theta -= Math.PI/2;
    camera.radius = 10;

    this.gl = gl;
    this.canvas = canvas;
    this.camera = camera;
    this.shader = flatShader(gl);
    this.hex = makeCircle(gl);
    this.disk = makeCircle(gl, 16);
    this.rect = createGeometry(gl).attr('positions', {
      positions: [[0,-0.5,0],[0,0.5,0],
        [RADIUS_COS30*0.5/ROAD_SCALE,0.5,0],
        [RADIUS_COS30*0.5/ROAD_SCALE,-0.5,0]],
      cells: [[0,1,2],[0,2,3]]
    });
    this.car = createGeometry(gl)
      .attr('positions', CAR_MESH.vertices)
      .faces(CAR_MESH.indices);
    this.house = createGeometry(gl)
      .attr('positions', HOUSE_MESH.vertices)
      .faces(HOUSE_MESH.indices);
    this.tree = createGeometry(gl)
      .attr('positions', TREE_MESH.vertices)
      .faces(TREE_MESH.indices);
    this.office = createGeometry(gl)
      .attr('positions', OFFICE_MESH.vertices)
      .faces(OFFICE_MESH.indices);
    this.rock = createGeometry(gl)
      .attr('positions', ROCK_MESH.vertices)
      .faces(ROCK_MESH.indices);

    this.view = mat4.create();
    this.projection = mat4.create();
    this.world = mat4.create();

    this.hexgrid = new HexGrid(vec3.fromValues(RADIUS_COS30,0));
    this.lanes = new Lanes(this.hexgrid, CAR_SCALE);
    this.highlight = null;
  }
  draw() {
    var { gl, car, house, office, tree, rock, canvas, shader, camera, hex, disk, rect }  = this;
    resizeCanvas(gl, canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    var view = camera.view(this.view);
    var projection = mat4.perspective(this.projection,
          Math.PI/4, canvas.width/canvas.height, 1, 100);

    // Render hex tiles
    hex.bind(shader);
    shader.uniforms.view = view;
    shader.uniforms.projection = projection;

    Tiles.find().forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      _v3_0[2] = 0;

      var color = [0.92,0.9,0.9,1];
      if (tile.type == WORK) {
        color = [0, 1, 0, 1];
      } else if (tile.type == HOME) {
        color = [0, 0, 1, 1];
      } else if (tile.type == AQUA) {
        color = [0.70, 0.9, 0.95, 1];
        vec3.set(_v3_1, 0, 0, -0.03);
        vec3.add(_v3_0, _v3_0, _v3_1);
      }
      if (this.highlight != null
        && this.highlight[0] == tile.x && this.highlight[1] == tile.y) {
        color[0] = 1;
      }

      shader.uniforms.world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.color = color;
      hex.draw(gl.TRIANGLES);
    });

    // Render road centers
    disk.bind(shader);
    shader.uniforms.color = [0.5, 0.5, 0.5, 1];
    _v3_0[2] = 0.0001;
    Tiles.find({ type: ROAD }).forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, ROAD_SCALING);
      disk.draw(gl.TRIANGLES);
    });

    rect.bind(shader);
    Tiles.find({ type: ROAD }).forEach(tile => {
      const adjTiles = tile.paths.map(id => Tiles.findOne(id));
      adjTiles.forEach(tileA => {
        if (tileA == null) return;
        const orient = HexGrid.orientation(tile.x, tile.y, tileA.x, tileA.y);
        this.hexgrid.center(_v3_0, tile.x, tile.y);
        var world = mat4.fromTranslation(this.world, _v3_0);
        mat4.scale(world, world, ROAD_SCALING);
        mat4.rotateZ(world, world, DEGREES_60 * orient);
        shader.uniforms.world = world;
        rect.draw(gl.TRIANGLES);
      });
    });

    // Render lights
    disk.bind(shader);
    shader.uniforms.color = [1, 0.2, 0.3, 0.7];
    Lights.find().forEach((light) => {
      var shift = HexGrid.shifts[light.closed];
      this.hexgrid.center(_v3_0,
        light.x + shift[0] * .3,
        light.y + shift[1] * .3
      );
      _v3_0[2] = 0.0002;
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, ROAD_SCALING);
      disk.draw(gl.TRIANGLES);
    });

    // Render cars
    this.car.bind(shader);
    Cars.find().forEach(car => {
      var tile = Tiles.findOne({ _id: car.currentTileId });
      if (tile == null) return;
      shader.uniforms.color = Teams.findOne({ index: car.teamId }).color;
      shader.uniforms.world = this.lanes.applyLaneTransform(this.world,
        car._id, tile.x, tile.y, car.orientation, car.leaving);
      this.car.draw(gl.TRIANGLES);
    });

    _v3_0[2] = 0;
    house.bind(shader);
    shader.uniforms.color = [0.9, 0.9, 1, 1];
    Tiles.find({ type: HOME }).forEach((tile, i) => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, HOUSE_SCALINGS[i % 3]);
      house.draw(gl.TRIANGLES);
    });

    office.bind(shader);
    shader.uniforms.color = [0.9, 1, 0.9, 1];
    Tiles.find({ type: WORK }).forEach((tile, i) => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, OFFICE_SCALINGS[i % 3]);
      office.draw(gl.TRIANGLES);
    });

    tree.bind(shader);
    shader.uniforms.color = [0.2, 0.5, 0.3, 1];
    Tiles.find({ type: TREE }).forEach((tile, i) => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, TREE_SCALINGS[i % 3]);
      tree.draw(gl.TRIANGLES);
    });

    rock.bind(shader);
    shader.uniforms.color = [0.5, 0.5, 0.5, 1];
    Tiles.find({ type: ROCK }).forEach((tile, i) => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      var world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.world = mat4.scale(world, world, ROCK_SCALINGS[i % 3]);
      rock.draw(gl.TRIANGLES);
    });
  }
}

