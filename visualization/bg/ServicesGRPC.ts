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
} from "../proto/coordinate";

import ServerIPC from "./ServerIPC";
import CoordinateModel from "./Data/Models/coord.model";
import SessionModel from "./Data/Models/session.model";

// TODO this needs to be inside the class
let _serverIPC: ServerIPC;

class Coordinate implements CoordinateServer {
  // the session variable is the model we use to save the information about session in mongo
  // refer to ./Data/Models/session.model for more
  static session: any;

  // we will save the session model in the constructor
  constructor(serverIPC: ServerIPC) {
    _serverIPC = serverIPC;

    // save the session & the time it's created in the database
    // the id of the session (i.e. session._id) is referenced in other collections
    Coordinate.session = new SessionModel({
      session_started: Date.now()
    });
    Coordinate.session.save();
  }

  [method: string]: UntypedHandleCall;

  public receiveCoordination(
    call: ServerReadableStream<CoordinateRequest, CoordinateResponse>,
    callback: sendUnaryData<CoordinateResponse>
  ): void {
    call
      .on("data", (req: CoordinateRequest) => {
        console.debug("Received CoordinateRequest:", req.x, req.y);

        // Save the data in the database
        const coordinate = new CoordinateModel({
          x_coordinate: req.x,
          y_coordinate: req.y,
          t_coordinate: Date.now(),
          session_id: Coordinate.session._id
        });
        coordinate.save();

        // Forward the data over the IPC channel
        _serverIPC.push("coordinate", req);
      })
      .on("end", () => {
        // save the end time in the session collection
        Coordinate.session.session_ended = Date.now();
        Coordinate.session.save();

        callback(null, { message: "got the stream" } as CoordinateResponse);
      })
      .on("error", (err: Error) => {
        console.error("Something went wrong", err.message);
      });
  }
}

export { Coordinate, CoordinateService };
