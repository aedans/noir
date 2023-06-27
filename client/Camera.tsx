import { Graphics, Ticker } from "./pixi.js";
import { Camera3d } from "pixi-projection";
import React, { Context, MutableRefObject, ReactNode } from "react";
import { PixiComponent, applyDefaultProps } from "@pixi/react";

export type CameraProps = {
  children: ReactNode;
};

export let targetResolution = {
  width: 4096,
  height: 2160,
};

const mask = new Graphics();
mask.alpha = 0;
mask.beginFill(0xffffff);
mask.drawRect(0, 0, targetResolution.width, targetResolution.height);
mask.endFill();

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

export const CameraContext = React.createContext(undefined as unknown) as Context<MutableRefObject<Camera3d>>;

const CustomCamera = PixiComponent("CustomCamera", {
  create() {
    const instance = new Camera3d();
    Ticker.shared.add(() => onResize(instance));
    onResize(instance);
    instance.addChild(mask);
    instance.mask = mask;
    return instance;
  },
  applyProps(instance, oldProps, newProps) {
    applyDefaultProps(instance, oldProps, newProps);
  },
});

export default function Camera(props: CameraProps) {
  const ref = React.useRef() as MutableRefObject<Camera3d>;

  return (
    <CustomCamera innerRef={ref}>
      <CameraContext.Provider value={ref}>{props.children}</CameraContext.Provider>
    </CustomCamera>
  );
}
