import { Container } from "pixi.js";

export class Root {
  view = new Container();

  constructor(pixi, create: (root: Root) => void) {
    pixi.appReady.then(async () => {
      create(this);
    });
  }

  resize(w: number, h: number) {}

  update(ticker: number) {}

  destroy() {
    // this.view.destroy(true);
  }
}
