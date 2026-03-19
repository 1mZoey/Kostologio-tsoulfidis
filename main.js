import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // ← CRITICAL: This line must exist

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow = null;

app.whenReady().then(() => {
  console.log("🚀 Creating Electron window...");

  // 1. CREATE WINDOW FIRST
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#ffffff",
      symbolColor: "#1e293b",
      height: 42,
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 2. HANDLE EVENTS ON mainWindow (not win!)
  mainWindow.once("ready-to-show", () => {
    console.log("✅ Window ready, showing...");
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 3. LOAD CORRECT URL (Vite port 5173)
  mainWindow
    .loadURL("http://localhost:5173")
    .then(() => console.log("✅ Loaded localhost:5173"))
    .catch((err) => console.error("❌ Load failed:", err.message));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
