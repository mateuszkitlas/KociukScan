import type * as electronT from "electron";
import type * as pdfkitT from "pdfkit";
import type { Sharp, SharpOptions, FitEnum } from "sharp";
export type { Sharp, OutputInfo, SharpOptions, FitEnum } from "sharp";

export const sharp: {
  (buf: Buffer | string, o?: SharpOptions): Sharp,
  fit: FitEnum
} = window.require("sharp");
export const pdfkit: (typeof pdfkitT)["default"] = window.require("pdfkit");
export const electron: (typeof electronT) = require('electron');
export const dialog = electron.remote.dialog;
