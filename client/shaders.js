
import createShader from 'gl-shader';

export function flatShader(gl) {
  var vs = `
    attribute vec3 position;
    uniform mat4 projection;
    uniform mat4 world;
    uniform mat4 view;

    void main() {
      gl_Position = projection*view*world*vec4(position,1);
    }
  `;

  var fs = `
    precision mediump float;
    uniform vec4 color;

    void main() {
      gl_FragColor = color;
    }
  `;

  return createShader(gl, vs, fs);
}

