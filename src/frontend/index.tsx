import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App.js";
import { invoke } from "./utils.mjs";

const props = invoke(m => console.error(m))("init");

window.addEventListener(
  "DOMContentLoaded",
  async () =>
    void ReactDOM.render(
      <React.StrictMode>
        <App {...await props} />
      </React.StrictMode>,
      document.getElementById("root"),
    ),
);
