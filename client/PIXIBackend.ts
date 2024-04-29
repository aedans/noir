import { GlowFilter } from "@pixi/filter-glow";
import anime from "animejs";
import { BackendFactory, DragDropManager } from "dnd-core";
import { Application, DisplayObject, Sprite, Texture, Ticker } from "./pixi.js";
import DragFilter from "./DragFilter.js";

type Identifier = string | symbol;

const reticleTexture = Texture.from("/reticle.png");

const PIXIBackend: (app: Application) => BackendFactory = (app: Application) => (manager: DragDropManager) => {
  let currentObject: DisplayObject | null = null;
  let targetObjects: { [id: Identifier]: DisplayObject } = {};

  function dragify(sourceId: Identifier, node: DisplayObject, reticle: DisplayObject) {
    let ddx = 0;
    let ddy = 0;
    let initIndex: number | null = null;
    let initVisible: boolean | null;

    const filter = new DragFilter();
    if (!reticle.filters) {
      reticle.filters = [filter];
    } else {
      reticle.filters.push(filter);
    }

    function mouseDownListener(e: any) {
      if (currentObject == null) {
        currentObject = reticle;
        initIndex = node.zIndex;
        initVisible = reticle.visible;
        node.zIndex = 10000;
        node.parent.sortChildren();

        if (!manager.getMonitor().isDragging()) {
          manager.getActions().beginDrag([sourceId], {
            clientOffset: { ...e.data.global },
            getSourceClientOffset: () => null,
          });
        }
      }
    }

    function mouseMoveListener(e: MouseEvent) {
      if (currentObject == reticle) {
        anime.remove(reticle.transform.position);
        ddx += e.x - reticle.toGlobal({ x: 0, y: 0 }).x;
        ddy += e.y - reticle.toGlobal({ x: 0, y: 0 }).y;
        reticle.visible = true;

        const pos = reticle.parent.toLocal(e);
        if (manager.getMonitor().isDragging()) {
          reticle.position.copyFrom(pos);
        }

        const matchingTargetIds = Object.keys(targetObjects)
          .filter((key) => targetObjects[key].getBounds().contains(e.x, e.y) && targetObjects[key].zIndex < 1000)
          .filter((key) => manager.getRegistry().getTargetType(key) == manager.getMonitor().getItemType());

        if (matchingTargetIds.length > 0) {
          matchingTargetIds.sort((a, b) => targetObjects[b].zIndex - targetObjects[a].zIndex);
          manager.getActions().hover([matchingTargetIds[0]]);
        } else {
          manager.getActions().hover([]);
        }
      }
    }

    function mouseUpListener() {
      if (currentObject == reticle && manager.getMonitor().isDragging()) {
        currentObject = null;
        manager.getActions().drop();

        if (initVisible != null) {
          reticle.visible = initVisible;
        }

        if (initIndex != null) {
          node.zIndex = initIndex;
          node.parent.sortChildren();
        }

        manager.getActions().endDrag();
      }
    }

    function onTick() {
      ddx *= 0.95;
      ddy *= 0.95;

      ddx = Math.max(-50, Math.min(ddx, 50));
      ddy = Math.max(-50, Math.min(ddy, 50));

      const inv = 150;
      if (node == reticle) {
        filter.dx = -ddy / inv;
        filter.dy = ddx / inv;
      }
    }

    node.addListener("mousedown", mouseDownListener);
    window.addEventListener("mousemove", mouseMoveListener);
    window.addEventListener("mouseup", mouseUpListener);
    Ticker.shared.add(onTick);

    return () => {
      node.removeListener("mousedown", mouseDownListener);
      window.removeEventListener("mousemove", mouseMoveListener);
      window.removeEventListener("mouseup", mouseUpListener);
      Ticker.shared.remove(onTick);
      mouseUpListener();
    };
  }

  return {
    setup: () => {},
    teardown: () => {},
    profile: () => ({}),
    connectDropTarget: (targetId: Identifier, node: DisplayObject, options: any) => {
      targetObjects[targetId] = node;

      return () => {
        delete targetObjects[targetId];
      };
    },
    connectDragSource: (sourceId: Identifier, node: DisplayObject) => {
      return dragify(sourceId, node, node);
    },
    connectDragPreview: (sourceId: Identifier, node: DisplayObject) => {
      var reticle = new Sprite(reticleTexture);
      reticle.width = 100;
      reticle.height = 100;
      reticle.anchor.set(0.5);
      reticle.visible = false;
      reticle.filters = [new GlowFilter({ color: 0x767676, quality: 0.2 })];
      app.stage.addChild(reticle);
      return dragify(sourceId, node, reticle);
    },
  };
};

export default PIXIBackend;
