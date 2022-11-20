import { targetResolution } from "./ResizeManager";
import TextEntity from "./TextEntity";

export default class ButtonEntity extends TextEntity {
  constructor(text: string, click: () => void, options?: Partial<ButtonEntity>) {
    super(text, {
      fontName: "Oswald",
      fontSize: 74,
    });

    this.x = targetResolution.width / 2;
    this.anchor.set(0.5, 0.5);
    this.interactive = true;
    // this.setHover(2);

    // this.on('mouseover', () => animateTime(5, (t) => this.scale.set(lerp(this.scale.x, 1.25, t))));
    // this.on('mouseout', () => animateTime(5, (t) => this.scale.set(lerp(this.scale.x, 1.0, t))));
    this.on("pointerdown", () => click());

    Object.assign(this, options);
  }
}
