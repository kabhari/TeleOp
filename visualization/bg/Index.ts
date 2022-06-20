import ServicesIPC from "./ipc/services";
import ServerIPC from "./ipc/Server";
import ServerGRPC from "./grpc/server";
import { connect } from "mongoose";
import "dotenv/config";
import AppContext from "./appContext";

async function run_bg() {
  const appContext = AppContext.getInstance();

  let isDev, version;
  let serverIPC;
  let serverGRPC;

  const servicesIPC = new ServicesIPC();

  if (process.argv[2] === "--subprocess") {
    isDev = false;
    version = process.argv[3];

    let socketName = process.argv[4];
    serverIPC = new ServerIPC(appContext.IPC_CHANNEL, socketName, servicesIPC);
    serverGRPC = new ServerGRPC(serverIPC, appContext.URL_HOST);
  } else {
    let { ipcRenderer } = require("electron");
    isDev = true;

    // If this is dev, we need to wait for socket to be ready
    ipcRenderer.on("set-socket", (event: any, { socketName }: any) => {
      serverIPC = new ServerIPC(
        appContext.IPC_CHANNEL,
        socketName,
        servicesIPC
      );
      serverGRPC = new ServerGRPC(serverIPC, appContext.URL_HOST);
    });
  }

  await connect(appContext.URL_MONGODB);
  appContext.session.save();

  console.log("Node Process Initiated, is Dev?", isDev);
}

run_bg().catch((err) => {
  console.error("fatal error in BG", err);
});
