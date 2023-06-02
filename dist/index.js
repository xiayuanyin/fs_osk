import { jsx } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { StrictMode } from "react";
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(App, {}) })
);
