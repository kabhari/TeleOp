import { AppState } from "./../shared/Enums";
import sessionModel, { ISession } from "./data/models/session.model";
// This is a Singleton
export default class AppContext {
  private static instance: AppContext;
  // TODO build the correct type
  session: any;
  URL_HOST: string;
  URL_MONGODB: string;
  IPC_CHANNEL: string;

  appState: AppState;
  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    if (process.env["GRPC_HOST"] && process.env["MONGO_HOST"]) {
      this.URL_HOST = process.env["GRPC_HOST"];
      this.URL_MONGODB = process.env["MONGO_HOST"];
    } else {
      console.error(
        "Please check the .env file to ensure it includes the GRPC and MongoDB host",
        process.env
      );
      process.exit(1);
    }
    this.IPC_CHANNEL = "message";

    this.appState = AppState.CONNECTING_C;

    // save the session & the time it's created in the database
    // the id of the session (i.e. session._id) is injected and referenced in other collections
    this.session = new sessionModel({
      session_started: new Date(),
    } as ISession);
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
