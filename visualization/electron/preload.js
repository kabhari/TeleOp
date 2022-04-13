
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})


const { ipcRenderer } = require('electron')
const ipc = require('node-ipc')
const uuid = require('uuid')

const isDev = process.env.IS_DEV == "true" ? true : false;

let resolveSocketPromise
let socketPromise = new Promise(resolve => {
  resolveSocketPromise = resolve
})

window.IS_DEV = isDev

window.getServerSocket = () => {
  return socketPromise
}

ipcRenderer.on('set-socket', (event, { socketName }) => {
  resolveSocketPromise(socketName)
})

window.ipcConnect = (socketName, callBack) => {
  ipc.config.silent = true
  ipc.connectTo(socketName, () => {
    callBack(ipc.of[socketName])
  })
}
window.uuid = uuid
