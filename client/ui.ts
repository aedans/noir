import { Container } from "pixi.js";

const alphaFactor = .7;

export function interactive(container: Container) {
  container.interactive = true;
  container.alpha = alphaFactor;

  container.on('mouseover', () => container.alpha = 1);
  container.on('mouseout', () => container.alpha = alphaFactor);
}

export async function update(container: Container, update: () => AsyncGenerator<Container, any, any>) {
  const children = [];
  for await (const child of update()) {
    children.push(child);
  }

  container.removeChildren();
  for (const child of children) {
    container.addChild(child);
  }

  return children;
}

export function center(container: Container, within: { width: number, height: number }) {
  container.x = within.width / 2 - container.width / 2;
  container.y = within.height / 2 - container.height / 2;
}

export function left(container: Container, offset = 0) {
  container.x = offset;
}

export function right(container: Container, within: { width: number, height: number }, offset = 0) {
  container.x = within.width - container.width - offset;
}

export function top(container: Container, offset = 0) {
  container.y = offset;
}

export function bottom(container: Container, within: { width: number, height: number }, offset = 0) {
  container.y = within.height - container.height - offset;
}

export function after(after: Container, container: Container, offset = 0) {
  container.x = after.x + after.width + offset;
}

export function below(below: Container, container: Container, offset = 0) {
  container.y = below.y + below.height + offset;
}

export function above(above: Container, container: Container, offset = 0) {
  container.y = above.y - container.height - offset;
}

export function scrollContainer() {
  const container = new Container();
  // container.on('pointermove', (e) => {
  //   console.log(e);
  // })
  return container;
}

export function horizontal(containers: Container[], offset = 0) {
  let x = 0;
  for (const container of containers) {
    container.x = x;
    x += container.width + offset;
  }
}

export function vertical(containers: Container[], offset = 0) {
  let y = 0;
  for (const container of containers) {
    container.y = y;
    y += container.height + offset;
  }
}

export function wrap(containers: Container[], within: { width: number, height: number }, offset = 0) {
  let x = 0, y = 0, maxHeight = 0;
  for (const container of containers) {
    if (x + container.width > within.width - offset) {
      x = 0;
      y += maxHeight + offset;
    }

    container.x = x;
    container.y = y;

    x += container.width + offset;
    maxHeight = Math.max(maxHeight, container.height);
  }
}
