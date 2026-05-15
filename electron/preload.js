const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setTheme: (isDark) => ipcRenderer.send("theme-change", isDark)
});