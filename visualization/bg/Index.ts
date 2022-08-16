import ServicesIPC from "./ipc/services";
import ServerIPC from "./ipc/Server";
import ServerGRPC from "./grpc/server";
import { connect } from "mongoose";
import "dotenv/config";
import AppContext from "./appContext";

async function run_bg() {
  const appContext = AppContext.getInstance();

  await connect(AppContext.URL_MONGODB);
  AppContext.session.save();

  console.log("Node Process Initiated, is Dev?", AppContext.isDev);
}

run_bg().catch((err) => {
  console.error("fatal error in BG", err);
});
