import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { invoke } from "./utils";

const props = invoke("init");

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
