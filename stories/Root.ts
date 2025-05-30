import { Assets, Container, IBaseTextureOptions, settings, Texture, TextureSource } from "pixi.js";

const from = Texture.from;
Texture.from = (
  source: TextureSource | TextureSource[],
  options?: IBaseTextureOptions<any>,
  strict?: boolean
) => {
  return from(Array.isArray(source) ? source.map((x) => `.${x}`) : `.${source}`, options, strict);
};

export class Root {
  view = new Container();

  constructor(pixi, create: (root: Root) => void) {
    pixi.appReady.then(async () => {
      try {
        await Assets.load("./Oswald.fnt");
      } catch (e) {
        console.error(e);
      }

      settings.RENDER_OPTIONS!.antialias = true;

      create(this);
    });
  }

  resize(w: number, h: number) {}

  update(ticker: number) {}

  destroy() {
    // this.view.destroy(true);
  }
}
