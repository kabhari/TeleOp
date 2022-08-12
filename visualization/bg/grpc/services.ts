import {
  sendUnaryData,
  ServerReadableStream,
  UntypedHandleCall,
} from "@grpc/grpc-js";

import {
  CoordinateServer,
  CoordinateService,
  CoordinateRequest,
  CoordinateResponse,
} from "../../proto/coordinate";

import ServerIPC from "../ipc/server";
import CoordinatesModel, {
  ICoordinate,
  ICoordinates,
} from "../data/models/coordinates.model";
import AppContext from "../appContext";

class Coordinate implements CoordinateServer {
  [method: string]: UntypedHandleCall;

  // the session variable is the model we use to save the information about session in mongo
  // refer to ./Data/Models/session.model for more
  static appContext: AppContext;
  static serverIPC: ServerIPC;
  // TODO: above lines might have concurrency issues, needs to be investigated

  // we will save the session model in the constructor
  constructor(serverIPC: ServerIPC) {
    Coordinate.serverIPC = serverIPC;
    Coordinate.appContext = AppContext.getInstance();
  }

  // Instruments to buffer data and throttle the DB calls
  static bufferCoordinates: ICoordinate[] = [];
  static inThrottle: boolean = false;
  static async saveCoordinate(coord: ICoordinate) {
    // Add data to buffer
    Coordinate.bufferCoordinates.push(coord);

    if (!Coordinate.inThrottle) {
      Coordinate.inThrottle = true;
      setTimeout(() => {
        console.log(`DB save size: ~${Coordinate.bufferCoordinates.length}`);

        // Save buffer data to DB Asynchronously
        const coordinates = new CoordinatesModel({
          data: Coordinate.bufferCoordinates,
          t_start: Coordinate.bufferCoordinates[0].t,
          session_id: Coordinate.appContext.session._id,
        } as ICoordinates);
        Coordinate.bufferCoordinates = [];
        coordinates.save();
        Coordinate.inThrottle = false;
      }, 1000);
    }
  }

  public streamCoordinations(
    call: ServerReadableStream<CoordinateRequest, CoordinateResponse>,
    callback: sendUnaryData<CoordinateResponse>
  ): void {
    call
      .on("data", async (req: CoordinateRequest) => {
        const coordinate = {
          x: req.x,
          y: req.y,
          t: new Date(),
        } as ICoordinate;
        Coordinate.saveCoordinate(coordinate);
        // Forward the data over the IPC channel
        Coordinate.serverIPC.streamCoordinate(coordinate);
      })
      .on("end", () => {
        // TODO we need to refine this, save the session end etc.
        // save the end time in the session collection
        Coordinate.appContext.session.session_ended = Date;
        //Coordinate.appContext.session.save();

        //callback(null, { message: "got the stream" } as CoordinateResponse);
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong", err.message);
      });
  }
}

export { Coordinate, CoordinateService };
