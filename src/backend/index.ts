import { endpoints } from "./endpoints";
import { app, BrowserWindow, ipcMain } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    //icon: path.join(__dirname, "build/favicon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  win.setMenuBarVisibility(false);
  win.loadFile("./index.html")
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

(async () => {
  await app.whenReady()
  Object.entries(await endpoints(app)).forEach(([k, v]) => 
    ipcMain.handle(k, (_ev, ...args) => (v as any)(...args))
  );
  createWindow();
  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
})();




