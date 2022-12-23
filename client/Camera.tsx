import { CustomPIXIComponent, CustomPIXIComponentBehavior, DisplayObjectProps } from "react-pixi-fiber";
import { Ticker } from "pixi.js";
import { Camera3d } from "pixi-projection";
import React, { Context, MutableRefObject } from "react";
import PIXI from "pixi.js";

export type CameraProps = DisplayObjectProps<PIXI.Container>;

type CustomCameraProps = CameraProps & {
  innerRef: MutableRefObject<Camera3d>;
};

export let targetResolution = {
  width: 4096,
  height: 2160,
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

export const behavior: CustomPIXIComponentBehavior<Camera3d, CustomCameraProps> = {
  customDisplayObject: (props) => new Camera3d(),
  customApplyProps: (instance, oldProps, newProps) => {
    newProps.innerRef.current = instance;
    Ticker.shared.add(() => onResize(instance));
    onResize(instance);
  },
};

const CustomCamera = CustomPIXIComponent(behavior, "Camera");

export const CameraContext = React.createContext(undefined as unknown) as Context<MutableRefObject<Camera3d>>;

export default function Camera(props: CameraProps) {
  const ref = React.useRef() as MutableRefObject<Camera3d>;

  return (
    <CustomCamera {...props} innerRef={ref}>
      <CameraContext.Provider value={ref}>{props.children}</CameraContext.Provider>
    </CustomCamera>
  );
}
