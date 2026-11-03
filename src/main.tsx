import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { markPreloader } from "./lib/preloader";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Tell the preloader the app has painted once fonts are in.
requestAnimationFrame(() => {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  (fonts ? fonts.ready : Promise.resolve()).then(() => markPreloader("app"));
});
