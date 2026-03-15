const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let apiProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = process.env.ELECTRON_IS_DEV;
  if(isDev){
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'cloent/dist/index.html'));
  }
  // Load your React frontend (adjust URL)
  win.loadURL('http://localhost:3000'); // Your Vite dev server
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Start your Express API server
  apiProcess = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit', 
    cwd: __dirname,
    shell: true 
  });
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
