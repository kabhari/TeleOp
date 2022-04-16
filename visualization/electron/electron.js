const path = require('path');
const { app, BrowserWindow } = require('electron');

const isDev = process.env.IS_DEV == "true" ? true : false;

let { fork } = require('child_process')
let findOpenSocket = require('./find-open-socket')

let clientWin
let serverWin
let serverProcess

function createWindow(socketName) {
    // Create the browser window.
    clientWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
            nodeIntegration: true,
            contextIsolation: false //TODO we need to enable this https://www.electronjs.org/docs/latest/tutorial/context-isolation
        },
    });

    // and load the index.html of the app.
    // win.loadFile("index.html");
    clientWin.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../dist/ui/index.html')}`
    );

    clientWin.webContents.on('did-finish-load', () => {
      clientWin.webContents.send('set-socket', {
          socketName: socketName
        })
      })

    // Open the DevTools.
    if (isDev) {
      clientWin.webContents.openDevTools();
    }
}

function createBackgroundWindow(socketName) {
    const win = new BrowserWindow({
      x: 500,
      y: 300,
      width: 700,
      height: 500,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    })
    win.loadURL(`file://${path.join(__dirname, '../dist/bg/server-dev.html')}`)
  
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('set-socket', { socketName: socketName })
    })
  
    win.webContents.openDevTools();

    serverWin = win
    
  }

  function createBackgroundProcess(socketName) {
    serverProcess = fork(path.join(__dirname, '../dist/bg/Index.js'), [
      '--subprocess',
      app.getVersion(),
      socketName
    ])
  

    serverProcess.on('message', msg => {
      console.log(msg)
    })
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    
    serverSocket = await findOpenSocket()

    createWindow(serverSocket)

    if (isDev) {
        // TODO fix loading in browser window
        createBackgroundWindow(serverSocket)
        //createBackgroundProcess(serverSocket)
    } else {
        createBackgroundProcess(serverSocket)
    }

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (serverProcess) {
        serverProcess.kill()
        serverProcess = null
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});