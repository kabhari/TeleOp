import ServicesIPC from "./ServicesIPC";
import ServerIPC from "./ServerIPC";
import ServerGRPC from "./ServerGRPC";
import { connect } from 'mongoose';
import "dotenv/config";

let host: string;
if (process.env["GRPC_HOST"]) {
  host = process.env["GRPC_HOST"];
} else {
  console.error("Please check the .env file", process.env);
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

console.log("Node Process Initiated, is Dev?", isDev);

/* database */
run_db()
  .then(res => console.info("Mongo is connected!"))
  .catch(err => console.log(err));

async function run_db() {
  //Set up default mongoose connection
  var mongoDB = 'mongodb://127.0.0.1/cathpilot';
  await connect(mongoDB);
}