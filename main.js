import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

// Workaround for __filename and __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional, if using a preload script
      nodeIntegration: false,      // Good practice to keep this false
      contextIsolation: true,      // Keep this true for security
      enableRemoteModule: false,   // Disable remote module to enhance security
      webSecurity: false,          // Set to false for local media resources (use cautiously)
      allowRunningInsecureContent: true,  // To allow certain media types
    },
  });

  // Load the Express app's URL (running on localhost)
  win.loadURL('http://localhost:3000');
}


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


