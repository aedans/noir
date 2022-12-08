import anime from "animejs";
import { BackendFactory, DragDropManager } from "dnd-core";
import { IDisplayObject3d } from "pixi-projection";
import { DisplayObject, Ticker } from "pixi.js";

type Identifier = string | symbol;
type DisplayObject3d = DisplayObject & IDisplayObject3d;

const PIXIBackend: BackendFactory = (manager: DragDropManager) => {
  let currentObject: DisplayObject3d | null = null;
  let targetObjects: { [id: Identifier]: DisplayObject3d } = {};

  return {
    setup: () => {},
    teardown: () => {},
    profile: () => ({}),
    connectDropTarget: (targetId: Identifier, node: DisplayObject3d) => {
      targetObjects[targetId] = node;

      return () => {
        delete targetObjects[targetId];
      };
    },
    connectDragSource: (sourceId: Identifier, node: DisplayObject3d) => {
      (node as any).convertTo3d();
      let ddx = 0;
      let ddy = 0;
      let initIndex: number | null = null;

      function mouseDownListener(e: any) {
        if (currentObject == null) {
          currentObject = node;
          initIndex = node.zIndex;
          node.zIndex = 100;
          node.parent.sortChildren();

          const pos = node.parent.toLocal(e.data.global);
          manager.getActions().beginDrag([sourceId], {
            clientOffset: pos,
            getSourceClientOffset: () => null,
          });
        }
      }

      function mouseMoveListener(e: MouseEvent) {
        if (currentObject == node) {
          anime.remove(node.transform.position);
          ddx += e.x - node.getGlobalPosition().x;
          ddy += e.y - node.getGlobalPosition().y;

          const pos = node.parent.toLocal(e);
          if (manager.getMonitor().isDragging()) {
            node.position.copyFrom(pos);
          }

          const matchingTargetIds = Object.keys(targetObjects).filter((key) =>
            targetObjects[key].getBounds().contains(e.x, e.y)
          );

          manager.getActions().hover(matchingTargetIds, {
            clientOffset: pos,
            getSourceClientOffset: () => null,
          });
        }
      }

      function mouseUpListener(e: MouseEvent) {
        if (currentObject == node) {
          currentObject = null;
          manager.getActions().drop();

          if (initIndex) {
            node.zIndex = initIndex;
            node.parent.sortChildren();
          }

          manager.getActions().endDrag();
        }
      }

      function onTick(dt: number) {
        if (manager.getMonitor().isDragging()) {
          ddx *= 0.9;
          ddy *= 0.9;
        } else {
          ddx = ddy = 0;
        }

        ddx = Math.max(-50, Math.min(ddx, 50));
        ddy = Math.max(-50, Math.min(ddy, 50));

        node.euler.yaw = ddx / 100;
        node.euler.pitch = -ddy / 100;
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
      };
    },
    connectDragPreview: (sourceId: Identifier, node: DisplayObject3d) => {
      throw "TODO";
    },
  };
};

export default PIXIBackend;
