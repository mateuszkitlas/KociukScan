import { renderToStaticMarkup } from "react-dom/server.js";
import { createElement } from "react";
import { IconType } from "react-icons/lib";
import { genInvoke, genInvoked } from "../native/utils.mjs";
import type { MainEndpoints } from "../backend/endpoints.mjs";
import { ipcRenderer } from "electron";

export const reactSvgComponentToMarkupString = (component: IconType) =>
  `url(data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(component)))})`;

export const invoke = Object.assign(
  genInvoke<MainEndpoints>((...args) => ipcRenderer.invoke(...args)),
  {
    cb: genInvoked<MainEndpoints>((...args) => ipcRenderer.invoke(...args)),
  },
);
export type InitProps = Awaited<ReturnType<MainEndpoints["init"]>>;
