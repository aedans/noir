import { AdvancedBloomFilter } from "@pixi/filter-advanced-bloom";
import { SmoothGraphics } from "@pixi/graphics-smooth";
import { Container, filters, Graphics, Rectangle, Sprite } from "pixi.js";
import { Deck } from "../decks";
import { Entity, toEntity, entityContainer } from "../entity";
import { loadImage } from "../loader";
import { createZone, Zone } from "../state";
import { animateTo, targetResolution } from "../ui";

export type FolderStateParams = {
  deck?: Deck,
  polaroid?: Entity & Container,
}

export const folderState = {
  name: "cards",
  scene: "folder",
  instantiate: async () => {
    const desk = await createDesk();
    const folder = await createFolder();
    const camera = await createCamera();
    const ashTray = await createAshTray();

    return {
      state: folderState,
      zones: {
        folder: createFolderZone(),
        deck: createDeckZone(),
        polaroid: createPolaroidZone(),
      },
      children: [desk, folder, camera, ashTray],
      desk, folder, camera, ashTray
    }
  }
}

export function createFolderZone(): Zone {
  const rectangle = new Rectangle(targetResolution.width * .3, targetResolution.height * .25, targetResolution.width * .7, targetResolution.height * .75);
  return createZone(rectangle, async (children) => {
    let row = 0;
    let col = 0;
    const animations: Promise<void>[] = []
    for (const card of children) {
      animations.push(animateTo(card, { x: rectangle.x + col * 225 + (col >= 2 ? 125 : 0), y: rectangle.y + row * 275 }));
      col++;
      if (col >= 4) {
        row++;
        col = 0;
      }
    }
    await Promise.all(animations);
  });
}

export function createPolaroidZone(): Zone {
  const rectangle = new Rectangle(1750, 200 / 1.5, 200, 200);
  return createZone(rectangle, async (children) => {
    const animations: Promise<void>[] = []
    for (const child of children) {
      animations.push(animateTo(child, { x: rectangle.x, y: rectangle.y }));
    }
    await Promise.all(animations);
  });
}

export function createDeckZone(): Zone {
  const polaroid = createPolaroidZone();
  const rectangle = new Rectangle(targetResolution.width * .8, 0, targetResolution.width * .2, targetResolution.height);
  return createZone(rectangle, async (children) => {
    let index = 0;
    const animations: Promise<void>[] = []
    for (const card of children) {
      animations.push(animateTo(card, { x: polaroid.x, y: index * 25 + polaroid.y + 275 }));
      index++;
    }
    await Promise.all(animations)
  });
}

export async function createDesk() {
  const graphics = toEntity(new Graphics());
  graphics.beginFill(0x202020);
  graphics.drawRect(0, 0, targetResolution.width, targetResolution.height);
  graphics.endFill();
  return graphics;
}

export async function createFolder() { 
  const folder = toEntity(Sprite.from(await loadImage("folder.png")), true);
  folder.anchor.set(.5, .5);
  folder.scale.set(.5, .5);
  folder.setHover(1);

  function pageRotation() {
    return (Math.random() - 0.5) / 5;
  }

  const lpage1 = createPage(folder, true, 0xeeeeee, 0);
  const lpage2 = createPage(folder, true, 0xdddddd, pageRotation());
  const lpage3 = createPage(folder, true, 0xcccccc, pageRotation());
  const rpage1 = createPage(folder, false, 0xeeeeee, 0);
  const rpage2 = createPage(folder, false, 0xdddddd, pageRotation());
  const rpage3 = createPage(folder, false, 0xcccccc, pageRotation());

  const container = entityContainer(new Container());
  container.addChild(folder, lpage3, rpage3, lpage2, rpage2, lpage1, rpage1);
  container.position.set(targetResolution.width / 2 + 50, targetResolution.height / 2);
  return container;
}

export function createPage(folder: Sprite & Entity, left: boolean, color: number, rotation: number) {
  const page = toEntity(new SmoothGraphics(), true);
  const folderWidth = folder.width - 50;
  const x = left ? folderWidth / -4 : folderWidth / 4;
  page.beginFill(color, 1.0, true);
  page.drawRect(0, 0, folderWidth / 2 - 50, folder.height - 50);
  page.pivot.set(page.width / 2, page.height / 2);
  page.position.set(x - 25, 0);
  page.rotation = rotation;
  page.setHover(.5);
  return page;
}

export async function createCamera() {
  const camera = toEntity(Sprite.from(await loadImage("camera.png")), true);
  camera.setHover(1);
  camera.scale.set(.5, .5);
  camera.position.set(0, 0);
  return camera;
}

export async function createAshTray() {
  const base = toEntity(Sprite.from(await loadImage("ashtray_base.png")), true);
  base.pivot.set(.5, .5);
  base.scale.set(.5, .5)
  base.setHover(1);

  const cigarettes = toEntity(Sprite.from(await loadImage("ashtray_cigarettes.png")), true);
  cigarettes.pivot.set(.5, .5);
  cigarettes.scale.set(.5, .5);
  cigarettes.setHover(1);

  const bloom = toEntity(Sprite.from("ashtray_bloom.png"));
  bloom.pivot.set(.5, .5);
  bloom.scale.set(.5, .5);
  const bloomFilter = new AdvancedBloomFilter({
    threshold: 0,
    bloomScale: 5,
    quality: 10,
  });
  const colorFilter = new filters.ColorMatrixFilter();
  colorFilter.tint(0xf56f00, false);
  bloom.filters = [colorFilter, bloomFilter];

  const ashtray = entityContainer(new Container());
  ashtray.addChild(base, cigarettes, bloom);
  ashtray.position.set(0, targetResolution.height - 400);
  return Object.assign(ashtray, {
    update: (time: number) => {
      bloomFilter.bloomScale = 5 + (2 * Math.sin(3 * Math.sin(time / 50)));
    }
  });
}
