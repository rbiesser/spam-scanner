const { app, BrowserWindow, screen, Menu } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');

const menuTemplate = require('./electron/menu')

let mainWindow;

function createWindow() {
  // start full screen, use css for min-width
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: width, 
    height: height,
    minWidth: 1281,
    minHeight: 800,
    // backgroundColor: '#312450',
    // show: false,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png')
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});