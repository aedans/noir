import type { Preview } from "@storybook/html";
import { Assets, IBaseTextureOptions, settings, Texture, TextureSource } from "pixi.js";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    pixi: {
      // these are passed as options to `PIXI.Application` when instantiated by the
      // renderer
      applicationOptions: {
        backgroundColor: 0x111111,
        resolution: 1,
      },
      // optional, if you want to provide custom resize logic, pass a function here,
      // if nothing is provided, the default resize function is used, which looks like
      // this, where w and h will be the width and height of the storybook canvas.
      resizeFn: (w, h) => {
        return {
          rendererWidth: w,
          rendererHeight: h,
          canvasWidth: w,
          canvasHeight: h,
        };
      },
    },
  },
  loaders: [
    async () => {
      Assets.load("./Oswald.fnt");
      settings.RENDER_OPTIONS!.antialias = true;

      const rootPrefix = (str: TextureSource) => typeof str != "string" ? str : str.startsWith('.') ? `${str}` : `.${str}`;
      const from = Texture.from;
      Texture.from = (source: TextureSource | TextureSource[], options?: IBaseTextureOptions<any>, strict?: boolean) => {
        return from(Array.isArray(source) ? source.map((x) => rootPrefix(x)) : rootPrefix(source), options, strict);
      };
    },
  ],
};

export default preview;
