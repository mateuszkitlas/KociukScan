import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";

const extensions = ["ts", "js"].flatMap(e => [`m${e}`, `c${e}`, e]).map(e => `.${e}`);

const path = pth => fileURLToPath(new URL(pth, import.meta.url));
export default [
  {
    stats: "minimal",
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/frontend/index.tsx",
    target: "electron-renderer",
    module: {
      rules: [
        {
          test: /\.([cm]?ts|tsx)$/,
          use: "ts-loader",
          include: /src/,
          resolve: {
            extensionAlias: {
              ".js": [".js", ".ts", ".tsx"],
              ".cjs": [".cjs", ".cts"],
              ".mjs": [".mjs", ".mts"],
            },
          },
        },
      ],
    },
    resolve: { extensions: [...extensions, ".tsx", ".jsx"] },
    plugins: [new CopyWebpackPlugin({ patterns: [{ from: "static", to: "./" }] })],
    output: { path: path("./dist"), filename: "renderer.cjs", publicPath: "/" },
  },
  {
    stats: "minimal",
    resolve: {
      extensions,
      alias: { "iconv-lite": false },
    },
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/backend/index.mts",
    target: "electron-main",
    module: {
      rules: [
        {
          test: /\.[cm]?ts$/,
          include: /src/,
          use: "ts-loader",
          resolve: {
            extensionAlias: {
              ".js": [".js", ".ts"],
              ".cjs": [".cjs", ".cts"],
              ".mjs": [".mjs", ".mts"],
            },
          },
        },
      ],
    },
    externals: { sharp: "commonjs sharp" },
    output: { path: path("./dist"), filename: "index.cjs" },
  },
];
