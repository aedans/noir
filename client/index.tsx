import * as React from "react";
import { createRoot } from "react-dom/client";
import Noir from "./Noir";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<Noir />);
