import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("無法找到 root 元素");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
