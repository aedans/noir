import { Assets, Container } from "pixi.js";

export class Root {
  view = new Container();

  constructor(appReady, create: (root: Root) => void) {
    appReady.then(async () => {
      await Assets.load("/Oswald.fnt");
      create(this);
    })
  }

  resize(w: number, h: number) {}

  update(ticker: number) {}

  destroy() {
    // this.view.destroy(true);
  }
}
