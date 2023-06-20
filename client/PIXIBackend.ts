import { GlowFilter } from "@pixi/filter-glow";
import anime from "animejs";
import { BackendFactory, DragDropManager } from "dnd-core";
import { IDisplayObject3d } from "pixi-projection";
import { Application, DisplayObject, Sprite, Texture, Ticker } from "pixi.js";

type Identifier = string | symbol;
type DisplayObject3d = DisplayObject & Partial<IDisplayObject3d>;

const reticleTexture = Texture.from("/reticle.png");

const PIXIBackend: (app: Application) => BackendFactory = (app: Application) => (manager: DragDropManager) => {
  let currentObject: DisplayObject3d | null = null;
  let targetObjects: { [id: Identifier]: DisplayObject3d } = {};

  function dragify(sourceId: Identifier, node: DisplayObject3d, reticle: DisplayObject) {
    let ddx = 0;
    let ddy = 0;
    let initIndex: number | null = null;
    let initVisible: boolean | null;

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
        ddx += e.x - reticle.getGlobalPosition().x;
        ddy += e.y - reticle.getGlobalPosition().y;
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
      if (manager.getMonitor().isDragging()) {
        ddx *= 0.9;
        ddy *= 0.9;
      } else {
        ddx = ddy = 0;
      }

      ddx = Math.max(-50, Math.min(ddx, 50));
      ddy = Math.max(-50, Math.min(ddy, 50));

      if (node.euler && node == reticle) {
        node.euler.yaw = ddx / 100;
        node.euler.pitch = -ddy / 100;
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
    connectDropTarget: (targetId: Identifier, node: DisplayObject3d, options: any) => {
      targetObjects[targetId] = node;

      return () => {
        delete targetObjects[targetId];
      };
    },
    connectDragSource: (sourceId: Identifier, node: DisplayObject3d) => {
      return dragify(sourceId, node, node);
    },
    connectDragPreview: (sourceId: Identifier, node: DisplayObject3d) => {
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
