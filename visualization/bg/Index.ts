import ServicesIPC from "./ServicesIPC";
import ServerIPC from "./ServerIPC";
import grpcInit from "./ServerGRPC";

let isDev, version;
let serverIPC;
const IPC_CHANNEL = "message";

const servicesIPC = new ServicesIPC();

if (process.argv[2] === "--subprocess") {
  isDev = false;
  version = process.argv[3];

  let socketName = process.argv[4];
  serverIPC = new ServerIPC(IPC_CHANNEL, socketName, servicesIPC);
} else {
  let { ipcRenderer } = require("electron");
  isDev = true;

  ipcRenderer.on("set-socket", (event: any, { name }: any) => {
    serverIPC = new ServerIPC(IPC_CHANNEL, name, servicesIPC);
  });
}

grpcInit();

console.log("Node Process Initiated, is Dev?", isDev);
