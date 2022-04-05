
import serverHandlers from './server-handlers'
import serverIpc from './server-ipc'

let isDev, version

if (process.argv[2] === '--subprocess') {
  isDev = false
  version = process.argv[3]

  let socketName = process.argv[4]
  serverIpc.init(socketName, serverHandlers)
} else {
  let { ipcRenderer } = require('electron')
  isDev = true

  ipcRenderer.on('set-socket', (event: any, { name  }:any) => {
    serverIpc.init(name, serverHandlers)
  })
}

console.log("Node Process Started, is Dev?", isDev)