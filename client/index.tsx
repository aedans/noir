import { Loader } from "pixi.js";
import * as React from "react";
import { createRoot } from "react-dom/client";
import Noir from "./Noir";

Loader.shared.add("Oswald", "./Oswald.fnt").load(() => {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  root.render(<Noir />);
});
