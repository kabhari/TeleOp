import ServicesIPC from "./ipc/services";
import ServerIPC from "./ipc/Server";
import ServerGRPC from "./grpc/server";
import { connect } from "mongoose";
import "dotenv/config";

let host: string;
let mongoDB: string;

if (process.env["GRPC_HOST"] && process.env["MONGO_HOST"]) {
  host = process.env["GRPC_HOST"];
  mongoDB = process.env["MONGO_HOST"];
} else {
  console.error(
    "Please check the .env file to ensure it includes the GRPC and MongoDB host",
    process.env
  );
  process.exit(1);
}

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
  serverGRPC = new ServerGRPC(serverIPC, host);
} else {
  let { ipcRenderer } = require("electron");
  isDev = true;

  // If this is dev, we need to wait for socket to be ready
  ipcRenderer.on("set-socket", (event: any, { socketName }: any) => {
    serverIPC = new ServerIPC(IPC_CHANNEL, socketName, servicesIPC);
    serverGRPC = new ServerGRPC(serverIPC, host);
  });
}

connect(mongoDB).catch((err: any) => {
  console.error("something went wrong when connecting to Database", err);
});

console.log("Node Process Initiated, is Dev?", isDev);
