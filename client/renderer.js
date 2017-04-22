
import { flatShader } from './shaders';
import { Camera } from './camera';
import createGeometry from 'gl-geometry';
import { vec3, mat4 } from 'gl-matrix';
import _ from 'lodash';

function resizeCanvas(gl, canvas) {
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  var { width, height } = canvas;
  gl.viewport(0, 0, width, height);
}

function makeHex(gl) {
  var positions = [vec3.create()].concat(_.times(6, i => {
    var angle = 2*i*Math.PI/6;
    return vec3.fromValues(Math.cos(angle), Math.sin(angle), 0);
  }));

  var cells = _.times(6, i => [0,i+1, (i+1)%6+1]);
  console.log(positions, cells);
  return createGeometry(gl).attr('positions', { positions, cells });
}

export class Renderer {
  constructor(canvas) {
    var gl = canvas.getContext('webgl');
    var camera = new Camera();
    camera.phi += Math.PI/4;
    camera.theta -= Math.PI/2;
    camera.radius = 5;
   
    this.gl = gl;
    this.canvas = canvas;
    this.camera = camera;
    this.shader = flatShader(gl);
    this.hex = makeHex(gl);
  }
  draw() {
    var { gl, canvas, shader, camera, hex}  = this;
    resizeCanvas(gl, canvas);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var view = camera.view(mat4.create());
    var projection = mat4.perspective(mat4.create(),
          Math.PI/4, canvas.width/canvas.height, 0.1, 10);
    var world = mat4.create();

    hex.bind(shader);
    shader.uniforms.view = view;
    shader.uniforms.projection = projection;
    shader.uniforms.world = world;
    hex.draw(gl.TRIANGLES);
  }
}

