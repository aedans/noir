import { CustomPIXIComponent, CustomPIXIComponentBehavior } from "react-pixi-fiber";
import { Ticker } from "pixi.js";
import { Camera3d } from "pixi-projection";

export type CameraProps = {};

export let targetResolution = {
  width: 4096 ,
  height:  2160,
};

export function onResize(camera: Camera3d) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  if (window.innerWidth * 9 > window.innerHeight * 16) {
    width = window.innerHeight * (16 / 9);
  }

  if (window.innerWidth * 9 < window.innerHeight * 16) {
    height = window.innerWidth * (9 / 16);
  }

  camera.position.set((window.innerWidth - width) / 2, (window.innerHeight - height) / 2);
  camera.scale.set(width / targetResolution.width, height / targetResolution.height);
  camera.setPlanes(targetResolution.width / 2, 30, 10000, true);
}

export const behavior: CustomPIXIComponentBehavior<Camera3d, CameraProps> = {
  customDisplayObject: (props) => new Camera3d(),
  customApplyProps: (instance, oldProps, newProps) => {
    instance.sortableChildren = true;
    Ticker.shared.add(() => onResize(instance));
    onResize(instance);
  },
};

export default CustomPIXIComponent(behavior, "Camera");
