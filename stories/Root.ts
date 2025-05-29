import { Assets, Container, settings, Ticker } from "pixi.js";

export class Root {
  view = new Container();

  constructor(pixi, create: (root: Root) => void) {
    pixi.appReady.then(async () => {
      await Assets.load("/Oswald.fnt");
      settings.RENDER_OPTIONS!.antialias = true;
      console.log(pixi.app.ticker);

      create(this);
    });
  }

  resize(w: number, h: number) {}

  update(ticker: number) {}

  destroy() {
    // this.view.destroy(true);
  }
}
