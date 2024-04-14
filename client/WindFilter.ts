import { CLEAR_MODES, Filter, FilterSystem, ISpriteMaskTarget, Matrix, RenderTexture } from "./pixi";

const vertex = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
  vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

  return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
  return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;

const fragment = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;

void main(void)
{
  if (vFilterCoord.y > .3) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  } else {
    float currentWind = sin(time * .5) + 5.;

    float xSideDistance = pow(max(vFilterCoord.y - .1, 0.), 2.);
    float xOffset = (sin(time * 4.) - .5) * xSideDistance * currentWind * .1;
  
    float ySideDistance = min(vFilterCoord.x, 1. - vFilterCoord.x);
    float yOffset = sin((time * 3.) - vFilterCoord.x * 5.) * ySideDistance * currentWind * .002;
  
    gl_FragColor = texture2D(uSampler, vTextureCoord + vec2(xOffset, yOffset));  
  }
}
`;
const start = new Date().valueOf();

export default class WindFilter extends Filter {
  sprite: ISpriteMaskTarget;
  matrix: Matrix;

  constructor() {
    super(vertex, fragment, {
      time: (new Date().valueOf() - start) / 1000,
    });
  }

  setSprite(sprite: ISpriteMaskTarget) {
    this.sprite = sprite;
    this.matrix = new Matrix();
  }

  apply(
    filterManager: FilterSystem,
    input: RenderTexture,
    output: RenderTexture,
    clearMode?: CLEAR_MODES | undefined
  ): void {
    this.uniforms.filterMatrix = filterManager.calculateSpriteMatrix(this.matrix, this.sprite);
    this.uniforms.time = (new Date().valueOf() - start) / 1000;

    filterManager.applyFilter(this, input, output, clearMode);
  }
}
