import { Texture } from "pixi.js";
import { app } from ".";

export function loadImage(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    if (app.loader.resources[url]) {
      resolve(app.loader.resources[url].texture!);
    } else {
      app.loader.add(url, url, () => {
        resolve(app.loader.resources[url].texture!);
      });
      app.loader.load();  
    }
  });
}