import ServicesIPC from "./ServicesIPC";
import ServerIPC from "./ServerIPC";
import ServerGRPC from "./ServerGRPC";

let isDev, version;
let serverIPC;
let serverGRPC;
const IPC_CHANNEL = "message";

const servicesIPC = new ServicesIPC();

if (process.argv[2] === "--subprocess") {
  isDev = false;
  version = process.argv[3];

  let socketName = process.argv[4];
  serverIPC = new ServerIPC(IPC_CHANNEL, socketName, servicesIPC);
  serverGRPC = new ServerGRPC(serverIPC);
} else {
  let { ipcRenderer } = require("electron");
  isDev = true;

  // If this is dev, we need to wait for socket to be ready
  ipcRenderer.on("set-socket", (event: any, { socketName }: any) => {
    serverIPC = new ServerIPC(IPC_CHANNEL, socketName, servicesIPC);
    serverGRPC = new ServerGRPC(serverIPC);
  });
}

console.log("Node Process Initiated, is Dev?", isDev);
