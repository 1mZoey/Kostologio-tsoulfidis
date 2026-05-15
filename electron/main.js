const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) {
  app.quit();
  return;
}

let mainWindow = null;
let serverInstance = null;

app.setAppUserModelId("com.zoitsoulfidou.kostologio_app");

async function startServer() {
  try {
    console.log("[Main] Starting server initialization...");
    console.log("[Main] __dirname:", __dirname);
    console.log(
      "[Main] MAIN_WINDOW_VITE_DEV_SERVER_URL:",
      MAIN_WINDOW_VITE_DEV_SERVER_URL,
    );

    // Determine the server path based on whether we're in dev or production
    let serverPath;
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      serverPath = path.resolve(process.cwd(), "server/server.js");
    } else {
      serverPath = path.resolve(process.resourcesPath, "server/server.js");
    }

    console.log("[Main] Resolved server path:", serverPath);

    // Import the ES module
    const serverModule = await import(`file://${serverPath}`);
    const { startServer: initServer } = serverModule;

    console.log("[Main] Server module imported successfully");

    // Start the server
    serverInstance = await initServer(5000);
    console.log("[Main] Server started successfully on port 5000");
    return true;
  } catch (error) {
    console.error("[Main] Failed to start server:", error);
    console.error("[Main] Error stack:", error.stack);
    throw error;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
  });
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  // Close the server when the app closes
  if (serverInstance) {
    serverInstance.close();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (serverInstance) {
    serverInstance.close();
  }
});
