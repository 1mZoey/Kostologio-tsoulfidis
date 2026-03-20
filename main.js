const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow = null;

app.whenReady().then(() => {
  console.log("🚀 Creating Electron window...");

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#ffffff",
      symbolColor: "#21252b",
      height: 48,
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    console.log("✅ Window ready, showing...");
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on('theme-change', (event, isDark) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#21252b' : '#f9fafb',
        symbolColor: isDark ? '#f8fafc' : '#21252b',
      });
    }
  });

  mainWindow.loadURL("http://localhost:5173")
    .then(() => console.log("✅ Loaded localhost:5173"))
    .catch((err) => console.error("❌ Load failed:", err.message));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
