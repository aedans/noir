import { Graphics, Ticker } from "pixi.js";
import { camera } from ".";

export let targetResolution = {
  width: 1920,
  height: 1080,
};

export default class ResizeManager {
  mask: Graphics;

  constructor() {
    this.mask = new Graphics();
    this.mask.beginFill(0);
    this.mask.drawRect(0, 0, 1, 1);
    this.mask.endFill();

    Ticker.shared.add(() => this.onResize());
  }

  screenToTarget(x: number, y: number) {
    return {
      x: (x - this.mask.x) / (this.mask.width / targetResolution.width),
      y: (y - this.mask.y) / (this.mask.height / targetResolution.height),
    };
  }

  onResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (window.innerWidth * 9 > window.innerHeight * 16) {
      width = window.innerHeight * (16 / 9);
    }
  
    if (window.innerWidth * 9 < window.innerHeight * 16) {
      height = window.innerWidth * (9 / 16);
    }
  
    camera.position.set(
      (window.innerWidth - width) / 2,
      (window.innerHeight - height) / 2
    );
  
    camera.scale.set(
      width / targetResolution.width,
      height / targetResolution.height
    );
  
    this.mask.position.set(camera.x, camera.y);
    this.mask.scale.set(width, height);
    camera.mask = this.mask;
  
    camera.setPlanes(targetResolution.width / 2, 30, 10000, true);
  }
}
