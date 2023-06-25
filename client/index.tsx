import { Application, Loader, MIPMAP_MODES, settings } from "pixi.js";

settings.RENDER_OPTIONS.antialias = true;
settings.ANISOTROPIC_LEVEL = 16;
settings.MIPMAP_TEXTURES = MIPMAP_MODES.ON;
settings.SORTABLE_CHILDREN = true;

Loader.shared.add("Oswald", "/Oswald.fnt").load(() => {
  const canvasElement = document.getElementById("canvas") as HTMLCanvasElement;

  const app = new Application({
    view: canvasElement,
    width: window.screen.width,
    height: window.screen.height,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  import("./store").then((store) => {
    store.updateLocalStorage();
  });

  Promise.all([import("./Noir"), import("react"), import("react-pixi-fiber")]).then(([Noir, React, fiber]) => {
    fiber.render(<Noir.default app={app} />, app.stage);
  });
});
