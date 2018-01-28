const { app, BrowserWindow } = require('electron');
const path = require( 'path' );
let mainWindow;
app.on( 'ready', () => {
  mainWindow = new BrowserWindow();
  // 讀取主要的html
  mainWindow.loadURL( path.join('file://', __dirname, 'index.html'));
  // 開啟debug tool
  mainWindow.webContents.openDevTools({
    detach: true,
  });
});
