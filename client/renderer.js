
import { flatShader } from './shaders';
import { Camera } from './camera';
import createGeometry from 'gl-geometry';
import { vec3, mat4 } from 'gl-matrix';
import { Tiles } from '../common/tiles';
import HexGrid from '../common/hexgrid';
import _ from 'lodash';

var _v3_0 = vec3.create();
const RADIUS = 1;
const RADIUS_COS30 = RADIUS*Math.cos(Math.PI/6);
var ROAD_SCALE = 0.4;
var matRoadScale = mat4.fromScaling(mat4.create(), _.times(3, () => ROAD_SCALE));

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

    this.view = mat4.create();
    this.projection = mat4.create();
    this.world = mat4.create();

    this.hexgrid = new HexGrid(vec3.fromValues(RADIUS_COS30,0));
    this.highlight = null;
  }
  draw() {
    var { gl, canvas, shader, camera, hex, disk, rect }  = this;
    resizeCanvas(gl, canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var view = camera.view(this.view);
    var projection = mat4.perspective(this.projection,
          Math.PI/4, canvas.width/canvas.height, 1, 100);

    // Render hex tiles
    hex.bind(shader);
    shader.uniforms.view = view;
    shader.uniforms.projection = projection;
    _v3_0[2] = 0;

    Tiles.find().forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);

      var color = [0.92,0.9,0.9,1];
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
    Tiles.find().forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      shader.uniforms.world = mat4.translate(this.world, matRoadScale, _v3_0);
      disk.draw(gl.TRIANGLES);
    });

    rect.bind(shader);
    Tiles.find().forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      shader.uniforms.world = mat4.translate(this.world, matRoadScale, _v3_0);
      rect.draw(gl.TRIANGLES);
    });
  }
}

