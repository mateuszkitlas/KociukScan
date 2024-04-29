import { join } from "path";
import { registerMainEndpoints } from "./endpoints.mjs";
import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    //icon: path.join(__dirname, "build/favicon.ico"),
    webPreferences: {
      preload: join(__dirname, "renderer.cjs"),
    },
    frame: false,
  });
  win.webContents.openDevTools();
  win.setMenuBarVisibility(false);
  win.loadFile(join(__dirname, "index.html"));
};

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());

await app.whenReady();
await registerMainEndpoints(app);
createWindow();
app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
