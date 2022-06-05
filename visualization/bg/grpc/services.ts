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
import CoordinateModel from "../data/models/coord.model";
import SessionModel from "../data/models/session.model";

let counter = 0;
let lastHzCalculate = Date.now();

class Coordinate implements CoordinateServer {
  [method: string]: UntypedHandleCall;

  // the session variable is the model we use to save the information about session in mongo
  // refer to ./Data/Models/session.model for more
  static session: any;
  static serverIPC: ServerIPC;
  // TODO: above lines might have concurrency issues, needs to be investigated

  // we will save the session model in the constructor
  constructor(serverIPC: ServerIPC) {
    Coordinate.serverIPC = serverIPC;

    // save the session & the time it's created in the database
    // the id of the session (i.e. session._id) is referenced in other collections
    Coordinate.session = new SessionModel({
      session_started: Date.now(),
    });
    Coordinate.session.save();
  }

  public receiveCoordination(
    call: ServerReadableStream<CoordinateRequest, CoordinateResponse>,
    callback: sendUnaryData<CoordinateResponse>
  ): void {
    call
      .on("data", (req: CoordinateRequest) => {
        // Calculate the Hz
        counter += 1;
        if (counter == 1000) {
          const now = Date.now();
          console.log(
            `Incoming GRPC rate: ${Math.round(
              (1000 * 1000) / (now - lastHzCalculate)
            )}Hz`
          );
          lastHzCalculate = now;
          counter = 0;
        }

        // Save the data in the database
        const coordinate = new CoordinateModel({
          x_coordinate: req.x,
          y_coordinate: req.y,
          t_coordinate: Date.now(),
          session_id: Coordinate.session._id,
        });
        coordinate.save();

        // Forward the data over the IPC channel
        Coordinate.serverIPC.push("coordinate", req);
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
