import { CLEAR_MODES, Filter, FilterSystem,  RenderTexture } from "./pixi";

const vertex = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec3 rTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform float dx;
uniform float dy;
uniform float dz;

void main(void)
{   
  mat3 xRotationMatrix = mat3(1, 0, 0, 0, cos(dx), -sin(dx), 0, sin(dx), cos(dx));
  mat3 yRotationMatrix = mat3(cos(dy), 0, sin(dy), 0, 1, 0, -sin(dy), 0, cos(dy));
  mat3 zRotationMatrix = mat3(cos(dz), -sin(dz), 0, sin(dz), cos(dz), 0, 0, 0, 1);
  mat3 rotationMatrix = xRotationMatrix * yRotationMatrix * zRotationMatrix;

  vec3 pRelative = (rotationMatrix * vec3((aVertexPosition - .5) * outputFrame.zw, 0.0)) + vec3(0.0, 0.0, 1.0);
  vec2 pAbsolute = (pRelative.xy / pRelative.z) + outputFrame.xy + (outputFrame.zw * 0.5);

  gl_Position = vec4(projectionMatrix * vec3(pAbsolute, 1.0), 1.0);

  vec2 texPosition = aVertexPosition * (outputFrame.zw * inputSize.zw);
  rTextureCoord = vec3(texPosition.xy, 1.0) / pRelative.z;
}`;

const fragment = `
varying vec3 rTextureCoord;

uniform sampler2D uSampler;

void main(void)
{
  gl_FragColor = texture2D(uSampler, (1.0 / rTextureCoord.z) * rTextureCoord.xy);
}
`;

export default class DragFilter extends Filter {
  dx: number = 0;
  dy: number = 0;
  dz: number = 0;

  constructor() {
    super(vertex, fragment);
  }

  apply(
    filterManager: FilterSystem,
    input: RenderTexture,
    output: RenderTexture,
    clearMode?: CLEAR_MODES | undefined
  ): void {
    this.uniforms.dx = this.dx;
    this.uniforms.dy = this.dy;
    this.uniforms.dz = this.dz;
    filterManager.applyFilter(this, input, output, clearMode);
  }
}