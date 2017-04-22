
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

function resizeCanvas(gl, canvas) {
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  var { width, height } = canvas;
  gl.viewport(0, 0, width, height);
}

function makeHex(gl) {
  var positions = [vec3.create()].concat(_.times(6, i => {
    var angle = 2*i*Math.PI/6 + Math.PI/6;
    return vec3.fromValues(0.5*Math.cos(angle), 0.5*Math.sin(angle), 0);
  }));

  var cells = _.times(6, i => [0,i+1, (i+1)%6+1]);
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
    this.hex = makeHex(gl);

    this.view = mat4.create();
    this.projection = mat4.create();
    this.world = mat4.create();

    this.hexgrid = new HexGrid(vec3.fromValues(RADIUS_COS30,0));
  }
  draw() {
    var { gl, canvas, shader, camera, hex}  = this;
    resizeCanvas(gl, canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var view = camera.view(this.view);
    var projection = mat4.perspective(this.projection,
          Math.PI/4, canvas.width/canvas.height, 1, 100);

    hex.bind(shader);
    shader.uniforms.view = view;
    shader.uniforms.projection = projection;

    Tiles.find().forEach(tile => {
      this.hexgrid.center(_v3_0, tile.x, tile.y);
      _v3_0[2] = 0;

      shader.uniforms.world = mat4.fromTranslation(this.world, _v3_0);
      shader.uniforms.color = [0.7,0.7,0.7,1];
      hex.draw(gl.TRIANGLES);
    });
  }
}

