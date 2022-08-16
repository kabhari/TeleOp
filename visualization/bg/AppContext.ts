import { CalibrationEvent } from "./calibration";
import { AppState } from "./../shared/Enums";
import sessionModel, { ISession } from "./data/models/session.model";
import ServerGRPC from "./grpc/server";
import ServerIPC from "./ipc/Server";
// This is a Singleton
export default class AppContext {
  private static instance: AppContext;
  // TODO build the correct type
  static session: any;
  static URL_HOST: string;
  static URL_MONGODB: string;
  static IPC_CHANNEL: string;

  static isDev: boolean;
  static version: string;

  static serverIPC: ServerIPC;
  static serverGRPC: ServerGRPC;

  static lastCalibrationEvent: CalibrationEvent;

  private static appState: AppState;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    if (process.env["GRPC_HOST"] && process.env["MONGO_HOST"]) {
      AppContext.URL_HOST = process.env["GRPC_HOST"];
      AppContext.URL_MONGODB = process.env["MONGO_HOST"];
    } else {
      console.error(
        "Please check the .env file to ensure it includes the GRPC and MongoDB host",
        process.env
      );
      process.exit(1);
    }
    AppContext.IPC_CHANNEL = "message";

    AppContext.appState = AppState.WAITING_GRPC;

    // save the session & the time it's created in the database
    // the id of the session (i.e. session._id) is injected and referenced in other collections
    AppContext.session = new sessionModel({
      session_started: new Date(),
    } as ISession);

    // Now start the servers

    if (process.argv[2] === "--subprocess") {
      AppContext.isDev = false;
      AppContext.version = process.argv[3];

      let socketName = process.argv[4];
      AppContext.serverIPC = new ServerIPC(AppContext.IPC_CHANNEL, socketName);
      AppContext.serverGRPC = new ServerGRPC(AppContext.URL_HOST);
    } else {
      let { ipcRenderer } = require("electron");
      AppContext.isDev = true;
      AppContext.version = "dev";

      // If this is dev, we need to wait for socket to be ready
      ipcRenderer.on("set-socket", (event: any, { socketName }: any) => {
        AppContext.serverIPC = new ServerIPC(
          AppContext.IPC_CHANNEL,
          socketName
        );
        AppContext.serverGRPC = new ServerGRPC(AppContext.URL_HOST);
      });
    }
  }

  public static setAppState(appState: AppState) {
    AppContext.appState = appState;
    AppContext.serverIPC.pushAppState(appState);
  }
  public static getAppState(): AppState {
    return AppContext.appState;
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): AppContext {
    if (!AppContext.instance) {
      AppContext.instance = new AppContext();
    }

    return AppContext.instance;
  }
}
