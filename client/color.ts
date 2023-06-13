export const colorlessColor = 0x767676;
export const orangeColor = 0xeb6300;
export const blueColor = 0x0087eb;
export const greenColor = 0x12eb00;
export const purpleColor = 0xd800eb;

export const dayColor = 0xfff2bd;
export const afternoonColor = 0xe68eb3;
export const nightColor = 0x9681cc;
export const morningColor = 0xe68f73;

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export function getRGB(color: number): RGB {
  return {
    r: (color & 0xff0000) >> 16,
    g: (color & 0x00ff00) >> 8,
    b: color & 0x0000ff,
  };
}

export function getColor(color: RGB): number {
  return (color.r << 16) | (color.g << 8) | color.b;
}
